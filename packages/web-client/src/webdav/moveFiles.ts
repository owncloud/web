import { urlJoin } from '../utils'
import {
  isPublicSpaceResource,
  SpaceResource,
  isShareSpaceResource,
  SHARE_JAIL_ID
} from '../helpers'
import { WebDavOptions } from './types'

export const MoveFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    moveFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean }
    ): Promise<void> {
      if (isShareSpaceResource(sourceSpace) && sourcePath === '/') {
        return sdk.files.move(
          `${sourceSpace.webDavPath}/${sourcePath || ''}`,
          `/spaces/${SHARE_JAIL_ID}!${SHARE_JAIL_ID}/${targetPath || ''}`,
          options?.overwrite || false
        )
      }
      if (isPublicSpaceResource(sourceSpace)) {
        return sdk.publicFiles.move(
          urlJoin(sourceSpace.webDavPath.replace(/^\/public-files/, ''), sourcePath),
          urlJoin(targetSpace.webDavPath.replace(/^\/public-files/, ''), targetPath),
          sourceSpace.publicLinkPassword,
          options?.overwrite || false
        )
      } else {
        return sdk.files.move(
          `${sourceSpace.webDavPath}/${sourcePath || ''}`,
          `${targetSpace.webDavPath}/${targetPath || ''}`,
          options?.overwrite || false
        )
      }
    }
  }
}
