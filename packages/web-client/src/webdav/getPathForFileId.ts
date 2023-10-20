import { unref } from 'vue'
import { urlJoin } from '../utils'
import { DAV, buildAuthHeader } from './client'
import { DavProperty } from './constants'
import { WebDavOptions } from './types'

export const GetPathForFileIdFactory = (dav: DAV, { accessToken }: WebDavOptions) => {
  return {
    async getPathForFileId(id: string): Promise<string> {
      const headers = buildAuthHeader(unref(accessToken))
      const result = await dav.propfind(urlJoin('meta', id, { leadingSlash: true }), {
        properties: [DavProperty.MetaPathForUser],
        headers
      })

      return result[0].props[DavProperty.MetaPathForUser]
    }
  }
}
