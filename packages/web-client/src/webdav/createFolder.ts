import { DavProperties } from './constants'
import { FolderResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'

export const CreateFolderFactory = (
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  { sdk }: WebDavOptions
) => {
  return {
    async createFolder(space: SpaceResource, { path }: { path?: string }): Promise<FolderResource> {
      if (isPublicSpaceResource(space)) {
        await sdk.publicFiles.createFolder(
          urlJoin(space.webDavPath.replace(/^\/public-files/, ''), path),
          null,
          space.publicLinkPassword
        )
      } else {
        await sdk.files.createFolder(urlJoin(space.webDavPath, path), DavProperties.Default)
      }

      return getFileInfoFactory.getFileInfo(space, { path })
    }
  }
}
