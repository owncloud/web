import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'
import { buildAuthHeader, buildPublicLinkAuthHeader, DAV } from './client'
import { HttpError } from '../errors'
import { unref } from 'vue'
import { ResponseType } from 'axios'

export type GetFileContentsResponse = {
  body: any
  [key: string]: any
}

export const GetFileContentsFactory = (dav: DAV, { accessToken, axiosClient }: WebDavOptions) => {
  return {
    async getFileContents(
      space: SpaceResource,
      { path }: { path?: string },
      {
        responseType = 'text',
        noCache = true
      }: {
        responseType?: ResponseType
        noCache?: boolean
      } = {}
    ): Promise<GetFileContentsResponse> {
      try {
        const response = await axiosClient.get(dav.getFileUrl(urlJoin(space.webDavPath, path)), {
          responseType,
          headers: {
            Authorization:
              isPublicSpaceResource(space) && space.publicLinkPassword
                ? buildPublicLinkAuthHeader(space.publicLinkPassword)['Authorization']
                : buildAuthHeader(unref(accessToken), space)['Authorization'],
            ...(noCache && { 'Cache-Control': 'no-cache' })
          }
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
