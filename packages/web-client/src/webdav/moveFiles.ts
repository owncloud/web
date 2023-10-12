import { SpaceResource, isShareSpaceResource, SHARE_JAIL_ID } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, buildAuthHeader } from './client'
import { unref } from 'vue'

export const MoveFilesFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    moveFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean }
    ) {
      const headers = buildAuthHeader(unref(accessToken), sourceSpace)
      if (isShareSpaceResource(sourceSpace) && sourcePath === '/') {
        return dav.move(
          `${sourceSpace.webDavPath}/${sourcePath || ''}`,
          `/spaces/${SHARE_JAIL_ID}!${SHARE_JAIL_ID}/${targetPath || ''}`,
          { overwrite: options?.overwrite || false, headers }
        )
      }

      return dav.move(
        `${sourceSpace.webDavPath}/${sourcePath || ''}`,
        `${targetSpace.webDavPath}/${targetPath || ''}`,
        { overwrite: options?.overwrite || false, headers }
      )
    }
  }
}
