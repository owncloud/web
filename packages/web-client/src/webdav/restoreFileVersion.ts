import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { Resource } from '../helpers'
import { DAV } from './client'

export const RestoreFileVersionFactory = (dav: DAV, { user }: WebDavOptions) => {
  return {
    restoreFileVersion(space: SpaceResource, { id, path }: Resource, versionId: string) {
      const webDavPath = urlJoin(space.webDavPath, path)
      const source = urlJoin('meta', id, 'v', versionId, { leadingSlash: true })
      const target = urlJoin('files', user.onPremisesSamAccountName, webDavPath, {
        leadingSlash: true
      })
      return dav.copy(source, target)
    }
  }
}
