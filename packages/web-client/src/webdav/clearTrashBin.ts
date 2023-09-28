import {
  Resource,
  SpaceResource,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from '../helpers'
import { WebDavOptions } from './types'
import { User } from '../helpers'

interface ClearTrashBinOptions {
  hasShareJail?: boolean
  id?: Resource['id']
  user?: User
}

export const ClearTrashBinFactory = ({ sdk }: WebDavOptions) => {
  return {
    clearTrashBin(
      space: SpaceResource,
      { hasShareJail = true, id, user }: ClearTrashBinOptions = {}
    ): Promise<void> {
      const path = hasShareJail
        ? buildWebDavSpacesTrashPath(space.id)
        : buildWebDavFilesTrashPath(user.id)
      return sdk.fileTrash.clearTrashBin(path, id)
    }
  }
}
