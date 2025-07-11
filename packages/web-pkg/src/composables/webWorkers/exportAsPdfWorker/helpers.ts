import { Token, Tokens } from 'marked'
import { PDFDocument, PDFFont, PDFImage, StandardFonts } from 'pdf-lib'
import { PDF_THEME } from './pdfConfig'

export type Fonts = {
  regular: PDFFont
  bold: PDFFont
  italic: PDFFont
  boldItalic: PDFFont
  mono: PDFFont
  monoBold: PDFFont
}

export type TextSegment = {
  text: string
  bold: boolean
  italic: boolean
  code: boolean
  subscript: boolean
  superscript: boolean
  color?: any
}

export function splitTextToFit(text: string, font: any, fontSize: number, maxWidth: number) {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const width = font.widthOfTextAtSize(testLine, fontSize)

    if (width <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }

      currentLine = word
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export async function loadFonts(pdfDoc: PDFDocument): Promise<Fonts> {
  return {
    regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
    bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
    italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
    mono: await pdfDoc.embedFont(StandardFonts.Courier),
    monoBold: await pdfDoc.embedFont(StandardFonts.CourierBold)
  }
}

export function getFontForSegment(segment: TextSegment, fonts: Fonts) {
  if (segment.code) {
    return fonts.mono
  }
  if (segment.bold && segment.italic) {
    return fonts.boldItalic
  }
  if (segment.bold) {
    return fonts.bold
  }
  if (segment.italic) {
    return fonts.italic
  }
  return fonts.regular
}

export function extractTextFromTokens(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === 'link') {
        return `${token.text} (${token.href})`
      }

      if (token.type === 'image') {
        return `[Image: ${token.title || 'Image'}]`
      }

      if ('text' in token) {
        return token.text
      }

      return token.raw || ''
    })
    .join('')
}

/**
 * Partitions tokens into text and image tokens
 *
 * @param tokens - Array of markdown tokens to partition
 * @returns Object containing separated text and image tokens
 */
export function partitionTokens(tokens: Token[]): { textTokens: Token[]; imageTokens: Token[] } {
  return tokens.reduce(
    (acc, token) => {
      if (token.type === 'image') {
        acc.imageTokens.push(token)
      } else {
        acc.textTokens.push(token)
      }

      return acc
    },
    { textTokens: [] as Token[], imageTokens: [] as Token[] }
  )
}

/**
 * Sanitizes text by converting typographic characters to ASCII equivalents for PDF compatibility.
 *
 * This function is necessary because the PDF generation uses StandardFonts (Helvetica, Courier)
 * from pdf-lib, which have limited Unicode character support. Typographic characters like curly
 * quotes and em/en dashes are not supported by these fonts and would cause rendering issues
 * or PDF generation failures.
 *
 * The replacements maintain semantic meaning while ensuring compatibility:
 * - Typographic quotes → straight quotes (same meaning)
 * - Em/en dashes → hyphens (similar visual effect)
 * - Ellipsis → three dots (same meaning)
 *
 * @param text - The input text that may contain typographic characters
 * @returns The sanitized text with typographic characters replaced by ASCII equivalents
 *
 * @example
 * ```typescript
 * sanitizeText("Here's a "quote" with an em—dash and ellipsis…")
 * // Returns: "Here's a "quote" with an em--dash and ellipsis..."
 * ```
 */
export function sanitizeText(text: string): string {
  return text
    .replaceAll('…', '...')
    .replaceAll('‘', "'")
    .replaceAll('’', "'")
    .replaceAll('“', '"')
    .replaceAll('”', '"')
    .replaceAll('—', '--')
    .replaceAll('–', '-')
}

export function parseInlineTokens(tokens: Token[]): TextSegment[] {
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
          color: PDF_THEME.color.codeSpan
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
          color: PDF_THEME.color.link
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

export async function fetchAndEmbedImage(pdfDoc: PDFDocument, imageUrl: string) {
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
