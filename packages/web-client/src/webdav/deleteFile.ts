import { urlJoin } from '../utils'
import { FileResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export const DeleteFileFactory = ({ sdk }: WebDavOptions) => {
  return {
    deleteFile(space: SpaceResource, { path }: { path: string }): Promise<FileResource> {
      if (isPublicSpaceResource(space)) {
        return sdk.publicFiles.delete(
          urlJoin(space.webDavPath.replace(/^\/public-files/, ''), path),
          null,
          space.publicLinkPassword
        )
      }

      return sdk.files.delete(urlJoin(space.webDavPath, path))
    }
  }
}
