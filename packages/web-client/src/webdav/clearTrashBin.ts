import { Resource, SpaceResource, buildWebDavSpacesTrashPath } from '../helpers'
import { WebDavOptions } from './types'
import { DAV } from './client'
import { urlJoin } from '../utils'

interface ClearTrashBinOptions {
  id?: Resource['id']
}

export const ClearTrashBinFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    clearTrashBin(space: SpaceResource, { id }: ClearTrashBinOptions = {}) {
      let path = buildWebDavSpacesTrashPath(space.id.toString())

      if (id) {
        path = urlJoin(path, id)
      }

      return dav.delete(path)
    }
  }
}
