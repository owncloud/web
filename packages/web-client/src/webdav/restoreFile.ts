import { FileResource, isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'

export const RestoreFileFactory = ({ sdk }: WebDavOptions) => {
  return {
    restoreFile(
      space: SpaceResource,
      { id }: { id: string | number },
      { path: restorePath }: { path: string },
      { overwrite }: { overwrite?: boolean }
    ): Promise<FileResource> {
      if (isPublicSpaceResource(space)) {
        return
      }
      const restoreWebDavPath = urlJoin(space.webDavPath, restorePath)
      return sdk.fileTrash.restore(space.webDavTrashPath, id, restoreWebDavPath, overwrite)
    }
  }
}
