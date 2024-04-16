import { Headers } from 'webdav'
import { urlJoin } from '../utils'
import { DAV } from './client'
import { DavProperty } from './constants'
import { WebDavOptions } from './types'

export const GetPathForFileIdFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    async getPathForFileId(
      id: string,
      { headers = {} }: { headers?: Headers } = {}
    ): Promise<string> {
      const result = await dav.propfind(urlJoin('meta', id, { leadingSlash: true }), {
        properties: [DavProperty.MetaPathForUser],
        headers
      })

      return result[0].props[DavProperty.MetaPathForUser]
    }
  }
}
