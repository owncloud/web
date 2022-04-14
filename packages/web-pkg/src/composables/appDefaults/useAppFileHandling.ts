import { Store } from 'vuex'
import { unref } from '@vue/composition-api'
import qs from 'qs'

import { Resource } from 'files/src/helpers/resource'
import { MaybeRef } from '../../utils'
import { ClientService, clientService as defaultClientService } from '../../services'
import { DavProperties } from '../../constants'

interface AppFileHandlingOptions {
  store: Store<any>
  clientService?: ClientService
  isPublicLinkContext: MaybeRef<boolean>
  accessToken: MaybeRef<string>
  publicLinkPassword: MaybeRef<string>
  publicToken: MaybeRef<string>
}

type QueryParameters = Record<string, string>
export interface AppFileHandlingResult {
  getUrlForResource(r: Resource, query?: QueryParameters): string

  makeRequest(method: string, url: string, extraHeaders: Record<string, any>): Promise<any>
  getFileInfo(filePath: string, davProperties: DavProperties): Promise<any>
  getFileContents(filePath: string, options: Record<string, any>): Promise<any>
  putFileContents(filePath: string, content: string, options: Record<string, any>): Promise<any>
}

export function useAppFileHandling(options: AppFileHandlingOptions): AppFileHandlingResult {
  const client = (options.clientService || defaultClientService).owncloudSdk
  const isPublicLinkContext = options.isPublicLinkContext
  const publicLinkPassword = options.publicLinkPassword
  const publicToken = options.publicToken
  const accessToken = options.accessToken

  const getUrlForResource = (
    { webDavPath, downloadURL }: Resource,
    query: QueryParameters = null
  ) => {
    const queryStr = qs.stringify(query)
    if (unref(isPublicLinkContext)) {
      // If the resource does not contain the downloadURL we fallback to the normal
      // public files path.
      if (!downloadURL) {
        // TODO: check whether we can fix the resource to always contain public-files in the webDavPath
        const urlPath = ['public-files', webDavPath].join('/')
        return [client.files.getFileUrl(urlPath), queryStr].filter(Boolean).join('?')
      }

      // In a public context, i.e. public shares, the downloadURL contains a pre-signed url to
      // download the file.
      const [url, signedQuery] = downloadURL.split('?')

      // Since the pre-signed url contains query parameters and the caller of this method
      // can also provide query parameters we have to combine them.
      const combinedQuery = [queryStr, signedQuery].filter(Boolean).join('&')
      return [url, combinedQuery].filter(Boolean).join('?')
    }

    return [client.files.getFileUrl(webDavPath), queryStr].filter(Boolean).join('?')
  }

  const makeRequest = async (method: string, url: string, extraHeaders: Record<string, any>) => {
    const plToken = unref(publicToken)
    const plPassword = unref(publicLinkPassword)
    const isPlCtx = unref(isPublicLinkContext)
    const aToken = unref(accessToken)

    const headers = {
      'X-Requested-With': 'XMLHttpRequest',
      ...(isPlCtx &&
        plPassword && {
          Authorization: 'Basic ' + Buffer.from(['public', plPassword].join(':')).toString('base64')
        }),
      ...(isPlCtx && plToken && { 'public-token': plToken }),
      ...(aToken && { Authorization: 'Bearer ' + aToken })
    }
    return fetch(url, {
      method,
      headers: {
        ...headers,
        ...extraHeaders
      }
    })
  }

  const getFileContents = async (filePath: string, options: Record<string, any>) => {
    if (unref(isPublicLinkContext)) {
      const res = await client.publicFiles.download('', filePath, unref(publicLinkPassword))
      res.statusCode = res.status

      const responseType = ['arrayBuffer', 'blob', 'text'].includes(options?.responseType)
        ? options.responseType
        : 'text'
      return {
        response: res,
        body: await res[responseType](),
        headers: {
          ETag: res.headers.get('etag'),
          'OC-FileId': res.headers.get('oc-fileid')
        }
      }
    } else {
      return client.files.getFileContents(filePath, {
        resolveWithResponseObject: true,
        ...options
      })
    }
  }

  const getFileInfo = async (filePath: string, davProperties: DavProperties) => {
    if (unref(isPublicLinkContext)) {
      return await client.publicFiles.getFileInfo(
        filePath,
        unref(publicLinkPassword),
        davProperties
      )
    }
    return client.files.fileInfo(filePath, davProperties)
  }

  const putFileContents = (
    filePath: string,
    content: string,
    putFileOptions: Record<string, any>
  ) => {
    if (unref(isPublicLinkContext)) {
      return client.publicFiles.putFileContents(
        '',
        filePath,
        unref(publicLinkPassword),
        content,
        putFileOptions
      )
    } else {
      return client.files.putFileContents(filePath, content, putFileOptions)
    }
  }

  return {
    makeRequest,
    getFileContents,
    getUrlForResource,
    getFileInfo,
    putFileContents
  }
}
