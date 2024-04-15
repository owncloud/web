import { FolderResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { urlJoin } from '../utils'
import { DAV } from './client/dav'
import { WebDavOptions } from './types'
import { buildAuthHeader } from './client'

export const CreateFolderFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  { accessToken }: WebDavOptions
) => {
  return {
    async createFolder(
      space: SpaceResource,
      { path, fetchFolder = true }: { path?: string; fetchFolder?: boolean }
    ): Promise<FolderResource> {
      const headers = buildAuthHeader(accessToken, space)
      await dav.mkcol(urlJoin(space.webDavPath, path, { leadingSlash: true }), { headers })

      if (fetchFolder) {
        return getFileInfoFactory.getFileInfo(space, { path })
      }
    }
  }
}
