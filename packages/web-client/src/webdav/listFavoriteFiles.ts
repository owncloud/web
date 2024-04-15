import { urlJoin } from '../utils'
import { WebDavOptions } from './types'
import { DAV } from './client'
import { DavProperties } from './constants'

export const ListFavoriteFilesFactory = (dav: DAV, { user }: WebDavOptions) => {
  return {
    listFavoriteFiles({ davProperties = DavProperties.Default } = {}) {
      return dav.report(urlJoin('files', user.onPremisesSamAccountName), {
        properties: davProperties,
        filterRules: { favorite: 1 }
      })
    }
  }
}
