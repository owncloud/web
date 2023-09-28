import { unref } from 'vue'
import {
  Resource,
  SpaceResource,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from '../helpers'
import { WebDavOptions } from './types'

interface ClearTrashBinOptions {
  id?: Resource['id']
}

export const ClearTrashBinFactory = ({ sdk, capabilities, user }: WebDavOptions) => {
  return {
    clearTrashBin(space: SpaceResource, { id }: ClearTrashBinOptions = {}): Promise<void> {
      const hasShareJail = unref(capabilities)?.spaces?.share_jail === true
      const path = hasShareJail
        ? buildWebDavSpacesTrashPath(space.id)
        : buildWebDavFilesTrashPath(unref(user).id)
      return sdk.fileTrash.clearTrashBin(path, id)
    }
  }
}
