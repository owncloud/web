import { FileResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { Resource } from '../helpers'

export const RestoreFileVersionFactory = ({ sdk }: WebDavOptions) => {
  return {
    restoreFileVersion(
      space: SpaceResource,
      { id, path }: Resource,
      versionId: string
    ): Promise<FileResource> {
      const webDavPath = urlJoin(space.webDavPath, path)
      return sdk.fileVersions.restoreFileVersion(id, versionId, webDavPath)
    }
  }
}
