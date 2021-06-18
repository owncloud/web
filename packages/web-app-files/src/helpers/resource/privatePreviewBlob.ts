import { encodePath } from 'web-pkg/src/utils'
import { clientService, cacheService } from '../../services'
import { buildQueryString } from './common'
import isEqual from 'lodash-es/isEqual'

interface PrivatePreviewBlobOptions {
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

export const privatePreviewBlob = async (
  options: PrivatePreviewBlobOptions,
  cached = false
): Promise<string> => {
  if (cached) {
    return cacheFactory(options)
  }

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

const cacheFactory = async (options: PrivatePreviewBlobOptions): Promise<string> => {
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
  } catch (ignored) {}
}
