import { buildWebDavFilesPath, buildWebDavFilesTrashPath, buildWebDavSpacesTrashPath } from 'files/src/helpers/resources'
import { urlJoin } from 'web-pkg/src/utils'
import { buildWebDavSpacesPath, FileResource, isPublicSpaceResource, isShareSpaceResource, Resource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export const RestoreFileFactory = ({ sdk }: WebDavOptions) => {
  return {
    async restoreFile(
      space: SpaceResource,
      userId: string | number,
      id: string | number,
      restorePath: string,
      { overwrite }: { overwrite?: boolean },
    ): Promise<FileResource> {
      if (isPublicSpaceResource(space)) {
        return
      }
      debugger;
      const path = isShareSpaceResource(space)
          ? buildWebDavSpacesTrashPath(space.id)
          : buildWebDavFilesTrashPath(userId)
      const restorePathBuilt = isShareSpaceResource(space)
          ? buildWebDavSpacesPath(space.id, restorePath)
          : buildWebDavFilesPath(userId, restorePath)
      return sdk.fileTrash.restore(path, id, restorePathBuilt, overwrite)
    }
  }
}
