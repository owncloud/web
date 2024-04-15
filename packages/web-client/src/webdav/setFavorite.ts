import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, buildAuthHeader } from './client'
import { DavProperty } from './constants'

export const SetFavoriteFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    setFavorite(space: SpaceResource, { path }: { path: string }, value: unknown) {
      const headers = buildAuthHeader(accessToken, space)
      const properties = { [DavProperty.IsFavorite]: value ? 'true' : 'false' }

      return dav.propPatch(urlJoin(space.webDavPath, path), properties, { headers })
    }
  }
}
