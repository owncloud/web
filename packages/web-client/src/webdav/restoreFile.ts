import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { DAV } from './client'

export const RestoreFileFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    restoreFile(
      space: SpaceResource,
      { id }: { id: string | number },
      { path: restorePath }: { path: string },
      { overwrite }: { overwrite?: boolean }
    ) {
      if (isPublicSpaceResource(space)) {
        return
      }

      const restoreWebDavPath = urlJoin(space.webDavPath, restorePath)
      return dav.move(urlJoin(space.webDavTrashPath, id), restoreWebDavPath, { overwrite })
    }
  }
}
