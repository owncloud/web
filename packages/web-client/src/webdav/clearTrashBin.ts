import { unref } from 'vue'
import {
  Resource,
  SpaceResource,
  buildWebDavFilesTrashPath,
  buildWebDavSpacesTrashPath
} from '../helpers'
import { WebDavOptions } from './types'
import { DAV } from './client'
import { urlJoin } from '../utils'

interface ClearTrashBinOptions {
  id?: Resource['id']
}

export const ClearTrashBinFactory = (dav: DAV, { capabilities, user }: WebDavOptions) => {
  return {
    clearTrashBin(space: SpaceResource, { id }: ClearTrashBinOptions = {}) {
      const hasShareJail = unref(capabilities)?.spaces?.share_jail === true
      let path = hasShareJail
        ? buildWebDavSpacesTrashPath(space.id.toString())
        : buildWebDavFilesTrashPath(unref(user).id)

      if (id) {
        path = urlJoin(path, id)
      }

      return dav.delete(path)
    }
  }
}
