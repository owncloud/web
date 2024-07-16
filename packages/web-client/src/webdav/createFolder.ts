import { FolderResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { DAV, DAVRequestOptions } from './client/dav'
import { WebDavOptions } from './types'
import { getWebDavPath } from './utils'

type CreateFolderOptions = {
  path: string
  parentFolderId?: string
  folderName?: string
  fetchFolder?: boolean
} & DAVRequestOptions

export const CreateFolderFactory = (
  dav: DAV,
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  options: WebDavOptions
) => {
  return {
    async createFolder(
      space: SpaceResource,
      { path, parentFolderId, folderName, fetchFolder = true, ...opts }: CreateFolderOptions
    ): Promise<FolderResource> {
      const webDavPath = getWebDavPath(space, { fileId: parentFolderId, path, name: folderName })
      await dav.mkcol(webDavPath)

      if (fetchFolder) {
        // FIXME: mkcol doesn't return a fileId: https://github.com/owncloud/ocis/issues/9618
        return getFileInfoFactory.getFileInfo(space, { path }, opts)
      }
    }
  }
}
