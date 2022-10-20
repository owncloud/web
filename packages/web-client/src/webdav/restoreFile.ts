import {
  buildWebDavFilesPath,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from 'files/src/helpers/resources'
import {
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
      const path = hasShareJail
        ? buildWebDavSpacesTrashPath(space.id)
        : buildWebDavFilesTrashPath(userId)
      const restorePathBuilt = hasShareJail
        ? buildWebDavSpacesPath(space.id, restorePath)
        : buildWebDavFilesPath(userId, restorePath)
      return sdk.fileTrash.restore(path, id, restorePathBuilt, overwrite)
    }
  }
}
