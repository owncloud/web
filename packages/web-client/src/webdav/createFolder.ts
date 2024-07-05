import { FolderResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { urlJoin } from '../utils'
import { DAV, DAVRequestOptions } from './client/dav'
import { WebDavOptions } from './types'

export const CreateFolderFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  options: WebDavOptions
) => {
  return {
    async createFolder(
      space: SpaceResource,
      {
        path,
        fetchFolder = true,
        ...opts
      }: { path?: string; fetchFolder?: boolean } & DAVRequestOptions
    ): Promise<FolderResource> {
      await dav.mkcol(urlJoin(space.webDavPath, path, { leadingSlash: true }))

      if (fetchFolder) {
        return getFileInfoFactory.getFileInfo(space, { path }, opts)
      }
    }
  }
}
