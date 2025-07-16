import { marked, Token, Tokens } from 'marked'
import { PDFDocument, PDFPage } from 'pdf-lib'
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

type RenderResult = {
  yPosition: number
  needsNewPage?: boolean
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
async function renderImage(
  imageToken: Tokens.Image,
  page: PDFPage,
  pdfDoc: PDFDocument,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const attrs = parseImageAttributes(imageToken.text)
  const imageResult = await embedImage(pdfDoc, imageToken.href)

  let finalWidth = attrs.width > 0 ? attrs.width : imageResult.width
  let finalHeight = attrs.height > 0 ? attrs.height : imageResult.height

  const pageContentWidth = maxWidth - PDF_THEME.image.contentPadding
  if (finalWidth > pageContentWidth) {
    const scale = pageContentWidth / finalWidth
    finalWidth = pageContentWidth
    finalHeight = finalHeight * scale
  }

  if (yPosition - finalHeight < PDF_THEME.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  yPosition -= finalHeight + PDF_THEME.spacing.afterImage

  page.drawImage(imageResult.image, {
    x: margin + (maxWidth - finalWidth) / 2,
    y: yPosition,
    width: finalWidth,
    height: finalHeight
  })

  if (attrs.text) {
    yPosition -= PDF_THEME.spacing.beforeImageTitle
    page.drawText(`${attrs.text}`, {
      x: margin,
      y: yPosition,
      size: PDF_THEME.font.imageTitleSize,
      font: await loadFont('italic'),
      color: PDF_THEME.color.imagePlaceholder
    })
  }

  return { yPosition: yPosition - 15 }
}

/**
 * Renders a heading token to the PDF page with appropriate font size and spacing.
 *
 * @param token - The markdown heading token containing text and depth level
 * @param page - The PDF page to render on
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @returns RenderResult with updated Y position and optional new page flag
 */
async function renderHeading(
  token: Tokens.Heading,
  page: PDFPage,
  loadFont: FontLoader,
  yPosition: number,
  margin: number
): Promise<RenderResult> {
  const fontSize = Math.max(
    PDF_THEME.font.headingBaseSize - token.depth * PDF_THEME.font.headingDepthMultiplier,
    PDF_THEME.font.headingMinSize
  )
  const lineHeight = fontSize + 2
  const lines = splitTextToFit(
    token.text,
    await loadFont('bold'),
    fontSize,
    page.getWidth() - margin * 2
  )

  let localY = yPosition - (fontSize + 10)

  if (yPosition - (fontSize + 10) - lines.length * lineHeight < PDF_THEME.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: localY,
      size: fontSize,
      font: await loadFont('bold'),
      color: PDF_THEME.color.text
    })
    localY -= lineHeight
  }

  return { yPosition: localY - PDF_THEME.spacing.afterHeading }
}

/**
 * Renders a paragraph token to the PDF page, handling inline formatting and images.
 *
 * @param token - The markdown paragraph token containing inline tokens
 * @param page - The PDF page to render on
 * @param pdfDoc - The PDF document for embedding images
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @returns Promise resolving to RenderResult with updated Y position and optional new page flag
 */
async function renderParagraph(
  token: Tokens.Paragraph,
  page: PDFPage,
  pdfDoc: PDFDocument,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const lineHeight = PDF_THEME.font.lineHeight

  let localY = yPosition - PDF_THEME.spacing.beforeParagraph
  let currentX = margin

  const wrapLine = () => {
    localY -= lineHeight
    currentX = margin

    return localY < PDF_THEME.layout.pageBottom
  }

  if (token.tokens.length === 1 && token.tokens[0].type === 'image') {
    const imageToken = token.tokens[0] as Tokens.Image
    const attrs = parseImageAttributes(imageToken.text)

    if (attrs.display === 'block') {
      return renderImage(imageToken, page, pdfDoc, loadFont, yPosition, margin, maxWidth)
    }
  }

  if (localY - lineHeight < PDF_THEME.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  for (const inlineToken of token.tokens) {
    if (inlineToken.type === 'image') {
      const attrs = parseImageAttributes(inlineToken.text)

      if (attrs.display === 'inline') {
        const imageWidth = attrs.width + PDF_THEME.math.inlineModePadding

        if (currentX + imageWidth > margin + maxWidth && currentX > margin && wrapLine()) {
          console.log('image requiers new page')
          return { yPosition, needsNewPage: true }
        }

        const imageResult = await embedImage(pdfDoc, inlineToken.href)
        const yOffset = (attrs.height - PDF_THEME.font.baseSize) / 2

        page.drawImage(imageResult.image, {
          x: currentX,
          y: localY - yOffset,
          width: attrs.width,
          height: attrs.height
        })

        currentX += imageWidth
      } else {
        if (currentX > margin && wrapLine()) {
          return { yPosition, needsNewPage: true }
        }

        const imageRenderResult = await renderImage(
          inlineToken as Tokens.Image,
          page,
          pdfDoc,
          loadFont,
          localY,
          margin,
          maxWidth
        )

        if (imageRenderResult.needsNewPage) {
          return { yPosition, needsNewPage: true }
        }

        localY = imageRenderResult.yPosition
        currentX = margin
      }

      continue
    }

    const segments = parseInlineTokens([inlineToken])

    for (const segment of segments) {
      const font = await getFontForSegment(segment, loadFont)
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
          if (!word) continue
          const wordWithSpace = word + ' '
          const wordWidth = font.widthOfTextAtSize(wordWithSpace, fontSize)

          if (currentX + wordWidth > margin + maxWidth && currentX > margin) {
            if (wrapLine()) return { yPosition, needsNewPage: true }
          }

          page.drawText(wordWithSpace, {
            x: currentX,
            y: localY + yOffset,
            font,
            size: fontSize,
            color: segment.color || PDF_THEME.color.text
          })
          currentX += wordWidth
        }

        if (lineIndex < textLines.length - 1) {
          if (wrapLine()) return { yPosition, needsNewPage: true }
        }
      }
    }
  }

  return { yPosition: localY - PDF_THEME.spacing.afterParagraph }
}

/**
 * Renders a code block token to the PDF page with background and monospace font.
 *
 * @param token - The markdown code token containing the code text
 * @param page - The PDF page to render on
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @returns RenderResult with updated Y position and optional new page flag
 */
async function renderCodeBlock(
  token: Tokens.Code,
  page: PDFPage,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const fontSize = PDF_THEME.font.codeSize
  const lineHeight = PDF_THEME.font.codeLineHeight
  const padding = PDF_THEME.codeBlock.padding

  const lines = token.text.split('\n')
  const blockHeight = lines.length * lineHeight + padding * 2

  if (yPosition - blockHeight < PDF_THEME.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  const localY = yPosition - blockHeight

  page.drawRectangle({
    x: margin,
    y: localY,
    width: maxWidth,
    height: blockHeight,
    color: PDF_THEME.color.codeBlockBg
  })

  let currentY = yPosition - padding - fontSize
  for (const line of lines) {
    page.drawText(line, {
      x: margin + padding,
      y: currentY,
      size: fontSize,
      font: await loadFont('mono'),
      color: PDF_THEME.color.codeBlockText
    })
    currentY -= lineHeight
  }

  return { yPosition: localY - PDF_THEME.spacing.afterCodeBlock }
}

/**
 * Renders a list token to the PDF page, supporting both ordered and unordered lists with nested items.
 *
 * @param token - The markdown list token containing list items
 * @param page - The PDF page to render on
 * @param pdfDoc - The PDF document for embedding images
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @param level - Nesting level for indentation (default: 0)
 * @returns Promise resolving to RenderResult with updated Y position and optional new page flag
 */
async function renderList(
  token: Tokens.List,
  page: PDFPage,
  pdfDoc: PDFDocument,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number,
  level = 0
): Promise<RenderResult> {
  const indent = margin + level * PDF_THEME.spacing.listItemIndent
  const bulletChar = token.ordered ? '1.' : '•'
  const lineHeight = PDF_THEME.font.listItemLineHeight
  let localY = yPosition

  for (let i = 0; i < token.items.length; i++) {
    const item = token.items[i]
    if (localY - PDF_THEME.spacing.listItemYDecrement < PDF_THEME.layout.pageBottom) {
      return { yPosition, needsNewPage: true }
    }
    localY -= PDF_THEME.spacing.listItemYDecrement

    const bullet = token.ordered ? `${i + 1}.` : bulletChar
    page.drawText(bullet, {
      x: indent,
      y: localY,
      size: PDF_THEME.font.listBulletSize,
      font: await loadFont('regular'),
      color: PDF_THEME.color.text
    })

    const { textTokens, imageTokens } = partitionTokens(item.tokens)

    for (const imageToken of imageTokens) {
      const imageResult = await renderImage(
        imageToken as Tokens.Image,
        page,
        pdfDoc,
        loadFont,
        localY,
        indent + 20,
        maxWidth - (indent + 20 - margin)
      )

      if (imageResult.needsNewPage) {
        return { yPosition, needsNewPage: true }
      }
      localY = imageResult.yPosition
    }

    if (textTokens.length > 0) {
      const itemText = extractTextFromTokens(textTokens)
      const lines = splitTextToFit(
        itemText,
        await loadFont('regular'),
        PDF_THEME.font.baseSize,
        maxWidth - (indent + 20 - margin)
      )

      for (const line of lines) {
        if (localY < PDF_THEME.layout.pageBottom) {
          return { yPosition, needsNewPage: true }
        }
        page.drawText(line, {
          x: indent + 20,
          y: localY,
          size: PDF_THEME.font.baseSize,
          font: await loadFont('regular'),
          color: PDF_THEME.color.text
        })
        localY -= lineHeight
      }
    }

    if (item.tokens) {
      for (const nestedToken of item.tokens) {
        if (nestedToken.type === 'list') {
          const result = await renderList(
            nestedToken as Tokens.List,
            page,
            pdfDoc,
            loadFont,
            localY,
            margin,
            maxWidth,
            level + 1
          )

          if (result.needsNewPage) {
            return { yPosition, needsNewPage: true }
          }
          localY = result.yPosition
        }
      }
    }
  }

  return { yPosition: localY - PDF_THEME.spacing.afterList }
}

/**
 * Renders a blockquote token to the PDF page with a colored bar and italic text.
 *
 * @param token - The markdown blockquote token containing quoted content
 * @param page - The PDF page to render on
 * @param pdfDoc - The PDF document for embedding images
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @returns Promise resolving to RenderResult with updated Y position and optional new page flag
 */
async function renderBlockquote(
  token: Tokens.Blockquote,
  page: PDFPage,
  pdfDoc: PDFDocument,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const quoteMargin = margin + PDF_THEME.spacing.listItemIndent
  const lineHeight = PDF_THEME.font.blockquoteLineHeight
  let localY = yPosition - PDF_THEME.spacing.blockquoteYDecrement

  if (localY - lineHeight < PDF_THEME.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  const tempY = localY
  let totalHeight = 0

  for (const quoteToken of token.tokens) {
    if (quoteToken.type === 'paragraph') {
      const text = extractTextFromTokens(quoteToken.tokens)
      const lines = splitTextToFit(
        text,
        await loadFont('italic'),
        PDF_THEME.font.baseSize,
        maxWidth - PDF_THEME.blockquote.contentPadding
      )
      totalHeight += lines.length * lineHeight
    }
  }

  page.drawRectangle({
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
        const imageResult = await renderImage(
          imageToken as Tokens.Image,
          page,
          pdfDoc,
          loadFont,
          localY,
          quoteMargin,
          maxWidth - PDF_THEME.blockquote.contentPadding
        )

        if (imageResult.needsNewPage) {
          return { yPosition, needsNewPage: true }
        }
        localY = imageResult.yPosition
      }

      if (textTokens.length > 0) {
        const text = extractTextFromTokens(textTokens)
        const lines = splitTextToFit(
          text,
          await loadFont('italic'),
          PDF_THEME.font.baseSize,
          maxWidth - PDF_THEME.blockquote.contentPadding
        )

        for (const line of lines) {
          if (localY < PDF_THEME.layout.pageBottom) {
            return { yPosition, needsNewPage: true }
          }
          page.drawText(line, {
            x: quoteMargin,
            y: localY,
            size: PDF_THEME.font.baseSize,
            font: await loadFont('italic'),
            color: PDF_THEME.color.blockquoteText
          })
          localY -= lineHeight
        }
      }
    }
  }

  return { yPosition: localY - PDF_THEME.spacing.afterBlockquote }
}

/**
 * Renders a table token to the PDF page with headers, borders, and cell content.
 *
 * @param token - The markdown table token containing header and row data
 * @param page - The PDF page to render on
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @returns RenderResult with updated Y position and optional new page flag
 */
async function renderTable(
  token: Tokens.Table,
  page: PDFPage,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const cellPadding = PDF_THEME.table.cellPadding
  const rowHeight = PDF_THEME.table.rowHeight
  const tableHeight = (token.rows.length + 1) * rowHeight

  if (yPosition - tableHeight < PDF_THEME.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  const colWidth = maxWidth / token.header.length
  let localY = yPosition - PDF_THEME.spacing.tableYDecrement

  for (let col = 0; col < token.header.length; col++) {
    const cellX = margin + col * colWidth

    page.drawRectangle({
      x: cellX,
      y: localY - rowHeight,
      width: colWidth,
      height: rowHeight,
      color: PDF_THEME.color.tableHeaderBg
    })

    const headerText = extractTextFromTokens(token.header[col].tokens).replace(/\n/g, ' ')
    page.drawText(headerText, {
      x: cellX + cellPadding,
      y: localY - rowHeight + cellPadding,
      size: PDF_THEME.font.tableHeaderTextSize,
      font: await loadFont('bold'),
      color: PDF_THEME.color.text
    })

    page.drawRectangle({
      x: cellX,
      y: localY - rowHeight,
      width: colWidth,
      height: rowHeight,
      borderColor: PDF_THEME.color.tableBorder,
      borderWidth: 1
    })
  }

  localY -= rowHeight

  for (const row of token.rows) {
    for (let col = 0; col < row.length; col++) {
      const cellX = margin + col * colWidth

      const cellText = extractTextFromTokens(row[col].tokens).replace(/\n/g, ' ')
      page.drawText(cellText, {
        x: cellX + cellPadding,
        y: localY - rowHeight + cellPadding,
        size: PDF_THEME.font.tableCellTextSize,
        font: await loadFont('regular'),
        color: PDF_THEME.color.text
      })

      page.drawRectangle({
        x: cellX,
        y: localY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: PDF_THEME.color.tableBorder,
        borderWidth: 1
      })
    }
    localY -= rowHeight
  }

  return { yPosition: localY - PDF_THEME.spacing.afterTable }
}

/**
 * Renders a horizontal rule to the PDF page as a simple line.
 *
 * @param page - The PDF page to render on
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @returns RenderResult with updated Y position and optional new page flag
 */
function renderHorizontalRule(
  page: PDFPage,
  yPosition: number,
  margin: number,
  maxWidth: number
): RenderResult {
  yPosition -= PDF_THEME.spacing.hrYDecrement

  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: margin + maxWidth, y: yPosition },
    thickness: PDF_THEME.hr.thickness,
    color: PDF_THEME.color.hr
  })

  return { yPosition: yPosition - PDF_THEME.spacing.afterHr }
}

/**
 * Renders a markdown token to the PDF page by delegating to the appropriate renderer function.
 *
 * This function acts as a dispatcher that routes different token types to their specific
 * rendering functions. It handles all supported markdown token types including headings,
 * paragraphs, code blocks, lists, blockquotes, tables, horizontal rules, and spaces.
 *
 * @param token - The markdown token to render
 * @param page - The PDF page to render on
 * @param pdfDoc - The PDF document for embedding images
 * @param loadFont - Function to load and embed a font into the PDF document
 * @param yPosition - Current Y position on the page
 * @param margin - Left margin for positioning
 * @param maxWidth - Maximum width available for rendering
 * @returns Promise resolving to RenderResult with updated Y position and optional new page flag, or RenderResult directly for synchronous operations
 */
export function renderToken(
  token: Token,
  page: PDFPage,
  pdfDoc: PDFDocument,
  loadFont: FontLoader,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> | RenderResult {
  switch (token.type) {
    case 'heading':
      return renderHeading(token as Tokens.Heading, page, loadFont, yPosition, margin)
    case 'paragraph':
      return renderParagraph(
        token as Tokens.Paragraph,
        page,
        pdfDoc,
        loadFont,
        yPosition,
        margin,
        maxWidth
      )
    case 'code':
      return renderCodeBlock(token as Tokens.Code, page, loadFont, yPosition, margin, maxWidth)
    case 'list':
      return renderList(token as Tokens.List, page, pdfDoc, loadFont, yPosition, margin, maxWidth)
    case 'blockquote':
      return renderBlockquote(
        token as Tokens.Blockquote,
        page,
        pdfDoc,
        loadFont,
        yPosition,
        margin,
        maxWidth
      )
    case 'table':
      return renderTable(token as Tokens.Table, page, loadFont, yPosition, margin, maxWidth)
    case 'hr':
      return renderHorizontalRule(page, yPosition, margin, maxWidth)
    case 'space':
      return { yPosition: yPosition - PDF_THEME.spacing.forSpaceToken }
    default:
      return { yPosition }
  }
}

/**
 * Converts markdown text to a PDF document.
 *
 * This function processes markdown content through the following steps:
 * 1. Sanitizes text for PDF compatibility (typographic characters)
 * 2. Creates a new PDF document and loads fonts
 * 3. Parses markdown into tokens
 * 4. Renders each token type to the PDF
 * 5. Handles page breaks automatically
 *
 * @param markdownText - The markdown content to convert
 * @returns Promise resolving to the PDF as an ArrayBuffer
 */
export async function convertMarkdownToPdf(markdownText: string): Promise<ArrayBuffer> {
  const sanitizedMarkdown = sanitizeText(markdownText)
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const loadFont = getFontLoader(pdfDoc)

  let page = pdfDoc.addPage()
  const pageHeight = page.getHeight()
  const margin = PDF_THEME.layout.margin
  let yPosition = pageHeight - margin
  const maxWidth = page.getWidth() - margin * 2

  const tokens = marked.lexer(sanitizedMarkdown, { breaks: true })

  for (const token of tokens) {
    let result = await renderToken(token, page, pdfDoc, loadFont, yPosition, margin, maxWidth)

    if (result.needsNewPage) {
      page = pdfDoc.addPage()
      yPosition = pageHeight - margin
      result = await renderToken(token, page, pdfDoc, loadFont, yPosition, margin, maxWidth)
    }

    yPosition = result.yPosition

    if (yPosition < margin) {
      page = pdfDoc.addPage()
      yPosition = pageHeight - margin
    }
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes.buffer as ArrayBuffer
}
