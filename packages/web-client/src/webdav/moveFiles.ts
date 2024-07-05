import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, DAVRequestOptions } from './client'

export const MoveFilesFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    moveFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath }: { path: string },
      targetSpace: SpaceResource,
      { path: targetPath }: { path: string },
      { overwrite, ...opts }: { overwrite?: boolean } & DAVRequestOptions = {}
    ) {
      return dav.move(
        `${sourceSpace.webDavPath}/${sourcePath || ''}`,
        `${targetSpace.webDavPath}/${targetPath || ''}`,
        { overwrite: overwrite || false, ...opts }
      )
    }
  }
}
