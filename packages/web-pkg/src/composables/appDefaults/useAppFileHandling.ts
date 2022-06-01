import { unref } from '@vue/composition-api'
import qs from 'qs'

import { Resource } from 'files/src/helpers/resource'
import { MaybeRef } from '../../utils'
import { ClientService } from '../../services'
import { DavProperties } from '../../constants'
interface AppFileHandlingOptions {
  clientService: ClientService
  isPublicLinkContext: MaybeRef<boolean>
  publicLinkPassword: MaybeRef<string>
}

type QueryParameters = Record<string, string>
export interface AppFileHandlingResult {
  getUrlForResource(r: Resource, query?: QueryParameters): string
  getFileInfo(filePath: string, davProperties: DavProperties): Promise<any>
  getFileContents(filePath: string, options: Record<string, any>): Promise<any>
  putFileContents(filePath: string, content: string, options: Record<string, any>): Promise<any>
}

export function useAppFileHandling({
  clientService: { owncloudSdk: client },
  isPublicLinkContext,
  publicLinkPassword
}: AppFileHandlingOptions): AppFileHandlingResult {
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

  const getFileContents = async (filePath: string, options: Record<string, any>) => {
    if (unref(isPublicLinkContext)) {
      const res = await client.publicFiles.download('', filePath, unref(publicLinkPassword), {
        noCache: true
      })
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
        noCache: true,
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
    getFileContents,
    getUrlForResource,
    getFileInfo,
    putFileContents
  }
}
