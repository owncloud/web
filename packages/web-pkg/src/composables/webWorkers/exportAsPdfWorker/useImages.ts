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
      reject(err)
    }

    img.src = imageUrl
  })
}

/**
 * Composable providing image preprocessing for PDF generation.
 */
export function useImages() {
  const { $pgettext } = useGettext()

  /**
   * Preprocesses markdown content to convert external image URLs into data URLs.
   *
   * @param markdownContent - The markdown content to preprocess
   * @returns A promise resolving to the content with image sources replaced by data URLs
   */
  async function preprocessImages(markdownContent: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\((?!data:)([^)]+)\)/g
    const matches = Array.from(markdownContent.matchAll(imageRegex))
    if (matches.length === 0) {
      return markdownContent
    }

    const conversionPromises = matches.map((match) => {
      const imageUrl = match[2]
      return convertImageToDataURL(imageUrl).catch((error) => {
        console.error('Failed to convert image to data URL:', error)
        return null
      })
    })

    const results = await Promise.all(conversionPromises)

    let i = 0
    return markdownContent.replace(imageRegex, (original, altText) => {
      const dataURL = results[i++]
      if (dataURL) {
        return `![${altText}](${dataURL})`
      } else {
        return (
          '*' +
          $pgettext(
            'Error message rendered in a PDF file when there is any error during the rendering of an image.',
            'Failed to render image.'
          ) +
          '*'
        )
      }
    })
  }

  return {
    preprocessImages
  }
}
