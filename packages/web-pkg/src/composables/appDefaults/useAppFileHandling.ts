import { unref } from '@vue/composition-api'

import { Resource } from 'web-client'
import { MaybeRef } from '../../utils'
import { ClientService } from '../../services'
import { DavProperties } from '../../constants'
import { buildResource } from 'files/src/helpers/resources'
import { useCapabilityCoreSupportUrlSigning } from '../capability'

interface AppFileHandlingOptions {
  clientService: ClientService
  isPublicLinkContext: MaybeRef<boolean>
  publicLinkPassword: MaybeRef<string>
}

export interface AppFileHandlingResult {
  getUrlForResource(r: Resource): Promise<string>
  revokeUrl(url: string): void
  getFileInfo(filePath: string, davProperties: DavProperties): Promise<any>
  getFileResource(filePath: string, davProperties: DavProperties): Promise<Resource>
  getFileContents(filePath: string, options: Record<string, any>): Promise<any>
  putFileContents(filePath: string, content: string, options: Record<string, any>): Promise<any>
}

export function useAppFileHandling({
  clientService: { owncloudSdk: client },
  isPublicLinkContext,
  publicLinkPassword
}: AppFileHandlingOptions): AppFileHandlingResult {
  const isUrlSigningSupported = useCapabilityCoreSupportUrlSigning()

  const getUrlForResource = async (
    { webDavPath, downloadURL }: Resource,
    options: { disposition?: 'inline' | 'attachment'; signUrlTimeout?: number } = {}
  ) => {
    const signUrlTimeout = options.signUrlTimeout || 86400
    const inlineDisposition = (options.disposition || 'attachment') === 'inline'

    let signed = true
    if (!downloadURL && !inlineDisposition) {
      // TODO: check whether we can fix the resource to always contain public-files in the webDavPath
      let urlPath
      if (unref(isPublicLinkContext)) {
        urlPath = ['public-files', webDavPath].join('/')
      } else {
        urlPath = webDavPath
      }

      // compute unsigned url
      downloadURL = client.files.getFileUrl(urlPath)

      // sign url
      if (unref(isUrlSigningSupported)) {
        downloadURL = await client.signUrl(downloadURL, signUrlTimeout)
      } else {
        signed = false
      }
    }

    // FIXME: re-introduce query parameters
    // They are not supported by getFileContents() and as we don't need them right now, I'm disabling the feature completely for now
    //
    // // Since the pre-signed url contains query parameters and the caller of this method
    // // can also provide query parameters we have to combine them.
    // const queryStr = qs.stringify(options.query || null)
    // const [url, signedQuery] = downloadURL.split('?')
    // const combinedQuery = [queryStr, signedQuery].filter(Boolean).join('&')
    // downloadURL = [url, combinedQuery].filter(Boolean).join('?')

    if (!signed || inlineDisposition) {
      const response = await getFileContents(webDavPath, {
        responseType: 'blob'
      })
      downloadURL = URL.createObjectURL(response.body)
    }

    return downloadURL
  }

  const revokeUrl = (url: string) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  // TODO: support query parameters, possibly needs porting away from owncloud-sdk
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

  const getFileResource = async (
    filePath: string,
    davProperties: DavProperties = DavProperties.Default
  ): Promise<Resource> => {
    const fileInfo = await getFileInfo(filePath, davProperties)
    return buildResource(fileInfo)
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
    revokeUrl,
    getFileInfo,
    getFileResource,
    putFileContents
  }
}
