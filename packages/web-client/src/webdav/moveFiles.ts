import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV } from './client'

export const MoveFilesFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    moveFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath }: { path: string },
      targetSpace: SpaceResource,
      { path: targetPath }: { path: string },
      options?: { overwrite?: boolean }
    ) {
      return dav.move(
        `${sourceSpace.webDavPath}/${sourcePath || ''}`,
        `${targetSpace.webDavPath}/${targetPath || ''}`,
        { overwrite: options?.overwrite || false }
      )
    }
  }
}
