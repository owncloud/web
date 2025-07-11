import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default'
})

/**
 * Renders a Mermaid diagram string into a PNG data URL with specified dimensions.
 *
 * This function converts Mermaid chart syntax into an SVG, then renders it to a canvas
 * at a higher resolution (3x scale factor) for better quality, and converts it to a
 * PNG data URL that can be embedded in the PDF.
 *
 * @param diagram - The Mermaid diagram syntax to render
 * @returns Promise resolving to an object containing the PNG data URL and image dimensions
 */
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

/**
 * Pre-processes markdown content to convert Mermaid charts into embedded images.
 *
 * This function scans markdown content for Mermaid code blocks (```mermaid) and converts
 * each chart into an embedded PNG image with width and height attributes. If rendering
 * fails, it replaces the chart with an error message. The processed content can then
 * be passed to the PDF generation pipeline.
 *
 * @param markdownContent - The markdown content containing Mermaid charts to process
 * @returns Promise resolving to the processed markdown content with charts converted to images
 */
export async function preprocessMermaidCharts(markdownContent: string): Promise<string> {
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
      const errorMarkdown = `> *Failed to render Mermaid chart.*`
      replacements.push({ find: originalBlock, replace: errorMarkdown })
    }
  }

  for (const rep of replacements) {
    processedContent = processedContent.replace(rep.find, rep.replace)
  }

  return processedContent
}
