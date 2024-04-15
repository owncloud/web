import { urlJoin } from '../utils'
import { DAV } from './client'
import { DavProperty } from './constants'
import { WebDavOptions } from './types'

export const GetPathForFileIdFactory = (dav: DAV, options: WebDavOptions) => {
  return {
    async getPathForFileId(id: string): Promise<string> {
      const result = await dav.propfind(urlJoin('meta', id, { leadingSlash: true }), {
        properties: [DavProperty.MetaPathForUser]
      })

      return result[0].props[DavProperty.MetaPathForUser]
    }
  }
}
