import { cacheService } from '../../services'
import { ClientService } from 'web-pkg/src/services'

import { ImageDimension } from '../../constants'

interface AvatarUrlOptions {
  clientService: ClientService
  server: string
  username: string
  token: string
  size?: number
}

export const avatarUrl = async (options: AvatarUrlOptions, cached = false): Promise<string> => {
  const size = options.size || ImageDimension.Avatar

  if (cached) {
    return cacheFactory({ ...options, size })
  }

  const url = [options.server, 'remote.php/dav/avatars/', options.username, `/${size}.png`].join('')

  const { status, statusText } = await options.clientService
    .httpAuthenticated(options.token)
    .head(url)

  if (status !== 200) {
    throw new Error(statusText)
  }

  const { owncloudSdk } = options.clientService
  if (!owncloudSdk || typeof owncloudSdk.signUrl !== 'function') {
    return url
  }

  return owncloudSdk.signUrl(url)
}

const cacheFactory = async (options: AvatarUrlOptions): Promise<string> => {
  const hit = cacheService.avatarUrl.get(options.username)
  if (hit && hit.size === options.size) {
    return hit.src
  }

  try {
    const src = await avatarUrl(options)
    return cacheService.avatarUrl.set(options.username, { src, size: options.size }, 0).src
  } catch (ignored) {}
}
