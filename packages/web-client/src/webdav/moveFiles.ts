import { isPublicSpaceResource, SpaceResource } from '../helpers'
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
      if (isPublicSpaceResource(sourceSpace)) {
        return sdk.publicFiles.move(
          `${sourceSpace.webDavPath.replace(/^\/public-files/, '')}/${sourcePath || ''}`,
          `${targetSpace.webDavPath.replace(/^\/public-files/, '')}/${targetPath || ''}`,
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
