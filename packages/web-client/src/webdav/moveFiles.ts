import { urlJoin } from 'web-pkg/src/utils'
import { isPublicSpaceResource, isShareSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export const MoveFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    moveFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean; hasShareJail?: boolean; shareJailId?: string }
    ): Promise<void> {
      if (options?.hasShareJail && isShareSpaceResource(sourceSpace)) {
        return sdk.files.move(
          `${sourceSpace.webDavPath}/${sourcePath || ''}`,
          `/spaces/${options?.shareJailId}!${options?.shareJailId}/${targetPath || ''}`,
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
