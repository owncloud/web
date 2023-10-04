import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { DAV, buildPublicLinkAuthHeader } from './client'
import { WebDavOptions } from './types'

export const CopyFilesFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    copyFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean }
    ) {
      if (isPublicSpaceResource(sourceSpace)) {
        const headers = { Authorization: null }
        if (sourceSpace.publicLinkPassword) {
          headers.Authorization = buildPublicLinkAuthHeader(sourceSpace.publicLinkPassword)
        }

        return dav.copy(
          urlJoin(sourceSpace.webDavPath, sourcePath),
          urlJoin(targetSpace.webDavPath, targetPath),
          { overwrite: options?.overwrite || false, headers }
        )
      }

      return dav.copy(
        urlJoin(sourceSpace.webDavPath, sourcePath),
        urlJoin(targetSpace.webDavPath, targetPath),
        { overwrite: options?.overwrite || false }
      )
    }
  }
}
