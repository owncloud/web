import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { buildAuthHeader, DAV } from './client'

export const RestoreFileFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
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
      const headers = buildAuthHeader(accessToken)
      return dav.move(urlJoin(space.webDavTrashPath, id), restoreWebDavPath, { overwrite, headers })
    }
  }
}
