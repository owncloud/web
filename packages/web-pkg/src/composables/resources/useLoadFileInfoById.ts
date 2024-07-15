import { useTask } from 'vue-concurrency'
import { ClientService } from '../../services/client'
import { useClientService } from '../clientService'
import { buildSpace } from '@ownclouders/web-client'
import { DavProperty, DavPropertyValue } from '@ownclouders/web-client/webdav'

export interface LoadFileInfoByIdOptions {
  clientService?: ClientService
  davProperties?: DavPropertyValue[]
}

export const useLoadFileInfoById = (options: LoadFileInfoByIdOptions) => {
  const { webdav } = options.clientService || useClientService()
  const davProperties = options.davProperties || [
    DavProperty.FileId,
    DavProperty.FileParent,
    DavProperty.Name,
    DavProperty.ResourceType
  ]

  const loadFileInfoByIdTask = useTask(function* (signal, fileId: string) {
    const space = buildSpace({ id: fileId, name: '' })
    return yield webdav.getFileInfo(space, { fileId }, { davProperties, signal })
  })

  return {
    loadFileInfoByIdTask
  }
}
