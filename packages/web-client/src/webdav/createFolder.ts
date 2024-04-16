import { FolderResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { urlJoin } from '../utils'
import { DAV } from './client/dav'
import { WebDavOptions } from './types'

export const CreateFolderFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  options: WebDavOptions
) => {
  return {
    async createFolder(
      space: SpaceResource,
      { path, fetchFolder = true }: { path?: string; fetchFolder?: boolean }
    ): Promise<FolderResource> {
      await dav.mkcol(urlJoin(space.webDavPath, path, { leadingSlash: true }))

      if (fetchFolder) {
        return getFileInfoFactory.getFileInfo(space, { path })
      }
    }
  }
}
