import { Store } from 'vuex'
import { unref } from '@vue/composition-api'
import qs from 'qs'

import { Resource } from '../../../../web-app-files/src/helpers/resource'
import { MaybeRef } from '../../utils'
import { ClientService, clientService as defaultClientService } from '../../services'
import { DavProperties } from '../../constants'

interface AppFileHandlingOptions {
  store: Store<any>
  clientService?: ClientService
  isPublicLinkContext: MaybeRef<boolean>
  publicLinkPassword: MaybeRef<string>
}

type QueryParameters = Record<string, string>
export interface AppFileHandlingResult {
  getUrlForResource(r: Resource, query?: QueryParameters): string

  getFileInfo(filePath: string, davProperties: DavProperties): Promise<any>
  getFileContents(filePath: string): Promise<any>
  putFileContents(filePath: string, content: string, options: Record<string, any>): Promise<any>
}

export function useAppFileHandling(options: AppFileHandlingOptions): AppFileHandlingResult {
  const client = (options.clientService || defaultClientService).owncloudSdk
  const store = options.store
  const isPublicLinkContext = options.isPublicLinkContext
  const publicLinkPassword = options.publicLinkPassword

  const getUrlForResource = ({ path, downloadURL }: Resource, query: QueryParameters = null) => {
    const queryStr = qs.stringify(query)
    if (unref(isPublicLinkContext)) {
      // If the resource does not contain the downloadURL we fallback to the normal
      // public files path.
      if (!downloadURL) {
        const urlPath = ['..', 'dav', 'public-files', path].join('/')
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

    const urlPath = ['..', 'dav', 'files', store.getters.user.id, path.replace(/^\//, '')].join('/')
    return [client.files.getFileUrl(urlPath), queryStr].filter(Boolean).join('?')
  }

  const getFileContents = async (filePath: string) => {
    if (unref(isPublicLinkContext)) {
      const res = await client.publicFiles.download('', filePath, unref(publicLinkPassword))
      res.statusCode = res.status
      return {
        response: res,
        body: await res.text(),
        headers: {
          ETag: res.headers.get('etag'),
          'OC-FileId': res.headers.get('oc-fileid')
        }
      }
    } else {
      return client.files.getFileContents(filePath, {
        resolveWithResponseObject: true
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
    getFileContents,
    getUrlForResource,
    getFileInfo,
    putFileContents
  }
}
