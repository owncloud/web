import { Token, Tokens } from 'marked'
import { PDFDocument, PDFFont, PDFImage, RGB, StandardFonts } from 'pdf-lib'
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

/**
 * Splits text into lines that fit within a specified maximum width using the given font and size.
 *
 * This function performs word-wrapping by measuring the width of text segments and breaking
 * lines when they exceed the maximum width. It ensures that words are not broken across lines.
 *
 * @param text - The text to split into lines
 * @param font - The PDF font object used for measuring text width
 * @param fontSize - The font size in points
 * @param maxWidth - The maximum width in points that each line should not exceed
 * @returns Array of text lines that fit within the specified width
 */
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

/**
 * Loads and embeds all required fonts into the PDF document.
 *
 * This function embeds the standard fonts needed for text rendering in the PDF:
 * - Helvetica (regular, bold, italic, bold-italic) for normal text
 * - Courier (regular, bold) for monospace text and code
 *
 * @param pdfDoc - The PDF document to embed fonts into
 * @returns Promise resolving to a Fonts object containing all embedded fonts
 */
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

/**
 * Determines the appropriate font to use for a text segment based on its formatting properties.
 *
 * This function selects the correct font variant based on the text segment's formatting:
 * - Monospace font for code segments
 * - Bold-italic font for segments with both bold and italic formatting
 * - Bold font for bold segments
 * - Italic font for italic segments
 * - Regular font as the default
 *
 * @param segment - The text segment with formatting properties
 * @param fonts - The available fonts object
 * @returns The appropriate PDF font for the segment
 */
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

/**
 * Extracts plain text content from an array of markdown tokens.
 *
 * This function processes different token types and converts them to readable text:
 * - Links are converted to "text (url)" format
 * - Images are converted to "[Image: title]" format
 * - Text tokens are extracted directly
 * - Other tokens fall back to their raw content
 *
 * @param tokens - Array of markdown tokens to extract text from
 * @returns Concatenated plain text representation of all tokens
 */
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

/**
 * Parses inline markdown tokens into TextSegment objects with formatting information.
 *
 * This function converts markdown inline tokens (text, strong, em, codespan, sub, sup, link)
 * into TextSegment objects that contain the text content and formatting flags. Each segment
 * represents a piece of text with consistent formatting that can be rendered with the
 * appropriate font and styling.
 *
 * @param tokens - Array of inline markdown tokens to parse
 * @returns Array of TextSegment objects with formatting information
 */
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

/**
 * Fetches an image from a URL or data URI and embeds it into the PDF document.
 *
 * This function handles both remote URLs and data URIs, supporting PNG and JPEG formats.
 * For unsupported formats, it attempts to convert them to PNG using OffscreenCanvas.
 * The function returns either a success result with the embedded image and dimensions,
 * or an error result if the image cannot be fetched or embedded.
 *
 * @param pdfDoc - The PDF document to embed the image into
 * @param imageUrl - The URL or data URI of the image to fetch and embed
 * @returns Promise resolving to an object with success status, embedded image (if successful), dimensions, and error message (if failed)
 */
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

/**
 * Converts a PDF color to CSS rgb() string
 *
 * @param color - The PDF color to convert
 * @returns The CSS rgb() string
 */
export function pdfColorToCssRgb(color: RGB): string {
  return `rgb(${color.red}, ${color.green}, ${color.blue})`
}
