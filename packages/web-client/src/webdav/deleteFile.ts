import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, buildAuthHeader } from './client'

export const DeleteFileFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    deleteFile(space: SpaceResource, { path }: { path: string }) {
      const headers = buildAuthHeader(accessToken, space)
      return dav.delete(urlJoin(space.webDavPath, path), { headers })
    }
  }
}
