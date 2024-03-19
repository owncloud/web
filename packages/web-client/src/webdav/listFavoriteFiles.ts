import { urlJoin } from '../utils'
import { WebDavOptions } from './types'
import { DAV, buildAuthHeader } from './client'
import { unref } from 'vue'
import { DavProperties } from './constants'

export const ListFavoriteFilesFactory = (dav: DAV, { accessToken, user }: WebDavOptions) => {
  return {
    listFavoriteFiles({ davProperties = DavProperties.Default } = {}) {
      const headers = buildAuthHeader(unref(accessToken))

      return dav.report(urlJoin('files', unref(user).onPremisesSamAccountName), {
        headers,
        properties: davProperties,
        filterRules: { favorite: 1 }
      })
    }
  }
}
