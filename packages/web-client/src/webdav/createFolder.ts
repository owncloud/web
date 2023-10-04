import { FolderResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { urlJoin } from '../utils'
import { DAV } from './client/dav'
import { WebDavOptions } from './types'
import { buildPublicLinkAuthHeader } from './client'

export const CreateFolderFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  options: WebDavOptions
) => {
  return {
    async createFolder(space: SpaceResource, { path }: { path?: string }): Promise<FolderResource> {
      if (isPublicSpaceResource(space)) {
        const headers = { Authorization: null }
        if (space.publicLinkPassword) {
          headers.Authorization = buildPublicLinkAuthHeader(space.publicLinkPassword)
        }

        await dav.mkcol(urlJoin(space.webDavPath, path, { leadingSlash: false }), { headers })
      } else {
        await dav.mkcol(urlJoin(space.webDavPath, path, { leadingSlash: true }))
      }

      return getFileInfoFactory.getFileInfo(space, { path })
    }
  }
}
