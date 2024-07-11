import { extractNodeId, FolderResource, isPublicSpaceResource, SpaceResource } from '../helpers'
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
        fileId,
        folderName,
        fetchFolder = true,
        ...opts
      }: {
        fileId?: string
        path?: string
        folderName?: string
        fetchFolder?: boolean
      } & DAVRequestOptions
    ): Promise<FolderResource> {
      let webDavPath = urlJoin(space.webDavPath, path)
      if (fileId && !isPublicSpaceResource(space)) {
        webDavPath = urlJoin(`${space.webDavPath}!${extractNodeId(fileId)}`, folderName)
      }

      await dav.mkcol(webDavPath)

      if (fetchFolder) {
        // mkcol doesn't return a fileId, hence we need to use the path to fetch the folder
        return getFileInfoFactory.getFileInfo(space, { path }, opts)
      }
    }
  }
}
