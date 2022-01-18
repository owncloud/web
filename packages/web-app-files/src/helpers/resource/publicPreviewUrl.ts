import { buildQueryString } from './common'
import { clientService } from 'web-pkg/src/services'

interface PublicPreviewUrlOptions {
  resource: {
    etag?: string
    downloadURL: string
  }
  dimensions?: [number, number]
}

export const publicPreviewUrl = async (options: PublicPreviewUrlOptions): Promise<string> => {
  // In a public context, i.e. public shares, the downloadURL contains a pre-signed url to
  // download the file.
  const [url, signedQuery] = options.resource.downloadURL.split('?')

  // Since the pre-signed url contains query parameters and the caller of this method
  // can also provide query parameters we have to combine them.
  const combinedQuery = [
    buildQueryString({
      etag: options.resource.etag,
      dimensions: options.dimensions
    }),
    signedQuery
  ]
    .filter(Boolean)
    .join('&')

  const previewUrl = [url, combinedQuery].filter(Boolean).join('?')
  const { status } = await clientService.httpUnAuthenticated.head(previewUrl)

  if (status !== 404) {
    return previewUrl
  }
}
