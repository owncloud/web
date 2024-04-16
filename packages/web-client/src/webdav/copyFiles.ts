import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { DAV } from './client'
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
      return dav.copy(
        urlJoin(sourceSpace.webDavPath, sourcePath),
        urlJoin(targetSpace.webDavPath, targetPath),
        { overwrite: options?.overwrite || false }
      )
    }
  }
}
