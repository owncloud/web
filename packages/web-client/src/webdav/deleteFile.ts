import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, buildPublicLinkAuthHeader } from './client'

export const DeleteFileFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    deleteFile(space: SpaceResource, { path }: { path: string }) {
      if (isPublicSpaceResource(space)) {
        const headers = { Authorization: null }
        if (space.publicLinkPassword) {
          headers.Authorization = buildPublicLinkAuthHeader(space.publicLinkPassword)
        }

        return dav.delete(urlJoin(space.webDavPath, path), { headers })
      }

      return dav.delete(urlJoin(space.webDavPath, path))
    }
  }
}
