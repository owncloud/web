import katex from 'katex'
import html2canvas from 'html2canvas'
import { useGettext } from 'vue3-gettext'
import { PDF_THEME } from './pdfConfig'
import { pdfColorToCssRgb } from './helpers'

async function renderKaTeXToDataURL(
  formula: string,
  isBlockMode: boolean = false
): Promise<{ dataURL: string; width: number; height: number }> {
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.background = '#fff'
  container.style.padding = '2px'
  container.style.fontSize = `${PDF_THEME.font.baseSize}px`
  container.style.color = pdfColorToCssRgb(PDF_THEME.color.text)

  document.body.appendChild(container)

  try {
    katex.render(formula, container, {
      displayMode: isBlockMode,
      throwOnError: false,
      errorColor: pdfColorToCssRgb(PDF_THEME.color.error)
    })

    const katexElement = container.querySelector<HTMLElement>('.katex')
    if (!katexElement) {
      throw new Error('KaTeX did not produce a valid element.')
    }

    const rect = katexElement.getBoundingClientRect()
    const width = Math.ceil(rect.width)
    const height = Math.ceil(rect.height)

    const scaleFactor = PDF_THEME.svg.scaleFactor
    const canvas = await html2canvas(katexElement, {
      backgroundColor: null,
      scale: scaleFactor,
      logging: false
    })

    const dataURL = canvas.toDataURL('image/png')

    return { dataURL, width, height }
  } finally {
    document.body.removeChild(container)
  }
}

async function replaceAsync(
  str: string,
  regex: RegExp,
  replacer: (...args: any[]) => Promise<string>
): Promise<string> {
  let result = ''
  let lastIndex = 0
  let match: RegExpExecArray | null

  regex.lastIndex = 0

  while ((match = regex.exec(str)) !== null) {
    result += str.slice(lastIndex, match.index)
    result += await replacer(...match)
    lastIndex = regex.lastIndex
  }

  result += str.slice(lastIndex)
  return result
}

export function useKaTeX() {
  const { $pgettext } = useGettext()

  function replaceFormulas(content: string, regex: RegExp, isBlockMode: boolean): Promise<string> {
    return replaceAsync(content, regex, async (_, formula: string) => {
      formula = formula.trim()

      try {
        const { dataURL, width, height } = await renderKaTeXToDataURL(formula, isBlockMode)
        return `![w=${width},h=${height}](${dataURL})`
      } catch {
        return (
          '*' +
          $pgettext(
            'Error message rendered in a PDF file when there is any error during the rendering of a KaTeX formula.',
            'Failed to render math formula.'
          ) +
          '*'
        )
      }
    })
  }

  async function preprocessKaTeXFormulas(markdownContent: string): Promise<string> {
    const blockRegex = /\$\$([\s\S]*?)\$\$/g
    const inlineRegex = /\$([^\$]+?)\$/g

    let content = await replaceFormulas(markdownContent, blockRegex, true)
    content = await replaceFormulas(content, inlineRegex, false)

    return content
  }
  return { preprocessKaTeXFormulas }
}
