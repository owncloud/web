import { SpaceResource } from '../helpers'
import { urlJoin } from '../utils'
import { DAV } from './client'

export const GetPublicFileUrlFactory = (dav: DAV) => {
  return {
    getPublicFileUrl(space: SpaceResource, publicLinkToken: string): string {
      return dav.getFileUrl(urlJoin('public-files', publicLinkToken))
    }
  }
}
