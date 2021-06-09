import queryString from 'query-string'
import { encodePath } from 'web-pkg/src/utils'
import { clientService, cacheService } from '../../services'
import { getUserAvatarUrl } from '../user'

interface buildQueryStringOptions {
  preview?: number
  scalingup?: number
  a?: number
  etag?: string
  dimensions?: [number, number]
}

const buildQueryString = (options: buildQueryStringOptions): string => {
  return queryString.stringify({
    scalingup: options.scalingup || 0,
    preview: options.preview || 1,
    a: options.a || 1,
    ...(options.etag && { c: options.etag.replaceAll('"', '') }),
    ...(options.dimensions[0] && { x: options.dimensions[0] }),
    ...(options.dimensions[1] && { y: options.dimensions[1] })
  })
}

interface getPublicPreviewUrlOptions {
  resource: {
    etag?: string
    downloadURL: string
  }
  dimensions?: [number, number]
}

export const getPublicPreviewUrl = async (options: getPublicPreviewUrlOptions): Promise<string> => {
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

type loadPrivatePreviewOptions = {
  server: string
  userId: string
  resource: {
    id: string
    path: string
    etag?: string
  }
  token: string
  dimensions?: [number, number]
}

export const loadPrivatePreview = async (options: loadPrivatePreviewOptions): Promise<string> => {
  const url = [
    options.server,
    'remote.php/dav/files/',
    options.userId,
    encodePath(options.resource.path),
    '?',
    buildQueryString({
      etag: options.resource.etag,
      dimensions: options.dimensions
    })
  ].join('')

  try {
    const { data } = await clientService.httpAuthenticated(options.token).get(url, {
      responseType: 'blob'
    })
    return window.URL.createObjectURL(data)
  } catch (ignored) {}
}

export const loadPrivatePreviewCached = async (
  options: loadPrivatePreviewOptions
): Promise<string> => {
  const preview = cacheService.filePreview.get(options.resource.id)
  if (preview && preview.etag === options.resource.etag) {
    return preview.src
  }

  try {
    const src = await loadPrivatePreview(options)
    return cacheService.filePreview.set(
      options.resource.id,
      { src, etag: options.resource.etag },
      0
    ).src
  } catch (ignored) {}
}
