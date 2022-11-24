import { urlJoin } from '../utils'
import { isPublicSpaceResource, SpaceResource } from '../helpers'
import { WebDavOptions } from './types'

export type GetFileContentsResponse = {
  body: any
  [key: string]: any
}

export const GetFileContentsFactory = ({ sdk }: WebDavOptions) => {
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
      if (isPublicSpaceResource(space)) {
        const res = await sdk.publicFiles.download(
          '',
          urlJoin(space.webDavPath.replace(/^\/public-files/, ''), path),
          space.publicLinkPassword,
          {
            noCache
          }
        )
        res.statusCode = res.status
        return {
          response: res,
          body: await res[responseType](),
          headers: {
            ETag: res.headers.get('etag'),
            'OC-ETag': res.headers.get('oc-etag'),
            'OC-FileId': res.headers.get('oc-fileid')
          }
        }
      }

      return sdk.files.getFileContents(urlJoin(space.webDavPath, path), {
        resolveWithResponseObject: true,
        noCache: true,
        responseType
      })
    }
  }
}
