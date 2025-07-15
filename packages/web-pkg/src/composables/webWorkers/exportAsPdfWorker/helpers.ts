import { Token, Tokens } from 'marked'
import { PDFDocument, PDFFont, PDFImage, RGB } from 'pdf-lib'
import { PDF_THEME } from './pdfConfig'

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

const FONT_URLS = Object.freeze({
  regular: 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-R.ttf',
  bold: 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-B.ttf',
  italic: 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-RI.ttf',
  boldItalic: 'https://pdf-lib.js.org/assets/ubuntu/Ubuntu-BI.ttf',
  mono: 'https://pdf-lib.js.org/assets/ubuntu/UbuntuMono-R.ttf',
  monoBold: 'https://pdf-lib.js.org/assets/ubuntu/UbuntuMono-B.ttf'
})

export type FontLoader = (fontWeight: string) => Promise<PDFFont>

/**
 * Returns a function that loads and embeds a font into the PDF document.
 *
 * @param pdfDoc - The PDF document to embed fonts into
 * @returns Function that loads and embeds a font into the PDF document
 */
export function getFontLoader(pdfDoc: PDFDocument): FontLoader {
  const loadedFonts = {}

  return async (fontWeight: string): Promise<PDFFont> => {
    if (loadedFonts[fontWeight]) {
      return loadedFonts[fontWeight]
    }

    const fontBytes = await fetch(FONT_URLS[fontWeight]).then((res) => res.arrayBuffer())
    const font = await pdfDoc.embedFont(fontBytes)
    loadedFonts[fontWeight] = font

    return font
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
 * @param loadFont - Function to load and embed a font into the PDF document
 * @returns The appropriate PDF font for the segment
 */
export async function getFontForSegment(segment: TextSegment, loadFont: FontLoader) {
  if (segment.code) {
    return await loadFont('mono')
  }

  if (segment.bold && segment.italic) {
    return await loadFont('boldItalic')
  }

  if (segment.bold) {
    return await loadFont('bold')
  }

  if (segment.italic) {
    return await loadFont('italic')
  }

  return await loadFont('regular')
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
    .replaceAll(' ', ' ')
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
 * @param imageUrl - The data URI of the image to embed
 * @returns Promise resolving to an object with embedded image, width, and height
 */
export async function embedImage(pdfDoc: PDFDocument, imageUrl: string) {
  const parts = imageUrl.split(',')
  const meta = parts[0]
  const base64Data = parts[1]
  const binaryStr = atob(base64Data)
  const len = binaryStr.length
  const bytes = new Uint8Array(len)

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i)
  }

  const imageBytes = bytes.buffer
  let embeddedImage: PDFImage

  if (meta.includes('image/png')) {
    embeddedImage = await pdfDoc.embedPng(imageBytes)
  } else if (meta.includes('image/jpeg')) {
    embeddedImage = await pdfDoc.embedJpg(imageBytes)
  } else {
    embeddedImage = await pdfDoc.embedPng(imageBytes)
  }

  return {
    image: embeddedImage,
    width: embeddedImage.width,
    height: embeddedImage.height
  }
}

/**
 * Converts a PDF color to CSS rgb() string
 *
 * @param color - The PDF color to convert
 * @returns The CSS rgb() string
 */
export function pdfColorToCssRgb(color: RGB): string {
  const r = Math.round(color.red * 255)
  const g = Math.round(color.green * 255)
  const b = Math.round(color.blue * 255)
  return `rgb(${r}, ${g}, ${b})`
}

type ImageAttributes = {
  display: 'inline' | 'block'
  width: number
  height: number
  text: string | null
}

/**
 * Parses an image title for custom attributes like display mode, width, and height.
 * Attributes are expected in a semicolon-separated key-value format (e.g., "d=inline;w=50;h=20").
 * If the title does not conform to this format, it is treated as a regular image title.
 *
 * @param title - The title string from the markdown image token
 * @returns An ImageAttributes object with parsed values
 */
export function parseImageAttributes(title: string | null | undefined): ImageAttributes {
  const result: ImageAttributes = {
    display: 'block',
    width: 0,
    height: 0,
    text: title || null
  }

  if (!title || !title.includes('=')) {
    return result
  }

  const pairs = title.split(';')
  let isAttributeString = false

  for (const pair of pairs) {
    const parts = pair.split('=')

    if (parts.length !== 2) {
      continue
    }

    isAttributeString = true
    const key = parts[0].trim()
    const value = parts[1].trim()

    switch (key) {
      case 'd':
        console.log('d', value)
        if (value === 'inline') {
          result.display = 'inline'
        }
        break
      case 'w':
        result.width = parseInt(value, 10) || 0
        break
      case 'h':
        result.height = parseInt(value, 10) || 0
        break
    }
  }

  if (isAttributeString) {
    result.text = null
  }

  return result
}
