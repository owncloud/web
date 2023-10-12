import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { DAV, buildAuthHeader } from './client'
import { WebDavOptions } from './types'
import { unref } from 'vue'

export const CopyFilesFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    copyFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean }
    ) {
      const headers = buildAuthHeader(unref(accessToken), sourceSpace)
      return dav.copy(
        urlJoin(sourceSpace.webDavPath, sourcePath),
        urlJoin(targetSpace.webDavPath, targetPath),
        { overwrite: options?.overwrite || false, headers }
      )
    }
  }
}
