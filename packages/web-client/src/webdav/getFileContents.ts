import { Headers } from 'webdav'
import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { buildPublicLinkAuthHeader, DAV } from './client'
import { HttpError } from '../errors'

export type GetFileContentsResponse = {
  body: any
  [key: string]: any
}

export const GetFileContentsFactory = (dav: DAV, { clientService }: WebDavOptions) => {
  return {
    async getFileContents(
      space: SpaceResource,
      { path }: { path?: string },
      {
        responseType = 'text',
        noCache = true
      }: {
        responseType?: 'arrayBuffer' | 'blob' | 'text'
        noCache?: boolean
      } = {}
    ): Promise<GetFileContentsResponse> {
      const { httpAuthenticated, httpUnAuthenticated } = clientService
      const client = isPublicSpaceResource(space) ? httpUnAuthenticated : httpAuthenticated

      const requestOptions = {
        responseType,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(noCache && { 'Cache-Control': 'no-cache' })
        } as Headers
      }

      if (isPublicSpaceResource(space) && space.publicLinkPassword) {
        requestOptions.headers.Authorization = buildPublicLinkAuthHeader(space.publicLinkPassword)
      }

      try {
        const response = await client.get(
          dav.getFileUrl(urlJoin(space.webDavPath, path)),
          requestOptions
        )
        return {
          response,
          body: response.data,
          headers: {
            ETag: response.headers.get('etag'),
            'OC-ETag': response.headers.get('oc-etag'),
            'OC-FileId': response.headers.get('oc-fileid')
          }
        }
      } catch (error) {
        const { message, response } = error
        throw new HttpError(message, response, response.status)
      }
    }
  }
}
