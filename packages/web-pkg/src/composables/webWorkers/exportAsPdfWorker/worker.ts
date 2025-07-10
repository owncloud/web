import { DavProperty } from '@ownclouders/web-client/webdav'
import {
  webdav as _webdav,
  HttpError,
  Resource,
  SpaceResource,
  urlJoin
} from '@ownclouders/web-client'
import { marked, Token, Tokens } from 'marked'
import { PDFDocument, PDFImage, PDFPage, rgb, StandardFonts } from 'pdf-lib'

import { WorkerTopic } from '../../piniaStores/webWorkers'
import { resolveFileNameDuplicate } from '../../../helpers/resource/conflictHandling/conflictUtils'
import { Fonts, loadFonts, splitTextToFit } from './helpers'

const PDF_CONFIG = Object.freeze({
  layout: {
    margin: 50,
    pageBottom: 50
  },
  font: {
    baseSize: 12,
    lineHeight: 16,
    subSupSize: 9,
    headingBaseSize: 24,
    headingDepthMultiplier: 2,
    headingMinSize: 14,
    codeSize: 10,
    codeLineHeight: 14,
    listBulletSize: 12,
    listItemLineHeight: 16,
    blockquoteLineHeight: 16,
    tableHeaderTextSize: 11,
    tableCellTextSize: 10,
    imageTitleSize: 10
  },
  offset: {
    subscript: -3,
    superscript: 4
  },
  color: {
    text: rgb(0, 0, 0),
    link: rgb(0, 0, 0.8),
    error: rgb(0.8, 0.2, 0.2),
    codeSpan: rgb(0.7, 0.1, 0.1),
    codeBlockBg: rgb(0.95, 0.95, 0.95),
    blockquoteBar: rgb(0.7, 0.7, 0.7),
    blockquoteText: rgb(0.3, 0.3, 0.3),
    tableHeaderBg: rgb(0.9, 0.9, 0.9),
    tableBorder: rgb(0.5, 0.5, 0.5),
    hr: rgb(0.5, 0.5, 0.5),
    imagePlaceholder: rgb(0.5, 0.5, 0.5)
  },
  spacing: {
    beforeParagraph: 20,
    afterParagraph: 10,
    afterHeading: 15,
    afterCodeBlock: 15,
    afterList: 10,
    afterBlockquote: 15,
    afterTable: 15,
    afterHr: 20,
    forSpaceToken: 10,
    afterImage: 10,
    beforeImageTitle: 20,
    listItemYDecrement: 18,
    listItemIndent: 20,
    blockquoteYDecrement: 20,
    hrYDecrement: 20,
    tableYDecrement: 20
  },
  codeBlock: {
    padding: 10
  },
  table: {
    cellPadding: 8,
    rowHeight: 30
  },
  blockquote: {
    barWidth: 3,
    barXOffset: 10
  },
  hr: {
    thickness: 1
  },
  image: {
    contentPadding: 40
  }
})

type MessageData = {
  accessToken?: string
  baseUrl?: string
  headers?: Record<string, string>
  destinationFolder?: Resource
  space?: SpaceResource
  fileName?: string
  content?: string
}

type Message = {
  topic: WorkerTopic
  data: MessageData
}

type TextSegment = {
  text: string
  bold: boolean
  italic: boolean
  code: boolean
  subscript: boolean
  superscript: boolean
  color?: any
}

type RenderResult = {
  yPosition: number
  needsNewPage?: boolean
}

let storedHeaders: Record<string, string>

function sanitizeText(text: string): string {
  return text
    .replace(/…/g, '...')
    .replace(/‘|’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/—/g, '--')
    .replace(/–/g, '-')
}

async function fetchAndEmbedImage(pdfDoc: PDFDocument, imageUrl: string) {
  try {
    let imageBytes: ArrayBuffer
    let embeddedImage: PDFImage

    if (imageUrl.startsWith('data:image')) {
      const parts = imageUrl.split(',')
      const meta = parts[0]
      const base64Data = parts[1]
      const binaryStr = atob(base64Data)
      const len = binaryStr.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      imageBytes = bytes.buffer

      if (meta.includes('image/png')) {
        embeddedImage = await pdfDoc.embedPng(imageBytes)
      } else if (meta.includes('image/jpeg')) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes)
      } else {
        embeddedImage = await pdfDoc.embedPng(imageBytes)
      }
    } else {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`)
      }
      imageBytes = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || ''
      const lowerCaseUrl = imageUrl.toLowerCase()

      if (contentType.includes('image/png') || lowerCaseUrl.endsWith('.png')) {
        embeddedImage = await pdfDoc.embedPng(imageBytes)
      } else if (
        contentType.includes('image/jpeg') ||
        contentType.includes('image/jpg') ||
        lowerCaseUrl.endsWith('.jpg') ||
        lowerCaseUrl.endsWith('.jpeg')
      ) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes)
      } else {
        if (typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') {
          throw new Error(
            'Browser does not support OffscreenCanvas/createImageBitmap for image conversion.'
          )
        }
        const blob = new Blob([imageBytes], { type: contentType })
        const bitmap = await createImageBitmap(blob)
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
        const ctx = canvas.getContext('2d')
        ctx.drawImage(bitmap, 0, 0)
        const pngBlob = await canvas.convertToBlob({ type: 'image/png' })
        const pngBytes = await pngBlob.arrayBuffer()
        embeddedImage = await pdfDoc.embedPng(pngBytes)
      }
    }

    return {
      image: embeddedImage,
      width: embeddedImage.width,
      height: embeddedImage.height,
      success: true
    }
  } catch (error) {
    return {
      error: (error as Error).message,
      success: false
    }
  }
}

async function renderImageToken(
  imageToken: Tokens.Image,
  page: PDFPage,
  pdfDoc: PDFDocument,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  let targetWidth = 0
  let targetHeight = 0

  if (imageToken.title) {
    const match = imageToken.title.match(/w=(\d+),h=(\d+)/)
    if (match) {
      targetWidth = parseInt(match[1], 10)
      targetHeight = parseInt(match[2], 10)
    }
  }

  const imageResult = await fetchAndEmbedImage(pdfDoc, imageToken.href)

  if (imageResult.success) {
    let finalWidth: number
    let finalHeight: number

    if (targetWidth > 0 && targetHeight > 0) {
      finalWidth = targetWidth
      finalHeight = targetHeight
    } else {
      finalWidth = imageResult.width
      finalHeight = imageResult.height
      const pageContentWidth = maxWidth - PDF_CONFIG.image.contentPadding
      if (finalWidth > pageContentWidth) {
        const scale = pageContentWidth / finalWidth
        finalWidth = pageContentWidth
        finalHeight = finalHeight * scale
      }
    }

    if (yPosition - finalHeight < PDF_CONFIG.layout.pageBottom) {
      return { yPosition, needsNewPage: true }
    }

    yPosition -= finalHeight + PDF_CONFIG.spacing.afterImage

    page.drawImage(imageResult.image, {
      x: margin + (maxWidth - finalWidth) / 2,
      y: yPosition,
      width: finalWidth,
      height: finalHeight
    })

    const isMermaidChartWithDimensions = imageToken.title && /^w=\d+,h=\d+$/.test(imageToken.title)

    if (imageToken.title && !isMermaidChartWithDimensions) {
      yPosition -= PDF_CONFIG.spacing.beforeImageTitle
      page.drawText(`${imageToken.title}`, {
        x: margin,
        y: yPosition,
        size: PDF_CONFIG.font.imageTitleSize,
        font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
        color: PDF_CONFIG.color.imagePlaceholder
      })
    }

    return { yPosition: yPosition - 15 }
  } else {
    yPosition -= 20
    page.drawText(`Image failed to load: ${imageToken.title || imageToken.href}`, {
      x: margin,
      y: yPosition,
      size: PDF_CONFIG.font.imageTitleSize,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      color: PDF_CONFIG.color.error
    })
    return { yPosition: yPosition - 10 }
  }
}

function renderHeading(
  token: Tokens.Heading,
  page: PDFPage,
  fonts: Fonts,
  yPosition: number,
  margin: number
): RenderResult {
  const fontSize = Math.max(
    PDF_CONFIG.font.headingBaseSize - token.depth * PDF_CONFIG.font.headingDepthMultiplier,
    PDF_CONFIG.font.headingMinSize
  )
  const lineHeight = fontSize + 2
  const lines = splitTextToFit(token.text, fonts.bold, fontSize, page.getWidth() - margin * 2)

  let localY = yPosition - (fontSize + 10)

  if (yPosition - (fontSize + 10) - lines.length * lineHeight < PDF_CONFIG.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: localY,
      size: fontSize,
      font: fonts.bold,
      color: PDF_CONFIG.color.text
    })
    localY -= lineHeight
  }

  return { yPosition: localY - PDF_CONFIG.spacing.afterHeading }
}

async function renderParagraph(
  token: Tokens.Paragraph,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const lineHeight = PDF_CONFIG.font.lineHeight
  let localY = yPosition - PDF_CONFIG.spacing.beforeParagraph

  if (localY - lineHeight < PDF_CONFIG.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  let currentX = margin

  for (const inlineToken of token.tokens) {
    if (inlineToken.type === 'image') {
      if (currentX > margin) {
        if (localY - lineHeight < PDF_CONFIG.layout.pageBottom) {
          return { yPosition, needsNewPage: true }
        }
        localY -= lineHeight
        currentX = margin
      }

      const imageResult = await renderImageToken(
        inlineToken as Tokens.Image,
        page,
        pdfDoc,
        localY,
        margin,
        maxWidth
      )

      if (imageResult.needsNewPage) {
        return { yPosition, needsNewPage: true }
      }

      localY = imageResult.yPosition
      currentX = margin
      continue
    }

    const tempSegments = parseInlineTokens([inlineToken])

    if (tempSegments.length === 0) {
      continue
    }

    const segment = tempSegments[0]

    const font = getFontForSegment(segment, fonts)
    let fontSize = PDF_CONFIG.font.baseSize
    let yOffset = 0

    if (segment.subscript || segment.superscript) {
      fontSize = PDF_CONFIG.font.subSupSize
      yOffset = segment.subscript ? PDF_CONFIG.offset.subscript : PDF_CONFIG.offset.superscript
    }

    const textLines = segment.text.split('\n')

    for (let i = 0; i < textLines.length; i++) {
      const lineText = textLines[i]
      const words = lineText.split(' ')

      for (const word of words) {
        if (word === '') {
          continue
        }

        const wordWithSpace = word + ' '
        const wordWidth = font.widthOfTextAtSize(wordWithSpace, fontSize)

        if (currentX + wordWidth > margin + maxWidth) {
          if (localY - lineHeight < PDF_CONFIG.layout.pageBottom) {
            return { yPosition, needsNewPage: true }
          }
          localY -= lineHeight
          currentX = margin
        }

        page.drawText(wordWithSpace, {
          x: currentX,
          y: localY + yOffset,
          size: fontSize,
          font: font,
          color: segment.color || PDF_CONFIG.color.text
        })

        currentX += wordWidth
      }

      if (i < textLines.length - 1) {
        if (localY - lineHeight < PDF_CONFIG.layout.pageBottom) {
          return { yPosition, needsNewPage: true }
        }
        localY -= lineHeight
        currentX = margin
      }
    }
  }

  return { yPosition: localY - PDF_CONFIG.spacing.afterParagraph }
}

function renderCodeBlock(
  token: Tokens.Code,
  page: PDFPage,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
): RenderResult {
  const fontSize = PDF_CONFIG.font.codeSize
  const lineHeight = PDF_CONFIG.font.codeLineHeight
  const padding = PDF_CONFIG.codeBlock.padding

  const lines = token.text.split('\n')
  const blockHeight = lines.length * lineHeight + padding * 2

  if (yPosition - blockHeight < PDF_CONFIG.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  let localY = yPosition - blockHeight

  page.drawRectangle({
    x: margin,
    y: localY,
    width: maxWidth,
    height: blockHeight,
    color: PDF_CONFIG.color.codeBlockBg
  })

  let currentY = yPosition - padding - fontSize
  for (const line of lines) {
    page.drawText(line, {
      x: margin + padding,
      y: currentY,
      size: fontSize,
      font: fonts.mono,
      color: PDF_CONFIG.color.text
    })
    currentY -= lineHeight
  }

  return { yPosition: localY - PDF_CONFIG.spacing.afterCodeBlock }
}

async function renderList(
  token: Tokens.List,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number,
  level = 0
): Promise<RenderResult> {
  const indent = margin + level * PDF_CONFIG.spacing.listItemIndent
  const bulletChar = token.ordered ? '1.' : '•'
  const lineHeight = PDF_CONFIG.font.listItemLineHeight
  let localY = yPosition

  for (let i = 0; i < token.items.length; i++) {
    const item = token.items[i]
    if (localY - PDF_CONFIG.spacing.listItemYDecrement < PDF_CONFIG.layout.pageBottom) {
      return { yPosition, needsNewPage: true }
    }
    localY -= PDF_CONFIG.spacing.listItemYDecrement

    const bullet = token.ordered ? `${i + 1}.` : bulletChar
    page.drawText(bullet, {
      x: indent,
      y: localY,
      size: PDF_CONFIG.font.listBulletSize,
      font: fonts.regular,
      color: PDF_CONFIG.color.text
    })

    const textTokens = item.tokens.filter((t: any) => t.type !== 'image')
    const imageTokens = item.tokens.filter((t: any) => t.type === 'image')

    for (const imageToken of imageTokens) {
      const imageResult = await renderImageToken(
        imageToken as Tokens.Image,
        page,
        pdfDoc,
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
      const lines = splitTextToFit(itemText, fonts.regular, 12, maxWidth - (indent + 20 - margin))

      for (const line of lines) {
        if (localY < PDF_CONFIG.layout.pageBottom) {
          return { yPosition, needsNewPage: true }
        }
        page.drawText(line, {
          x: indent + 20,
          y: localY,
          size: PDF_CONFIG.font.baseSize,
          font: fonts.regular,
          color: PDF_CONFIG.color.text
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
            fonts,
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

  return { yPosition: localY - PDF_CONFIG.spacing.afterList }
}

async function renderBlockquote(
  token: Tokens.Blockquote,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> {
  const quoteMargin = margin + PDF_CONFIG.spacing.listItemIndent
  const lineHeight = PDF_CONFIG.font.blockquoteLineHeight
  let localY = yPosition - PDF_CONFIG.spacing.blockquoteYDecrement

  if (localY - lineHeight < PDF_CONFIG.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  const tempY = localY
  let totalHeight = 0

  for (const quoteToken of token.tokens) {
    if (quoteToken.type === 'paragraph') {
      const text = extractTextFromTokens(quoteToken.tokens)
      const lines = splitTextToFit(text, fonts.italic, 12, maxWidth - 40)
      totalHeight += lines.length * lineHeight
    }
  }

  page.drawRectangle({
    x: margin + PDF_CONFIG.blockquote.barXOffset,
    y: tempY - totalHeight,
    width: PDF_CONFIG.blockquote.barWidth,
    height: totalHeight + 10,
    color: PDF_CONFIG.color.blockquoteBar
  })

  for (const quoteToken of token.tokens) {
    if (quoteToken.type === 'paragraph') {
      const imageTokens = quoteToken.tokens.filter((t: any) => t.type === 'image')
      const textTokens = quoteToken.tokens.filter((t: any) => t.type !== 'image')

      for (const imageToken of imageTokens) {
        const imageResult = await renderImageToken(
          imageToken as Tokens.Image,
          page,
          pdfDoc,
          localY,
          quoteMargin,
          maxWidth - 40
        )

        if (imageResult.needsNewPage) {
          return { yPosition, needsNewPage: true }
        }
        localY = imageResult.yPosition
      }

      if (textTokens.length > 0) {
        const text = extractTextFromTokens(textTokens)
        const lines = splitTextToFit(text, fonts.italic, PDF_CONFIG.font.baseSize, maxWidth - 40)

        for (const line of lines) {
          if (localY < PDF_CONFIG.layout.pageBottom) {
            return { yPosition, needsNewPage: true }
          }
          page.drawText(line, {
            x: quoteMargin,
            y: localY,
            size: PDF_CONFIG.font.baseSize,
            font: fonts.italic,
            color: PDF_CONFIG.color.blockquoteText
          })
          localY -= lineHeight
        }
      }
    }
  }

  return { yPosition: localY - PDF_CONFIG.spacing.afterBlockquote }
}

function renderTable(
  token: Tokens.Table,
  page: PDFPage,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
): RenderResult {
  const cellPadding = PDF_CONFIG.table.cellPadding
  const rowHeight = PDF_CONFIG.table.rowHeight
  const tableHeight = (token.rows.length + 1) * rowHeight

  if (yPosition - tableHeight < PDF_CONFIG.layout.pageBottom) {
    return { yPosition, needsNewPage: true }
  }

  const colWidth = maxWidth / token.header.length
  let localY = yPosition - PDF_CONFIG.spacing.tableYDecrement

  for (let col = 0; col < token.header.length; col++) {
    const cellX = margin + col * colWidth

    page.drawRectangle({
      x: cellX,
      y: localY - rowHeight,
      width: colWidth,
      height: rowHeight,
      color: PDF_CONFIG.color.tableHeaderBg
    })

    const headerText = extractTextFromTokens(token.header[col].tokens)
    page.drawText(headerText, {
      x: cellX + cellPadding,
      y: localY - rowHeight + cellPadding,
      size: PDF_CONFIG.font.tableHeaderTextSize,
      font: fonts.bold,
      color: PDF_CONFIG.color.text
    })

    page.drawRectangle({
      x: cellX,
      y: localY - rowHeight,
      width: colWidth,
      height: rowHeight,
      borderColor: PDF_CONFIG.color.tableBorder,
      borderWidth: 1
    })
  }

  localY -= rowHeight

  for (const row of token.rows) {
    for (let col = 0; col < row.length; col++) {
      const cellX = margin + col * colWidth

      const cellText = extractTextFromTokens(row[col].tokens)
      page.drawText(cellText, {
        x: cellX + cellPadding,
        y: localY - rowHeight + cellPadding,
        size: PDF_CONFIG.font.tableCellTextSize,
        font: fonts.regular,
        color: PDF_CONFIG.color.text
      })

      page.drawRectangle({
        x: cellX,
        y: localY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: PDF_CONFIG.color.tableBorder,
        borderWidth: 1
      })
    }
    localY -= rowHeight
  }

  return { yPosition: localY - PDF_CONFIG.spacing.afterTable }
}

function renderHorizontalRule(
  page: PDFPage,
  yPosition: number,
  margin: number,
  maxWidth: number
): RenderResult {
  yPosition -= PDF_CONFIG.spacing.hrYDecrement

  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: margin + maxWidth, y: yPosition },
    thickness: PDF_CONFIG.hr.thickness,
    color: PDF_CONFIG.color.hr
  })

  return { yPosition: yPosition - PDF_CONFIG.spacing.afterHr }
}

function parseInlineTokens(tokens: Token[]): TextSegment[] {
  const segments: TextSegment[] = []

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        segments.push({
          text: token.text,
          bold: false,
          italic: false,
          code: false,
          subscript: false,
          superscript: false
        })
        break
      case 'strong':
        segments.push({
          text: token.text,
          bold: true,
          italic: false,
          code: false,
          subscript: false,
          superscript: false
        })
        break
      case 'em':
        segments.push({
          text: token.text,
          bold: false,
          italic: true,
          code: false,
          subscript: false,
          superscript: false
        })
        break
      case 'codespan':
        segments.push({
          text: token.text,
          bold: false,
          italic: false,
          code: true,
          subscript: false,
          superscript: false,
          color: PDF_CONFIG.color.codeSpan
        })
        break
      case 'sub':
        segments.push({
          text: token.text,
          bold: false,
          italic: false,
          code: false,
          subscript: true,
          superscript: false
        })
        break
      case 'sup':
        segments.push({
          text: token.text,
          bold: false,
          italic: false,
          code: false,
          subscript: false,
          superscript: true
        })
        break
      case 'link':
        segments.push({
          text: `${token.text} (${token.href})`,
          bold: false,
          italic: false,
          code: false,
          subscript: false,
          superscript: false,
          color: PDF_CONFIG.color.link
        })
        break
      default:
        if ((token as Tokens.Text).text) {
          segments.push({
            text: (token as Tokens.Text).text,
            bold: false,
            italic: false,
            code: false,
            subscript: false,
            superscript: false
          })
        }
    }
  }

  return segments
}

function getFontForSegment(segment: TextSegment, fonts: Fonts) {
  if (segment.code) return fonts.mono
  if (segment.bold && segment.italic) return fonts.boldItalic
  if (segment.bold) return fonts.bold
  if (segment.italic) return fonts.italic
  return fonts.regular
}

function extractTextFromTokens(tokens: Token[]) {
  return tokens
    .map((token) => {
      if (token.type === 'text') return token.text
      if (token.type === 'strong') return token.text
      if (token.type === 'em') return token.text
      if (token.type === 'codespan') return token.text
      if (token.type === 'sub') return token.text
      if (token.type === 'sup') return token.text
      if (token.type === 'link') return `${token.text} (${token.href})`
      if (token.type === 'image') return `[Image: ${token.title || 'Image'}]`
      return (token as Tokens.Text).text || (token as Tokens.Text).raw || ''
    })
    .join('')
}

function renderToken(
  token: Token,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
): Promise<RenderResult> | RenderResult {
  switch (token.type) {
    case 'heading':
      return renderHeading(token as Tokens.Heading, page, fonts, yPosition, margin)
    case 'paragraph':
      return renderParagraph(
        token as Tokens.Paragraph,
        page,
        pdfDoc,
        fonts,
        yPosition,
        margin,
        maxWidth
      )
    case 'code':
      return renderCodeBlock(token as Tokens.Code, page, fonts, yPosition, margin, maxWidth)
    case 'list':
      return renderList(token as Tokens.List, page, pdfDoc, fonts, yPosition, margin, maxWidth)
    case 'blockquote':
      return renderBlockquote(
        token as Tokens.Blockquote,
        page,
        pdfDoc,
        fonts,
        yPosition,
        margin,
        maxWidth
      )
    case 'table':
      return renderTable(token as Tokens.Table, page, fonts, yPosition, margin, maxWidth)
    case 'hr':
      return renderHorizontalRule(page, yPosition, margin, maxWidth)
    case 'space':
      return { yPosition: yPosition - PDF_CONFIG.spacing.forSpaceToken }
    default:
      return { yPosition }
  }
}

async function markdownToPDF(markdownText: string): Promise<ArrayBuffer> {
  const sanitizedMarkdown = sanitizeText(markdownText)
  const pdfDoc = await PDFDocument.create()
  const fonts = await loadFonts(pdfDoc)

  let page = pdfDoc.addPage()
  const pageHeight = page.getHeight()
  const margin = PDF_CONFIG.layout.margin
  let yPosition = pageHeight - margin
  const maxWidth = page.getWidth() - margin * 2

  const tokens = marked.lexer(sanitizedMarkdown, { breaks: true })

  for (const token of tokens) {
    let result = await renderToken(token, page, pdfDoc, fonts, yPosition, margin, maxWidth)

    if (result.needsNewPage) {
      page = pdfDoc.addPage()
      yPosition = pageHeight - margin
      result = await renderToken(token, page, pdfDoc, fonts, yPosition, margin, maxWidth)
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

self.onmessage = async (event: MessageEvent) => {
  const { topic, data } = JSON.parse(event.data) as Message

  if (topic === 'tokenUpdate' && storedHeaders) {
    const existingToken = storedHeaders.Authorization

    if (existingToken?.toString().startsWith('Bearer')) {
      storedHeaders.Authorization = data.accessToken
    }

    return
  }

  const { baseUrl, headers, destinationFolder, space, content } = data
  let { fileName } = data

  storedHeaders = headers
  const webdav = _webdav(
    baseUrl,
    () => {},
    () => storedHeaders
  )

  try {
    const { children: existingResources } = await webdav.listFiles(
      space,
      {
        fileId: destinationFolder.fileId
      },
      { davProperties: [DavProperty.Name] }
    )

    const resourceAlreadyExists = existingResources.find(
      (existingResource) => existingResource.name === fileName
    )

    if (resourceAlreadyExists) {
      fileName = resolveFileNameDuplicate(fileName, 'pdf', existingResources)
    }

    const resource = await webdav.putFileContents(space, {
      fileName,
      parentFolderId: destinationFolder.id,
      content: await markdownToPDF(content),
      path: urlJoin(destinationFolder.path, fileName)
    })

    postMessage(JSON.stringify({ successful: [resource], failed: [] }))
  } catch (e) {
    const error = {
      message: e.message || 'Unexpected error',
      statusCode: e instanceof HttpError ? e.statusCode : 500,
      xReqId: e instanceof HttpError ? e.response?.headers?.get('x-request-id') : undefined
    }
    postMessage(
      JSON.stringify({
        successful: [],
        failed: [
          {
            resourceName: fileName,
            error
          }
        ]
      })
    )
  }
}
