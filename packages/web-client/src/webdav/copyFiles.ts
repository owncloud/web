import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { DAV, DAVRequestOptions } from './client'
import { WebDavOptions } from './types'

export const CopyFilesFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    copyFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath }: { path: string },
      targetSpace: SpaceResource,
      { path: targetPath }: { path: string },
      { overwrite, ...opts }: { overwrite?: boolean } & DAVRequestOptions = {}
    ) {
      return dav.copy(
        urlJoin(sourceSpace.webDavPath, sourcePath),
        urlJoin(targetSpace.webDavPath, targetPath),
        { overwrite: overwrite || false, ...opts }
      )
    }
  }
}
