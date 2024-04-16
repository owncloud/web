import { unref } from 'vue'

import { Resource } from '@ownclouders/web-client'
import { MaybeRef } from '../../utils'
import { ClientService } from '../../services'
import { FileContext } from './types'
import { FileResource, SpaceResource } from '@ownclouders/web-client'
import { useClientService } from '../clientService'
import { ListFilesOptions } from '@ownclouders/web-client/webdav'
import { WebDAV } from '@ownclouders/web-client/webdav'
import { useCapabilityStore, useUserStore } from '../piniaStores'

interface AppFileHandlingOptions {
  clientService: ClientService
}

export type FileContentOptions = { responseType?: 'arraybuffer' | 'blob' | 'text' } & Record<
  string,
  any
>
export type UrlForResourceOptions = Omit<Parameters<WebDAV['getFileUrl']>[2], 'isUrlSigningEnabled'>

export interface AppFileHandlingResult {
  getUrlForResource(
    space: SpaceResource,
    resource: Resource,
    options?: UrlForResourceOptions
  ): Promise<string>
  revokeUrl(url: string): void
  getFileInfo(fileContext: MaybeRef<FileContext>, options?: ListFilesOptions): Promise<Resource>
  getFileContents(fileContext: MaybeRef<FileContext>, options?: FileContentOptions): Promise<any>
  putFileContents(
    fileContext: MaybeRef<FileContext>,
    putFileOptions: { content?: string } & Record<string, any>
  ): Promise<FileResource>
}

export function useAppFileHandling({
  clientService: { webdav }
}: AppFileHandlingOptions): AppFileHandlingResult {
  const clientService = useClientService()
  const capabilityStore = useCapabilityStore()
  const userStore = useUserStore()

  const getUrlForResource = (space: SpaceResource, resource: Resource, options?: any) => {
    return clientService.webdav.getFileUrl(space, resource, {
      isUrlSigningEnabled: capabilityStore.supportUrlSigning,
      username: userStore.user?.onPremisesSamAccountName,
      ...options
    })
  }

  const revokeUrl = (url: string) => {
    return clientService.webdav.revokeUrl(url)
  }

  // TODO: support query parameters
  const getFileContents = (
    fileContext: MaybeRef<FileContext>,
    options: { responseType?: 'arraybuffer' | 'blob' | 'text' } & Record<string, any>
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

  const getFileInfo = (
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
