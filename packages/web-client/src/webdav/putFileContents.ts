import { OwnCloudSdk } from 'web-pkg/src/services'
import { FileResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'

export const PutFileContentsFactory = (
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  sdk: OwnCloudSdk
) => {
  return {
    async putFileContents(
      space: SpaceResource,
      { path, content = '' }: { path?: string; content?: string }
    ): Promise<FileResource> {
      if (isPublicSpaceResource(space)) {
        await sdk.publicFiles.putFileContents(
          '',
          `${space.webDavPath.replace(/^\/public-files/, '')}/${path || ''}`,
          space.publicLinkPassword,
          content
        )
      } else {
        await sdk.files.putFileContents(`${space.webDavPath}/${path || ''}`, content)
      }

      return getFileInfoFactory.getFileInfo(space, { path }) as Promise<FileResource>
    }
  }
}
