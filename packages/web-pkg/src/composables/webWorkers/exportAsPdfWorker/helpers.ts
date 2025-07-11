import { Token } from 'marked'
import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib'

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
