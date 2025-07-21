import { marked, Token, Tokens } from 'marked'
import { PDFDocument, PDFFont, PDFPage, RGB } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {
  extractTextFromTokens,
  embedImage,
  getFontForSegment,
  getFontLoader,
  parseImageAttributes,
  parseInlineTokens,
  partitionTokens,
  sanitizeText,
  splitTextToFit,
  FontLoader
} from './helpers'
import { PDF_THEME } from './pdfConfig'
import { markedExtensions } from './markedExtensions'

marked.use({ extensions: markedExtensions })

type RenderResult = {
  needsNewPage?: boolean
}

export class PDFRenderer {
  #pdfDoc: PDFDocument
  #page: PDFPage
  #maxWidth: number
  #tokens: Token[]
  #loadFont: FontLoader
  #pageHeight: number
  #yPosition = 0

  constructor(content: string) {
    const sanitizedMarkdown = sanitizeText(content)
    this.#tokens = marked.lexer(sanitizedMarkdown)
  }

  /**
   * Converts markdown text to a PDF document.
   *
   * This method processes markdown content through the following steps:
   * 1. Sanitizes text for PDF compatibility (typographic characters)
   * 2. Creates a new PDF document and loads fonts
   * 3. Parses markdown into tokens
   * 4. Renders each token type to the PDF
   * 5. Handles page breaks automatically
   *
   * @returns Promise resolving to the PDF as an ArrayBuffer
   */
  async renderAsArrayBuffer() {
    await this.#setupPdfDoc()

    for (const token of this.#tokens) {
      let result = await this.#renderToken(token)

      if (result.needsNewPage) {
        this.#page = this.#pdfDoc.addPage()
        this.#yPosition = this.#pageHeight - PDF_THEME.layout.margin
        result = await this.#renderToken(token)
      }

      if (this.#yPosition < PDF_THEME.layout.margin) {
        this.#page = this.#pdfDoc.addPage()
        this.#yPosition = this.#pageHeight - PDF_THEME.layout.margin
      }
    }

    const pdfBytes = await this.#pdfDoc.save()
    return pdfBytes.buffer as ArrayBuffer
  }

  async #setupPdfDoc() {
    this.#pdfDoc = await PDFDocument.create()
    this.#pdfDoc.registerFontkit(fontkit)
    this.#loadFont = getFontLoader(this.#pdfDoc)
    this.#page = this.#pdfDoc.addPage()
    this.#pageHeight = this.#page.getHeight()
    this.#maxWidth = this.#page.getWidth() - PDF_THEME.layout.margin * 2
  }

  /**
   * Renders a markdown token to the PDF page by delegating to the appropriate renderer method.
   *
   * This method acts as a dispatcher that routes different token types to their specific
   * rendering methods. It handles all supported markdown token types including headings,
   * paragraphs, code blocks, lists, blockquotes, tables, horizontal rules, and spaces.
   *
   * @param token - The markdown token to render
   */
  #renderToken(token: Token): Promise<RenderResult> | RenderResult {
    switch (token.type) {
      case 'heading':
        return this.#renderHeading(token as Tokens.Heading)
      case 'paragraph':
        return this.#renderParagraph(token as Tokens.Paragraph)
      case 'code':
        return this.#renderCodeBlock(token as Tokens.Code)
      case 'list':
        return this.#renderList(token as Tokens.List)
      case 'blockquote':
        return this.#renderBlockquote(token as Tokens.Blockquote)
      case 'table':
        return this.#renderTable(token as Tokens.Table)
      case 'hr':
        return this.#renderHorizontalRule()
      case 'space':
        this.#yPosition - PDF_THEME.spacing.forSpaceToken
      default:
        return { needsNewPage: false }
    }
  }

  /**
   * Renders a heading token to the PDF page with appropriate font size and spacing.
   *
   * @param token - The markdown heading token containing text and depth level
   */
  async #renderHeading(token: Tokens.Heading): Promise<RenderResult> {
    const fontSize = PDF_THEME.font[`h${token.depth}`]
    const marginBottom = PDF_THEME.spacing[`afterH${token.depth}`]
    const lineHeight = fontSize * 1.4

    const lines = splitTextToFit(
      token.text,
      await this.#loadFont('bold'),
      fontSize,
      this.#page.getWidth() - PDF_THEME.layout.margin * 2
    )

    this.#yPosition - fontSize

    if (this.#yPosition - fontSize - lines.length * lineHeight < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    for (const line of lines) {
      this.#page.drawText(line, {
        x: PDF_THEME.layout.margin,
        y: this.#yPosition,
        size: fontSize,
        font: await this.#loadFont('bold'),
        color: PDF_THEME.color.text
      })
      this.#yPosition -= lineHeight
    }

    this.#yPosition -= marginBottom
    return { needsNewPage: false }
  }

  /**
   * Renders a paragraph token to the PDF page, handling inline formatting and images.
   *
   * @param token - The markdown paragraph token containing inline tokens
   */
  async #renderParagraph(token: Tokens.Paragraph): Promise<RenderResult> {
    const lineHeight = PDF_THEME.font.lineHeight
    const margin = PDF_THEME.layout.margin

    let currentX = margin

    this.#yPosition -= PDF_THEME.spacing.beforeParagraph

    const wrapLine = () => {
      const localY = this.#yPosition - lineHeight
      currentX = margin

      return localY < PDF_THEME.layout.pageBottom
    }

    if (token.tokens.length === 1 && token.tokens[0].type === 'image') {
      const imageToken = token.tokens[0] as Tokens.Image
      const attrs = parseImageAttributes(imageToken.text)

      if (attrs.display === 'block') {
        return this.#renderImage(imageToken, margin, this.#maxWidth)
      }
    }

    if (this.#yPosition - lineHeight < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    for (const inlineToken of token.tokens) {
      if (inlineToken.type === 'image') {
        const attrs = parseImageAttributes(inlineToken.text)

        if (attrs.display === 'inline') {
          const imageWidth = attrs.width + PDF_THEME.math.inlineModePadding

          if (currentX + imageWidth > margin + this.#maxWidth && currentX > margin && wrapLine()) {
            return { needsNewPage: true }
          }

          const imageResult = await embedImage(this.#pdfDoc, inlineToken.href)
          const yOffset = (attrs.height - PDF_THEME.font.baseSize) / 2

          this.#page.drawImage(imageResult.image, {
            x: currentX,
            y: this.#yPosition - yOffset,
            width: attrs.width,
            height: attrs.height
          })

          currentX += imageWidth
        } else {
          if (currentX > margin && wrapLine()) {
            return { needsNewPage: true }
          }

          const imageRenderResult = await this.#renderImage(
            inlineToken as Tokens.Image,
            margin,
            this.#maxWidth
          )

          if (imageRenderResult.needsNewPage) {
            return { needsNewPage: true }
          }

          currentX = margin
        }

        continue
      }

      const segments = parseInlineTokens([inlineToken])

      for (const segment of segments) {
        const font = await getFontForSegment(segment, this.#loadFont)
        let fontSize: number = PDF_THEME.font.baseSize
        let yOffset = 0

        if (segment.subscript || segment.superscript) {
          fontSize = PDF_THEME.font.subSupSize
          yOffset = segment.subscript ? PDF_THEME.offset.subscript : PDF_THEME.offset.superscript
        }

        const textLines = segment.text.split('\n')

        for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
          const lineText = textLines[lineIndex]
          const words = lineText.split(' ')

          for (const word of words) {
            if (!word) {
              continue
            }

            const wordWithSpace = word + ' '
            const wordWidth = font.widthOfTextAtSize(wordWithSpace, fontSize)

            if (currentX + wordWidth > margin + this.#maxWidth && currentX > margin && wrapLine()) {
              return { needsNewPage: true }
            }

            this.#page.drawText(wordWithSpace, {
              x: currentX,
              y: this.#yPosition + yOffset,
              font,
              size: fontSize,
              color: segment.color || PDF_THEME.color.text
            })

            if (segment.underline) {
              const underlineY = this.#yPosition + yOffset + PDF_THEME.underline.offset

              this.#page.drawLine({
                start: { x: currentX, y: underlineY },
                end: { x: currentX + wordWidth, y: underlineY },
                thickness: PDF_THEME.underline.thickness,
                color: segment.color || PDF_THEME.color.text
              })
            }

            if (segment.strikeThrough) {
              const strikeThroughY =
                this.#yPosition + yOffset + (fontSize / 2 - PDF_THEME.strikeThrough.thickness)

              this.#page.drawLine({
                start: { x: currentX, y: strikeThroughY },
                end: { x: currentX + wordWidth, y: strikeThroughY },
                thickness: PDF_THEME.strikeThrough.thickness
              })
            }

            currentX += wordWidth
          }

          if (lineIndex < textLines.length - 1 && wrapLine()) {
            return { needsNewPage: true }
          }
        }
      }
    }

    this.#yPosition -= PDF_THEME.spacing.afterParagraph
    return { needsNewPage: false }
  }

  /**
   * Renders a code block token to the PDF page with background and monospace font.
   *
   * @param token - The markdown code token containing the code text
   */
  async #renderCodeBlock(token: Tokens.Code): Promise<RenderResult> {
    const fontSize = PDF_THEME.font.codeSize
    const lineHeight = PDF_THEME.font.codeLineHeight
    const padding = PDF_THEME.codeBlock.padding
    const margin = PDF_THEME.layout.margin

    const lines = token.text.split('\n')
    const blockHeight = lines.length * lineHeight + padding * 2

    if (this.#yPosition - blockHeight < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    this.#yPosition -= blockHeight

    this.#page.drawRectangle({
      x: margin,
      y: this.#yPosition,
      width: this.#maxWidth,
      height: blockHeight,
      color: PDF_THEME.color.codeBlockBg
    })

    this.#yPosition -= padding - fontSize

    for (const line of lines) {
      this.#page.drawText(line, {
        x: margin + padding,
        y: this.#yPosition,
        size: fontSize,
        font: await this.#loadFont('mono'),
        color: PDF_THEME.color.codeBlockText
      })
      this.#yPosition -= lineHeight
    }

    this.#yPosition -= PDF_THEME.spacing.afterCodeBlock
    return { needsNewPage: false }
  }

  /**
   * Renders a list token to the PDF page, supporting both ordered and unordered lists with nested items.
   *
   * @param token - The markdown list token containing list items
   * @param level - Nesting level for indentation (default: 0)
   */
  async #renderList(token: Tokens.List, level = 0): Promise<RenderResult> {
    const margin = PDF_THEME.layout.margin
    const indent = margin + level * PDF_THEME.spacing.listItemIndent
    const bulletChar = token.ordered ? '1.' : '•'
    const lineHeight = PDF_THEME.font.listItemLineHeight

    for (let i = 0; i < token.items.length; i++) {
      const item = token.items[i]

      if (this.#yPosition - PDF_THEME.spacing.listItemYDecrement < PDF_THEME.layout.pageBottom) {
        return { needsNewPage: true }
      }

      this.#yPosition -= PDF_THEME.spacing.listItemYDecrement

      const bullet = token.ordered ? `${i + 1}.` : bulletChar
      this.#page.drawText(bullet, {
        x: indent,
        y: this.#yPosition,
        size: PDF_THEME.font.listBulletSize,
        font: await this.#loadFont('regular'),
        color: PDF_THEME.color.text
      })

      const { textTokens, imageTokens } = partitionTokens(item.tokens)

      for (const imageToken of imageTokens) {
        const imageResult = await this.#renderImage(
          imageToken as Tokens.Image,
          indent + 20,
          this.#maxWidth - (indent + 20 - margin)
        )

        if (imageResult.needsNewPage) {
          return { needsNewPage: true }
        }
      }

      if (textTokens.length > 0) {
        const itemText = extractTextFromTokens(textTokens)
        const lines = splitTextToFit(
          itemText,
          await this.#loadFont('regular'),
          PDF_THEME.font.baseSize,
          this.#maxWidth - (indent + 20 - margin)
        )

        for (const line of lines) {
          if (this.#yPosition < PDF_THEME.layout.pageBottom) {
            return { needsNewPage: true }
          }

          this.#page.drawText(line, {
            x: indent + 20,
            y: this.#yPosition,
            size: PDF_THEME.font.baseSize,
            font: await this.#loadFont('regular'),
            color: PDF_THEME.color.text
          })
          this.#yPosition -= lineHeight
        }
      }

      if (item.tokens) {
        for (const nestedToken of item.tokens) {
          if (nestedToken.type === 'list') {
            const result = await this.#renderList(nestedToken as Tokens.List, level + 1)

            if (result.needsNewPage) {
              return { needsNewPage: true }
            }
          }
        }
      }
    }

    this.#yPosition -= PDF_THEME.spacing.afterList
    return { needsNewPage: false }
  }

  /**
   * Renders a blockquote token to the PDF page with a colored bar and italic text.
   *
   * @param token - The markdown blockquote token containing quoted content
   * @param page - The PDF page to render on
   * @param pdfDoc - The PDF document for embedding images
   * @param loadFont - Function to load and embed a font into the PDF document
   * @param yPosition - Current Y position on the page
   * @param maxWidth - Maximum width available for rendering
   * @returns Promise resolving to RenderResult with updated Y position and optional new page flag
   */
  async #renderBlockquote(token: Tokens.Blockquote): Promise<RenderResult> {
    const margin = PDF_THEME.layout.margin
    const quoteMargin = margin + PDF_THEME.spacing.listItemIndent
    const lineHeight = PDF_THEME.font.blockquoteLineHeight

    this.#yPosition - PDF_THEME.spacing.blockquoteYDecrement

    if (this.#yPosition - lineHeight < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    const tempY = this.#yPosition
    let totalHeight = 0

    for (const quoteToken of token.tokens) {
      if (quoteToken.type === 'paragraph') {
        const text = extractTextFromTokens(quoteToken.tokens)
        const lines = splitTextToFit(
          text,
          await this.#loadFont('italic'),
          PDF_THEME.font.baseSize,
          this.#maxWidth - PDF_THEME.blockquote.contentPadding
        )

        totalHeight += lines.length * lineHeight
      }
    }

    this.#page.drawRectangle({
      x: margin + PDF_THEME.blockquote.barXOffset,
      y: tempY - totalHeight,
      width: PDF_THEME.blockquote.barWidth,
      height: totalHeight + 10,
      color: PDF_THEME.color.blockquoteBar
    })

    for (const quoteToken of token.tokens) {
      if (quoteToken.type === 'paragraph') {
        const { textTokens, imageTokens } = partitionTokens(quoteToken.tokens)

        for (const imageToken of imageTokens) {
          const imageResult = await this.#renderImage(
            imageToken as Tokens.Image,
            quoteMargin,
            this.#maxWidth - PDF_THEME.blockquote.contentPadding
          )

          if (imageResult.needsNewPage) {
            return { needsNewPage: true }
          }
        }

        if (textTokens.length > 0) {
          const text = extractTextFromTokens(textTokens)
          const lines = splitTextToFit(
            text,
            await this.#loadFont('italic'),
            PDF_THEME.font.baseSize,
            this.#maxWidth - PDF_THEME.blockquote.contentPadding
          )

          for (const line of lines) {
            if (this.#yPosition < PDF_THEME.layout.pageBottom) {
              return { needsNewPage: true }
            }

            this.#page.drawText(line, {
              x: quoteMargin,
              y: this.#yPosition,
              size: PDF_THEME.font.baseSize,
              font: await this.#loadFont('italic'),
              color: PDF_THEME.color.blockquoteText
            })
            this.#yPosition -= lineHeight
          }
        }
      }
    }

    this.#yPosition - PDF_THEME.spacing.afterBlockquote
    return { needsNewPage: false }
  }

  /**
   * Renders an image token to the PDF page, including the image and optional title.
   *
   * @param imageToken - The markdown image token containing href and optional title
   * @param page - The PDF page to render on
   * @param pdfDoc - The PDF document for embedding images
   * @param loadFont - Function to load and embed a font into the PDF document
   * @param yPosition - Current Y position on the page
   * @param margin - Left margin for positioning
   * @param maxWidth - Maximum width available for rendering
   * @returns RenderResult with updated Y position and optional new page flag
   */
  async #renderImage(
    imageToken: Tokens.Image,
    margin: number,
    maxWidth: number
  ): Promise<RenderResult> {
    const attrs = parseImageAttributes(imageToken.text)
    const imageResult = await embedImage(this.#pdfDoc, imageToken.href)

    let finalWidth = attrs.width > 0 ? attrs.width : imageResult.width
    let finalHeight = attrs.height > 0 ? attrs.height : imageResult.height

    const pageContentWidth = maxWidth - PDF_THEME.image.contentPadding
    if (finalWidth > pageContentWidth) {
      const scale = pageContentWidth / finalWidth
      finalWidth = pageContentWidth
      finalHeight = finalHeight * scale
    }

    if (this.#yPosition - finalHeight < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    this.#yPosition -= finalHeight + PDF_THEME.spacing.afterImage

    this.#page.drawImage(imageResult.image, {
      x: margin + (maxWidth - finalWidth) / 2,
      y: this.#yPosition,
      width: finalWidth,
      height: finalHeight
    })

    if (attrs.text) {
      this.#yPosition -= PDF_THEME.spacing.beforeImageTitle
      this.#page.drawText(`${attrs.text}`, {
        x: margin,
        y: this.#yPosition,
        size: PDF_THEME.font.imageTitleSize,
        font: await this.#loadFont('italic'),
        color: PDF_THEME.color.imagePlaceholder
      })
    }

    this.#yPosition - 15
    return { needsNewPage: false }
  }

  /**
   * Renders a table token to the PDF page with headers, borders, and cell content.
   *
   * @param token - The markdown table token containing header and row data
   */
  async #renderTable(token: Tokens.Table): Promise<RenderResult> {
    const headerFont = await this.#loadFont('bold')
    const headerFontSize = PDF_THEME.font.tableHeaderTextSize
    const headerLineHeight = PDF_THEME.font.tableHeaderLineHeight
    const colWidth = this.#maxWidth / token.header.length

    this.#yPosition - PDF_THEME.spacing.tableYDecrement

    const headerResult = this.#renderTableRow(
      token.header,
      headerFont,
      headerFontSize,
      headerLineHeight,
      PDF_THEME.color.tableHeaderBg,
      colWidth
    )

    if (headerResult.needsNewPage) {
      return { needsNewPage: true }
    }

    if (this.#yPosition < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    const rowFont = await this.#loadFont('regular')
    const rowFontSize = PDF_THEME.font.tableCellTextSize
    const rowLineHeight = PDF_THEME.font.tableCellLineHeight

    for (let i = 0; i < token.rows.length; i++) {
      const row = token.rows[i]
      const rowResult = this.#renderTableRow(
        row,
        rowFont,
        rowFontSize,
        rowLineHeight,
        PDF_THEME.color.tableCellBg,
        colWidth
      )

      if (rowResult.needsNewPage) {
        token.rows = token.rows.slice(i)
        return { needsNewPage: true }
      }
    }

    return { needsNewPage: false }
  }

  #renderTableCell(
    col: number,
    text: string,
    font: PDFFont,
    fontSize: number,
    lineHeight: number,
    colWidth: number,
    rowHeight: number
  ) {
    const margin = PDF_THEME.layout.margin
    const cellPadding = PDF_THEME.table.cellPadding
    const cellX = margin + col * colWidth

    this.#page.drawRectangle({
      x: cellX,
      y: this.#yPosition - rowHeight,
      width: colWidth,
      height: rowHeight,
      borderColor: PDF_THEME.color.tableBorder,
      borderWidth: 1
    })

    this.#page.drawText(text, {
      x: cellX + cellPadding,
      y: this.#yPosition - cellPadding - fontSize,
      size: fontSize,
      font,
      color: PDF_THEME.color.text,
      maxWidth: colWidth - cellPadding * 2,
      lineHeight
    })
  }

  #renderTableRow(
    cells: Tokens.TableCell[],
    font: PDFFont,
    fontSize: number,
    lineHeight: number,
    backgroundColor: RGB,
    colWidth: number
  ): RenderResult {
    const cellPadding = PDF_THEME.table.cellPadding
    const margin = PDF_THEME.layout.margin

    const cellTexts = cells.map((cell) => extractTextFromTokens(cell.tokens).replace(/\n/g, ' '))
    const cellLines = cellTexts.map((text) =>
      splitTextToFit(text, font, fontSize, colWidth - cellPadding * 2)
    )

    const rowHeight =
      cellPadding * 2 +
      cellLines.reduce((max, lines) => Math.max(max, lines.length), 0) *
        PDF_THEME.font.tableHeaderLineHeight

    if (this.#yPosition - rowHeight < PDF_THEME.layout.pageBottom) {
      return { needsNewPage: true }
    }

    this.#page.drawRectangle({
      x: margin,
      y: this.#yPosition - rowHeight,
      width: colWidth * cells.length,
      height: rowHeight,
      color: backgroundColor
    })

    for (let col = 0; col < cells.length; col++) {
      this.#renderTableCell(col, cellTexts.at(col), font, fontSize, lineHeight, colWidth, rowHeight)
    }

    this.#yPosition -= rowHeight
    return { needsNewPage: false }
  }

  /**
   * Renders a horizontal rule to the PDF page as a simple line.
   */
  #renderHorizontalRule(): RenderResult {
    const margin = PDF_THEME.layout.margin

    this.#yPosition -= PDF_THEME.spacing.hrYDecrement

    this.#page.drawLine({
      start: { x: margin, y: this.#yPosition },
      end: { x: margin + this.#maxWidth, y: this.#yPosition },
      thickness: PDF_THEME.hr.thickness,
      color: PDF_THEME.color.hr
    })

    return { needsNewPage: false }
  }
}
