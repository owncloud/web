import { unref } from '@vue/composition-api'

import { Resource } from 'web-client'
import { MaybeRef } from '../../utils'
import { ClientService } from '../../services'
import { FileContext } from './types'
import { FileResource, SpaceResource } from 'web-client/src/helpers'
import { useCapabilityCoreSupportUrlSigning } from '../capability'
import { useClientService } from '../clientService'
import { ListFilesOptions } from 'web-client/src/webdav/listFiles'

interface AppFileHandlingOptions {
  clientService: ClientService
}

export interface AppFileHandlingResult {
  getUrlForResource(space: SpaceResource, resource: Resource): Promise<string>
  revokeUrl(url: string): void
  getFileInfo(fileContext: MaybeRef<FileContext>, options?: ListFilesOptions): Promise<Resource>
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
  clientService: { webdav }
}: AppFileHandlingOptions): AppFileHandlingResult {
  const isUrlSigningSupported = useCapabilityCoreSupportUrlSigning()
  const {
    webdav: { getFileUrl, revokeUrl }
  } = useClientService()

  const getUrlForResource = (space: SpaceResource, resource: Resource, options?: any) => {
    return getFileUrl(space, resource, {
      isUrlSigningEnabled: unref(isUrlSigningSupported),
      ...options
    })
  }

  // TODO: support query parameters, possibly needs porting away from owncloud-sdk
  const getFileContents = (
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

  const getFileInfo = async (
    fileContext: MaybeRef<FileContext>,
    options: ListFilesOptions = {}
  ): Promise<Resource> => {
    return webdav.getFileInfo(
      unref(unref(fileContext).space),
      {
        path: unref(unref(fileContext).item),
        fileId: unref(unref(fileContext).itemId)
      },
      options
    )
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
    putFileContents
  }
}
