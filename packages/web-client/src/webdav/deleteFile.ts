import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV } from './client'

export const DeleteFileFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    deleteFile(space: SpaceResource, { path }: { path: string }) {
      return dav.delete(urlJoin(space.webDavPath, path))
    }
  }
}
