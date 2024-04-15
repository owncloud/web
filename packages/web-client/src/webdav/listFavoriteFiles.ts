import { urlJoin } from '../utils'
import { WebDavOptions } from './types'
import { DAV, buildAuthHeader } from './client'
import { DavProperties } from './constants'

export const ListFavoriteFilesFactory = (dav: DAV, { accessToken, user }: WebDavOptions) => {
  return {
    listFavoriteFiles({ davProperties = DavProperties.Default } = {}) {
      const headers = buildAuthHeader(accessToken)

      return dav.report(urlJoin('files', user.onPremisesSamAccountName), {
        headers,
        properties: davProperties,
        filterRules: { favorite: 1 }
      })
    }
  }
}
