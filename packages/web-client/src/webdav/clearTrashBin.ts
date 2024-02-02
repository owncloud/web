import { unref } from 'vue'
import { Resource, SpaceResource, buildWebDavSpacesTrashPath } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, buildAuthHeader } from './client'
import { urlJoin } from '../utils'

interface ClearTrashBinOptions {
  id?: Resource['id']
}

export const ClearTrashBinFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    clearTrashBin(space: SpaceResource, { id }: ClearTrashBinOptions = {}) {
      let path = buildWebDavSpacesTrashPath(space.id.toString())

      if (id) {
        path = urlJoin(path, id)
      }

      const headers = buildAuthHeader(unref(accessToken), space)
      return dav.delete(path, { headers })
    }
  }
}
