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
      const p = (path || '').replace(/\/+$/, '')
      if (isPublicSpaceResource(space)) {
        await sdk.publicFiles.createFolder(
          `${space.webDavPath.replace(/^\/public-files/, '')}/${p}`,
          null,
          space.publicLinkPassword
        )
      } else {
        await sdk.files.createFolder(`${space.webDavPath}/${p}`, DavProperties.Default)
      }

      return getFileInfoFactory.getFileInfo(space, { path: p })
    }
  }
}
