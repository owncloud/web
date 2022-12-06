import { cacheService, clientService, encodePath } from 'web-pkg'
import { buildQueryString } from './common'
import isEqual from 'lodash-es/isEqual'

interface PrivatePreviewBlobOptions {
  server: string
  userId: string
  resource: {
    id: string
    webDavPath: string
    etag?: string
  }
  token: string
  dimensions?: [number, number]
}

export const privatePreviewBlob = async (
  options: PrivatePreviewBlobOptions,
  cached = false,
  throwErrors = false
): Promise<string> => {
  if (cached) {
    return cacheFactory(options, throwErrors)
  }

  const url = [
    options.server,
    'remote.php/dav',
    encodePath(options.resource.webDavPath),
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
  } catch (e) {
    if (throwErrors) {
      throw e
    }
  }
}

const cacheFactory = async (
  options: PrivatePreviewBlobOptions,
  throwErrors: boolean
): Promise<string> => {
  const hit = cacheService.filePreview.get(options.resource.id)
  if (hit && hit.etag === options.resource.etag && isEqual(options.dimensions, hit.dimensions)) {
    return hit.src
  }

  try {
    const src = await privatePreviewBlob(options)
    return cacheService.filePreview.set(
      options.resource.id,
      { src, etag: options.resource.etag, dimensions: options.dimensions },
      0
    ).src
  } catch (e) {
    if (throwErrors) {
      throw e
    }
  }
}
