import { DavProperties } from 'web-pkg/src/constants'
import { FolderResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'

export const CreateFolderFactory = (
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  { sdk }: WebDavOptions
) => {
  return {
    async createFolder(space: SpaceResource, { path }: { path?: string }): Promise<FolderResource> {
      if (isPublicSpaceResource(space)) {
        await sdk.publicFiles.createFolder(
          `${space.webDavPath.replace(/^\/public-files/, '')}/${path || ''}`,
          null,
          space.publicLinkPassword
        )
      } else {
        await sdk.files.createFolder(`${space.webDavPath}/${path || ''}`, DavProperties.Default)
      }

      return getFileInfoFactory.getFileInfo(space, { path }) as Promise<FolderResource>
    }
  }
}
