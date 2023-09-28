import { urlJoin } from '../utils'
import { FileResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { GetFileInfoFactory } from './getFileInfo'
import { WebDavOptions } from './types'

export const PutFileContentsFactory = (
  getFileInfoFactory: ReturnType<typeof GetFileInfoFactory>,
  { sdk }: WebDavOptions
) => {
  return {
    async putFileContents(
      space: SpaceResource,
      {
        path,
        content = '',
        ...options
      }: {
        path?: string
        content?: string
        previousEntityTag?: string
        headers?: Record<string, string>
        overwrite?: boolean
      }
    ): Promise<FileResource> {
      if (isPublicSpaceResource(space)) {
        await sdk.publicFiles.putFileContents(
          '',
          urlJoin(space.webDavPath.replace(/^\/public-files/, ''), path),
          space.publicLinkPassword,
          content,
          options
        )
      } else {
        await sdk.files.putFileContents(urlJoin(space.webDavPath, path), content, options)
      }

      return getFileInfoFactory.getFileInfo(space, { path }) as Promise<FileResource>
    }
  }
}
