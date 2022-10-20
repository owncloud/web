import {
  buildWebDavFilesPath,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesPath,
  FileResource,
  isPublicSpaceResource,
  SpaceResource
} from '../helpers'
import { WebDavOptions } from './types'

export const RestoreFileFactory = ({ sdk }: WebDavOptions) => {
  return {
    async restoreFile(
      space: SpaceResource,
      userId: string | number,
      hasShareJail: boolean,
      id: string | number,
      restorePath: string,
      { overwrite }: { overwrite?: boolean }
    ): Promise<FileResource> {
      if (isPublicSpaceResource(space)) {
        return
      }
      const path = hasShareJail ? space.getWebDavTrashPath() : buildWebDavFilesTrashPath(userId)
      const restorePathBuilt = hasShareJail
        ? buildWebDavSpacesPath(space.id, restorePath)
        : buildWebDavFilesPath(userId, restorePath)
      return sdk.fileTrash.restore(path, id, restorePathBuilt, overwrite)
    }
  }
}
