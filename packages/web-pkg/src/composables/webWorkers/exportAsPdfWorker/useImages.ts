import { useGettext } from 'vue3-gettext'

function convertImageToDataURL(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        return reject(new Error('Could not get canvas context.'))
      }

      ctx.drawImage(img, 0, 0, img.width, img.height)

      const dataURL = canvas.toDataURL('image/png')
      resolve(dataURL)
    }

    img.onerror = (err) => {
      reject(new Error(`Failed to load image: ${err}`))
    }

    img.src = imageUrl
  })
}

export function useImages() {
  const { $pgettext } = useGettext()

  async function preprocessImages(markdownContent: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
    let processedContent = markdownContent
    const replacements = []

    for (const match of markdownContent.matchAll(imageRegex)) {
      const originalImage = match[0]
      const imageUrl = match[2]

      try {
        const dataURL = await convertImageToDataURL(imageUrl)
        const imageMarkdown = `![](${dataURL})`
        replacements.push({ find: originalImage, replace: imageMarkdown })
      } catch (error) {
        console.error('Failed to convert image to data URL:', error)

        const errorMessageWithFormatting =
          '*' +
          $pgettext(
            'Error message rendered in a PDF file when there is any error during the rendering of an image.',
            'Failed to render image.'
          ) +
          '*'
        replacements.push({
          find: originalImage,
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
    preprocessImages
  }
}
