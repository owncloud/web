import { ClientService } from 'web-pkg/src/services'
import { useClientService } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import { buildSpace, buildWebDavSpacesPath } from 'web-client/src/helpers'
import { DavProperty, DavPropertyValue } from 'web-client/src/webdav/constants'

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

  const loadFileInfoByIdTask = useTask(function* (signal, fileId: string | number) {
    const space = buildSpace({
      id: fileId.toString(),
      name: '',
      webDavPath: buildWebDavSpacesPath(fileId)
    })
    return yield webdav.getFileInfo(
      space,
      {},
      {
        davProperties
      }
    )
  })

  return {
    loadFileInfoByIdTask
  }
}
