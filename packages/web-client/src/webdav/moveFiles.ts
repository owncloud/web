import { SpaceResource, isShareSpaceResource, SHARE_JAIL_ID } from '../helpers'
import { WebDavOptions } from './types'
import { DAV } from './client'

export const MoveFilesFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    moveFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean }
    ) {
      if (isShareSpaceResource(sourceSpace) && sourcePath === '/') {
        return dav.move(
          `${sourceSpace.webDavPath}/${sourcePath || ''}`,
          `/spaces/${SHARE_JAIL_ID}!${SHARE_JAIL_ID}/${targetPath || ''}`,
          { overwrite: options?.overwrite || false }
        )
      }

      return dav.move(
        `${sourceSpace.webDavPath}/${sourcePath || ''}`,
        `${targetSpace.webDavPath}/${targetPath || ''}`,
        { overwrite: options?.overwrite || false }
      )
    }
  }
}
