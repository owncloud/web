import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV } from './client'
import { DavProperty } from './constants'

export const SetFavoriteFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    setFavorite(space: SpaceResource, { path }: { path: string }, value: unknown) {
      const properties = { [DavProperty.IsFavorite]: value ? 'true' : 'false' }

      return dav.propPatch(urlJoin(space.webDavPath, path), properties)
    }
  }
}
