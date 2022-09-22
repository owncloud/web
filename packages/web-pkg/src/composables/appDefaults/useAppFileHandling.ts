import { unref } from '@vue/composition-api'

import { Resource } from 'web-client'
import { MaybeRef } from '../../utils'
import { ClientService } from '../../services'
import { DavProperties } from '../../constants'
import { buildResource } from 'files/src/helpers/resources'
import { FileContext } from './types'
import { FileResource } from 'web-client/src/helpers'

interface AppFileHandlingOptions {
  clientService: ClientService
  isPublicLinkContext: MaybeRef<boolean>
  publicLinkPassword: MaybeRef<string>
}

export interface AppFileHandlingResult {
  getFileInfo(filePath: string, davProperties: DavProperties): Promise<any>
  getFileResource(filePath: string, davProperties: DavProperties): Promise<Resource>
  getFileContents(
    fileContext: MaybeRef<FileContext>,
    options?: { responseType?: 'arrayBuffer' | 'blob' | 'text' } & Record<string, any>
  ): Promise<any>
  putFileContents(
    fileContext: MaybeRef<FileContext>,
    putFileOptions: { content?: string } & Record<string, any>
  ): Promise<FileResource>
}

export function useAppFileHandling({
  clientService: { owncloudSdk: client, webdav },
  isPublicLinkContext,
  publicLinkPassword
}: AppFileHandlingOptions): AppFileHandlingResult {

  // TODO: support query parameters, possibly needs porting away from owncloud-sdk
  const getFileContents = async (
    fileContext: MaybeRef<FileContext>,
    options: { responseType?: 'arrayBuffer' | 'blob' | 'text' } & Record<string, any>
  ) => {
    return webdav.getFileContents(
      unref(unref(fileContext).space),
      {
        path: unref(unref(fileContext).item)
      },
      {
        ...options
      }
    )
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
    fileContext: MaybeRef<FileContext>,
    options: { content?: string } & Record<string, any>
  ) => {
    return webdav.putFileContents(unref(unref(fileContext).space), {
      path: unref(unref(fileContext).item),
      ...options
    })
  }

  return {
    getUrlForResource,
    revokeUrl,
    getFileContents,
    getFileInfo,
    getFileResource,
    putFileContents
  }
}
