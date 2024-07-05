import { urlJoin } from '../utils'
import { SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { DAV, DAVRequestOptions } from './client'
import { HttpError } from '../errors'
import { ResponseType } from 'axios'

export type GetFileContentsResponse = {
  body: any
  [key: string]: any
}

export const GetFileContentsFactory = (dav: DAV, { axiosClient }: WebDavOptions) => {
  return {
    async getFileContents(
      space: SpaceResource,
      { path }: { path?: string },
      {
        responseType = 'text',
        noCache = true,
        headers,
        ...opts
      }: {
        responseType?: ResponseType
        noCache?: boolean
      } & DAVRequestOptions = {}
    ): Promise<GetFileContentsResponse> {
      try {
        const response = await axiosClient.get(dav.getFileUrl(urlJoin(space.webDavPath, path)), {
          responseType,
          headers: {
            ...(noCache && { 'Cache-Control': 'no-cache' }),
            ...(headers || {})
          },
          ...opts
        })
        return {
          response,
          body: response.data,
          headers: {
            ETag: response.headers['etag'],
            'OC-ETag': response.headers['oc-etag'],
            'OC-FileId': response.headers['oc-fileid']
          }
        }
      } catch (error) {
        const { message, response } = error
        throw new HttpError(message, response, response.status)
      }
    }
  }
}
