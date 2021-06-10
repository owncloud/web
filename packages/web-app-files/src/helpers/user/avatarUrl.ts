import { cacheService, clientService } from '../../services'

interface avatarUrlOptions {
  server: string
  username: string
  token: string
  size?: number
}

export const avatarUrl = async (options: avatarUrlOptions, cached = false): Promise<string> => {
  const size = options.size || 128

  if (cached) {
    return cacheFactory({ ...options, size })
  }

  const url = [options.server, 'remote.php/dav/avatars/', options.username, `/${size}.png`].join('')

  const { status, statusText } = await clientService.httpAuthenticated(options.token).head(url)

  if (status !== 200) {
    throw new Error(statusText)
  }

  const { owncloudSdk } = clientService

  if (!owncloudSdk || typeof owncloudSdk.signUrl !== 'function') {
    return url
  }

  return await owncloudSdk.signUrl(url)
}

const cacheFactory = async (options: avatarUrlOptions): Promise<string> => {
  const hit = cacheService.avatarUrl.get(options.username)
  if (hit && hit.size === options.size) {
    return hit.src
  }

  try {
    const src = await avatarUrl(options)
    return cacheService.avatarUrl.set(options.username, { src, size: options.size }, 0).src
  } catch (ignored) {}
}
