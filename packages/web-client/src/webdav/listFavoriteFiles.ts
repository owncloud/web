import { urlJoin } from '../utils'
import { WebDavOptions } from './types'
import { DAV } from './client'
import { DavProperties, DavPropertyValue } from './constants'

export const ListFavoriteFilesFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    listFavoriteFiles({
      davProperties = DavProperties.Default,
      username = ''
    }: { davProperties?: DavPropertyValue[]; username?: string } = {}) {
      return dav.report(urlJoin('files', username), {
        properties: davProperties,
        filterRules: { favorite: 1 }
      })
    }
  }
}
