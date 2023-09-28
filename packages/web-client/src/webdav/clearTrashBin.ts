import {
  Resource,
  SpaceResource,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from '../helpers'
import { WebDavOptions } from './types'
import { User } from '../helpers'

interface ClearTrashBinOptions {
  id?: Resource['id']
}

export const ClearTrashBinFactory = ({ sdk, store }: WebDavOptions) => {
  return {
    clearTrashBin(space: SpaceResource, { id }: ClearTrashBinOptions = {}): Promise<void> {
      const hasShareJail = store.getters.capabilities?.spaces?.share_jail === true
      const user = store.getters.user as User

      const path = hasShareJail
        ? buildWebDavSpacesTrashPath(space.id)
        : buildWebDavFilesTrashPath(user.id)
      return sdk.fileTrash.clearTrashBin(path, id)
    }
  }
}
