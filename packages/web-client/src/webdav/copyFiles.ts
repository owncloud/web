import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export const CopyFilesFactory = ({ sdk }: WebDavOptions) => {
  return {
    copyFiles(
      sourceSpace: SpaceResource,
      { path: sourcePath },
      targetSpace: SpaceResource,
      { path: targetPath },
      options?: { overwrite?: boolean }
    ): Promise<void> {
      if (isPublicSpaceResource(sourceSpace)) {
        return sdk.publicFiles.copy(
          urlJoin(sourceSpace.webDavPath.replace(/^\/public-files/, ''), sourcePath),
          urlJoin(targetSpace.webDavPath.replace(/^\/public-files/, ''), targetPath),
          sourceSpace.publicLinkPassword,
          options?.overwrite || false
        )
      } else {
        return sdk.files.copy(
          urlJoin(sourceSpace.webDavPath, sourcePath),
          urlJoin(targetSpace.webDavPath, targetPath),
          options?.overwrite || false
        )
      }
    }
  }
}
