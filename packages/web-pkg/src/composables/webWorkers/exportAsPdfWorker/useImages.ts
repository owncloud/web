import { useGettext } from 'vue3-gettext'

/**
 * Converts an external image URL to a data URL by loading it into a canvas.
 *
 * This function creates an HTML image element, loads the external image with CORS enabled,
 * draws it onto a canvas, and then converts the canvas content to a PNG data URL.
 * This is necessary for embedding external images into PDF documents.
 *
 * @param imageUrl - The external URL of the image to convert
 * @returns Promise resolving to the image as a PNG data URL
 * @throws Error if the image fails to load or canvas context cannot be obtained
 */
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
      resolve(canvas.toDataURL('image/png'))
    }

    img.onerror = (err) => {
      reject(err)
    }

    img.src = imageUrl
  })
}

/**
 * Composable providing image preprocessing for PDF generation.
 *
 * This composable handles the conversion of external image URLs in markdown content
 * to data URLs that can be embedded directly in PDF documents. It processes all
 * external images (non-data URLs) and converts them to base64-encoded PNG data.
 */
export function useImages() {
  const { $pgettext } = useGettext()

  /**
   * Preprocesses markdown content to convert external image URLs into data URLs.
   *
   * This function scans markdown content for image syntax with external URLs
   * (excluding data URLs), converts each external image to a data URL using
   * canvas rendering, and replaces the original URL with the data URL.
   * Failed conversions are replaced with error messages.
   *
   * @param markdownContent - The markdown content to preprocess
   * @returns Promise resolving to the content with image sources replaced by data URLs
   */
  async function preprocessImages(markdownContent: string): Promise<string> {
    const imageRegex = /!\[([^\]]*)\]\((?!data:)([^)]+)\)/g
    const matches = Array.from(markdownContent.matchAll(imageRegex))

    if (matches.length === 0) {
      return markdownContent
    }

    const conversionPromises = matches.map(async (match) => {
      const imageUrl = match[2]

      try {
        return await convertImageToDataURL(imageUrl)
      } catch (error) {
        console.error('Failed to convert image to data URL:', error)
        return null
      }
    })

    const results = await Promise.all(conversionPromises)

    let i = 0
    return markdownContent.replace(imageRegex, (_, altText) => {
      const dataURL = results[i++]

      if (dataURL) {
        return `![${altText}](${dataURL})`
      }

      return (
        '*' +
        $pgettext(
          'Error message rendered in a PDF file when there is any error during the rendering of an image.',
          'Failed to render image.'
        ) +
        '*'
      )
    })
  }

  return {
    preprocessImages
  }
}
