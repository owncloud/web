import mermaid from 'mermaid'
import { useGettext } from 'vue3-gettext'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default'
})

async function renderMermaidToDataURL(
  diagram: string
): Promise<{ dataURL: string; width: number; height: number }> {
  const { svg } = await mermaid.render('mermaid-temp-div', diagram)

  const encoder = new TextEncoder()
  const uint8Array = encoder.encode(svg)
  const binaryString = String.fromCharCode.apply(null, uint8Array)
  const base64 = btoa(binaryString)
  const svgDataUrl = 'data:image/svg+xml;base64,' + base64

  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const scaleFactor = 3
      const canvas = document.createElement('canvas')
      canvas.width = img.width * scaleFactor
      canvas.height = img.height * scaleFactor

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Could not get canvas context.'))
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const dataURL = canvas.toDataURL('image/png')
      resolve({ dataURL, width: img.width, height: img.height })
    }
    img.onerror = (err) => {
      reject(new Error(`Failed to load SVG data URL for conversion: ${err}`))
    }

    img.src = svgDataUrl
  })
}

export function useMermaid() {
  const { $pgettext } = useGettext()

  async function preprocessMermaidCharts(markdownContent: string): Promise<string> {
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g
    let processedContent = markdownContent
    const replacements = []

    for (const match of markdownContent.matchAll(mermaidRegex)) {
      const originalBlock = match[0]
      const chartSyntax = match[1]

      try {
        const { dataURL, width, height } = await renderMermaidToDataURL(chartSyntax)
        const imageMarkdown = `![w=${width},h=${height}](${dataURL})`
        replacements.push({ find: originalBlock, replace: imageMarkdown })
      } catch (error) {
        console.error('Failed to render Mermaid chart:', error)

        const errorMessageWithFormatting =
          '*' +
          $pgettext(
            'Error message rendered in a PDF file when there is any error during the rendering of a Mermaid chart.',
            'Failed to render Mermaid chart.'
          ) +
          '*'
        replacements.push({
          find: originalBlock,
          replace: errorMessageWithFormatting
        })
      }
    }

    for (const rep of replacements) {
      processedContent = processedContent.replace(rep.find, rep.replace)
    }

    return processedContent
  }

  return {
    preprocessMermaidCharts
  }
}
