import { DavProperty } from '@ownclouders/web-client/webdav'
import { webdav as _webdav, Resource, SpaceResource, urlJoin } from '@ownclouders/web-client'
import { marked, Token, Tokens } from 'marked'
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from 'pdf-lib'

import { WorkerTopic } from '../../piniaStores/webWorkers'
import { resolveFileNameDuplicate } from '../../../helpers/resource/conflictHandling/conflictUtils'

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

type Fonts = {
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
  boldItalic: PDFFont
  mono: PDFFont
  monoBold: PDFFont
}

let storedHeaders: Record<string, string>

function splitTextToFit(text: string, font: any, fontSize: number, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

async function markdownToPDF(markdownText: string): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create()
  const fonts = await loadFonts(pdfDoc)

  let page = pdfDoc.addPage()
  let yPosition = 750
  const pageWidth = page.getWidth()
  const pageHeight = page.getHeight()
  const margin = 50
  const maxWidth = pageWidth - margin * 2

  const tokens = marked.lexer(markdownText)

  for (const token of tokens) {
    const result = await renderToken(token, page, pdfDoc, fonts, yPosition, margin, maxWidth)
    yPosition = result.yPosition

    if (yPosition < 100) {
      page = pdfDoc.addPage()
      yPosition = pageHeight - 100
    }
  }

  const pdfBytes = await pdfDoc.save()
  return pdfBytes.buffer as ArrayBuffer
}

async function loadFonts(pdfDoc: PDFDocument): Promise<Fonts> {
  return {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
    mono: await pdfDoc.embedFont(StandardFonts.Courier),
    monoBold: await pdfDoc.embedFont(StandardFonts.CourierBold)
  }
}

function renderToken(
  token: Token,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
) {
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
      return { yPosition: yPosition - 10 }

    default:
      return { yPosition }
  }
}

function renderHeading(
  token: Tokens.Heading,
  page: PDFPage,
  fonts: Fonts,
  yPosition: number,
  margin: number
) {
  const fontSize = Math.max(24 - token.depth * 2, 14)
  const lines = splitTextToFit(token.text, fonts.bold, fontSize, page.getWidth() - margin * 2)

  yPosition -= fontSize + 10

  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: yPosition,
      size: fontSize,
      font: fonts.bold,
      color: rgb(0, 0, 0)
    })
    yPosition -= fontSize + 2
  }

  return { yPosition: yPosition - 15 }
}

async function renderParagraph(
  token: Tokens.Paragraph,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
) {
  yPosition -= 20

  let currentX = margin
  const lineHeight = 16

  for (const inlineToken of token.tokens) {
    if (inlineToken.type === 'image') {
      if (currentX > margin) {
        yPosition -= lineHeight
        currentX = margin
      }

      const imageResult = await renderImageToken(
        inlineToken as Tokens.Image,
        page,
        pdfDoc,
        yPosition,
        margin,
        maxWidth
      )
      yPosition = imageResult.yPosition

      currentX = margin
      continue
    }

    const tempSegments = parseInlineTokens([inlineToken])
    if (tempSegments.length === 0) {
      continue
    }
    const segment = tempSegments[0]

    const font = getFontForSegment(segment, fonts)
    let fontSize = 12
    let yOffset = 0

    if (segment.subscript || segment.superscript) {
      fontSize = 9
      yOffset = segment.subscript ? -3 : 4
    }

    const words = segment.text.split(' ')

    for (const word of words) {
      const wordWithSpace = word + ' '
      const wordWidth = font.widthOfTextAtSize(wordWithSpace, fontSize)

      if (currentX + wordWidth > margin + maxWidth) {
        yPosition -= lineHeight
        currentX = margin
      }

      page.drawText(wordWithSpace, {
        x: currentX,
        y: yPosition + yOffset,
        size: fontSize,
        font: font,
        color: segment.color || rgb(0, 0, 0)
      })

      currentX += wordWidth
    }
  }

  return { yPosition: yPosition - 10 }
}

function renderCodeBlock(
  token: Tokens.Code,
  page: PDFPage,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
) {
  const fontSize = 10
  const lineHeight = 14
  const padding = 10

  const lines = token.text.split('\n')
  const blockHeight = lines.length * lineHeight + padding * 2

  yPosition -= blockHeight

  page.drawRectangle({
    x: margin,
    y: yPosition,
    width: maxWidth,
    height: blockHeight,
    color: rgb(0.95, 0.95, 0.95)
  })

  let currentY = yPosition + blockHeight - padding - lineHeight
  for (const line of lines) {
    page.drawText(line, {
      x: margin + padding,
      y: currentY,
      size: fontSize,
      font: fonts.mono,
      color: rgb(0, 0, 0)
    })
    currentY -= lineHeight
  }

  return { yPosition: yPosition - 15 }
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
) {
  const indent = margin + level * 20
  const bulletChar = token.ordered ? '1.' : '•'

  for (let i = 0; i < token.items.length; i++) {
    const item = token.items[i]
    yPosition -= 18

    const bullet = token.ordered ? `${i + 1}.` : bulletChar
    page.drawText(bullet, {
      x: indent,
      y: yPosition,
      size: 12,
      font: fonts.regular,
      color: rgb(0, 0, 0)
    })

    const textTokens = item.tokens.filter((t: any) => t.type !== 'image')
    const imageTokens = item.tokens.filter((t: any) => t.type === 'image')

    for (const imageToken of imageTokens) {
      const imageResult = await renderImageToken(
        imageToken as Tokens.Image,
        page,
        pdfDoc,
        yPosition,
        indent + 20,
        maxWidth - (indent + 20 - margin)
      )
      yPosition = imageResult.yPosition
    }

    if (textTokens.length > 0) {
      const itemText = extractTextFromTokens(textTokens)
      const lines = splitTextToFit(itemText, fonts.regular, 12, maxWidth - (indent + 20 - margin))

      for (const line of lines) {
        page.drawText(line, {
          x: indent + 20,
          y: yPosition,
          size: 12,
          font: fonts.regular,
          color: rgb(0, 0, 0)
        })
        yPosition -= 16
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
            yPosition,
            margin,
            maxWidth,
            level + 1
          )
          yPosition = result.yPosition
        }
      }
    }
  }

  return { yPosition: yPosition - 10 }
}

async function renderBlockquote(
  token: Tokens.Blockquote,
  page: PDFPage,
  pdfDoc: PDFDocument,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
) {
  const quoteMargin = margin + 20
  const lineHeight = 16

  yPosition -= 20

  page.drawRectangle({
    x: margin + 10,
    y: yPosition - 20,
    width: 3,
    height: Math.abs(yPosition - (yPosition - token.tokens.length * lineHeight)),
    color: rgb(0.7, 0.7, 0.7)
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
          yPosition,
          quoteMargin,
          maxWidth - 40
        )
        yPosition = imageResult.yPosition
      }

      if (textTokens.length > 0) {
        const text = extractTextFromTokens(textTokens)
        const lines = splitTextToFit(text, fonts.italic, 12, maxWidth - 40)

        for (const line of lines) {
          page.drawText(line, {
            x: quoteMargin,
            y: yPosition,
            size: 12,
            font: fonts.italic,
            color: rgb(0.3, 0.3, 0.3)
          })
          yPosition -= lineHeight
        }
      }
    }
  }

  return { yPosition: yPosition - 15 }
}

function renderTable(
  token: Tokens.Table,
  page: PDFPage,
  fonts: Fonts,
  yPosition: number,
  margin: number,
  maxWidth: number
) {
  const cellPadding = 8
  const rowHeight = 30
  const colWidth = maxWidth / token.header.length

  yPosition -= 20

  let currentY = yPosition
  for (let col = 0; col < token.header.length; col++) {
    const cellX = margin + col * colWidth

    page.drawRectangle({
      x: cellX,
      y: currentY - rowHeight,
      width: colWidth,
      height: rowHeight,
      color: rgb(0.9, 0.9, 0.9)
    })

    const headerText = extractTextFromTokens(token.header[col].tokens)
    page.drawText(headerText, {
      x: cellX + cellPadding,
      y: currentY - rowHeight + cellPadding,
      size: 11,
      font: fonts.bold,
      color: rgb(0, 0, 0)
    })

    page.drawRectangle({
      x: cellX,
      y: currentY - rowHeight,
      width: colWidth,
      height: rowHeight,
      borderColor: rgb(0.5, 0.5, 0.5),
      borderWidth: 1
    })
  }

  currentY -= rowHeight

  for (const row of token.rows) {
    for (let col = 0; col < row.length; col++) {
      const cellX = margin + col * colWidth

      const cellText = extractTextFromTokens(row[col].tokens)
      page.drawText(cellText, {
        x: cellX + cellPadding,
        y: currentY - rowHeight + cellPadding,
        size: 10,
        font: fonts.regular,
        color: rgb(0, 0, 0)
      })

      page.drawRectangle({
        x: cellX,
        y: currentY - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: rgb(0.5, 0.5, 0.5),
        borderWidth: 1
      })
    }
    currentY -= rowHeight
  }

  return { yPosition: currentY - 15 }
}

function renderHorizontalRule(page: PDFPage, yPosition: number, margin: number, maxWidth: number) {
  yPosition -= 20

  page.drawLine({
    start: { x: margin, y: yPosition },
    end: { x: margin + maxWidth, y: yPosition },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5)
  })

  return { yPosition: yPosition - 20 }
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
          color: rgb(0.7, 0.1, 0.1)
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
          color: rgb(0, 0, 0.8)
        })
        break
      case 'image':
        segments.push({
          text: `[Image: ${token.title || 'Image'}]`,
          bold: false,
          italic: true,
          code: false,
          subscript: false,
          superscript: false,
          color: rgb(0.5, 0.5, 0.5)
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

async function fetchAndEmbedImage(
  pdfDoc: PDFDocument,
  imageUrl: string,
  maxWidth = 400,
  maxHeight = 300
) {
  try {
    const response = await fetch(imageUrl)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBytes = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || ''
    const lowerCaseUrl = imageUrl.toLowerCase()

    let embeddedImage

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

    const { width, height } = embeddedImage.scale(1)
    let scaledWidth = width
    let scaledHeight = height

    if (width > maxWidth) {
      const scale = maxWidth / width
      scaledWidth = maxWidth
      scaledHeight = height * scale
    }

    if (scaledHeight > maxHeight) {
      const scale = maxHeight / scaledHeight
      scaledHeight = maxHeight
      scaledWidth = scaledWidth * scale
    }

    return {
      image: embeddedImage,
      width: scaledWidth,
      height: scaledHeight,
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
) {
  const imageResult = await fetchAndEmbedImage(pdfDoc, imageToken.href, maxWidth - 40)

  if (imageResult.success) {
    if (yPosition - imageResult.height < 50) {
      return {
        yPosition: yPosition - 30,
        needsNewPage: true,
        pendingImage: imageResult
      }
    }

    yPosition -= imageResult.height + 10

    page.drawImage(imageResult.image, {
      x: margin + (maxWidth - imageResult.width) / 2,
      y: yPosition,
      width: imageResult.width,
      height: imageResult.height
    })

    if (imageToken.title) {
      yPosition -= 20
      page.drawText(`${imageToken.title}`, {
        x: margin,
        y: yPosition,
        size: 10,
        font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
        color: rgb(0.5, 0.5, 0.5)
      })
    }

    return { yPosition: yPosition - 15 }
  } else {
    yPosition -= 20
    page.drawText(`Image failed to load: ${imageToken.title || imageToken.href}`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      color: rgb(0.8, 0.2, 0.2)
    })
    return { yPosition: yPosition - 10 }
  }
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

    postMessage({ successful: [resource], failed: [] })
  } catch (error) {
    postMessage({
      successful: [],
      failed: [
        {
          resourceName: fileName,
          error: {
            message: error.message,
            statusCode: error.statusCode,
            xReqId: error.response.headers?.get('x-request-id')
          }
        }
      ]
    })
  }
}
