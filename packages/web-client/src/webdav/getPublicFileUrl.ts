import { SpaceResource } from '../helpers'
import { urlJoin } from '../utils'
import { DAV } from './client'
import { WebDavOptions } from './types'

export const GetPublicFileUrlFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    getPublicFileUrl(space: SpaceResource, publicLinkToken: string): string {
      return dav.getFileUrl(urlJoin('public-files', publicLinkToken))
    }
  }
}
