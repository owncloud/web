import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { urlJoin } from '../utils'
import { Resource } from '../helpers'
import { DAV, buildAuthHeader } from './client'
import { unref } from 'vue'

export const RestoreFileVersionFactory = (dav: DAV, { accessToken, user }: WebDavOptions) => {
  return {
    restoreFileVersion(space: SpaceResource, { id, path }: Resource, versionId: string) {
      const webDavPath = urlJoin(space.webDavPath, path)
      const headers = buildAuthHeader(unref(accessToken), space)
      const source = urlJoin('meta', id, 'v', versionId, { leadingSlash: true })
      const target = urlJoin('files', unref(user).onPremisesSamAccountName, webDavPath, {
        leadingSlash: true
      })
      return dav.copy(source, target, { headers })
    }
  }
}
