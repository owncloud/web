import { ClientService } from 'web-pkg/src/services'
import {
  useAccessToken,
  useCapabilityFilesTusExtension,
  useCapabilityFilesTusSupportHttpMethodOverride,
  useCapabilityFilesTusSupportMaxChunkSize,
  useClientService,
  usePublicLinkContext,
  usePublicLinkPassword,
  useStore
} from 'web-pkg/src/composables'
import { computed, unref, watch } from 'vue'
import { UppyService } from '../../services/uppyService'
import * as uuid from 'uuid'
import { SpaceResource } from 'web-client/src/helpers'
import { join } from 'path'
import { v4 as uuidV4 } from 'uuid'
import { useGettext } from 'vue3-gettext'

export interface UppyResource {
  id?: string
  source: string
  name: string
  isFolder: boolean
  type: string
  size: number
  data: Blob
  meta: {
    // IMPORTANT: must only contain primitive types, complex types won't be serialized properly!
    // current space & folder
    spaceId: string | number
    spaceName: string
    driveAlias: string
    driveType: string
    currentFolder: string // current folder path during upload initiation
    currentFolderId?: string | number
    fileId?: string | number
    // upload data
    uppyId?: string
    relativeFolder: string
    relativePath: string
    tusEndpoint: string
    uploadId: string
    topLevelFolderId?: string
    // route data
    routeName?: string
    routeDriveAliasAndItem?: string
    routeShareId?: string
  }
}

export interface CreateDirectoryTreeResult {
  successful: string[]
  failed: string[]
}

interface UploadOptions {
  uppyService: UppyService
}

interface UploadResult {
  createDirectoryTree(
    space: SpaceResource,
    currentPath: string,
    files: UppyResource[],
    currentFolderId?: string | number
  ): Promise<CreateDirectoryTreeResult>
}

export function useUpload(options: UploadOptions): UploadResult {
  const store = useStore()
  const clientService = useClientService()
  const { current: currentLanguage } = useGettext()
  const publicLinkPassword = usePublicLinkPassword({ store })
  const isPublicLinkContext = usePublicLinkContext({ store })
  const accessToken = useAccessToken({ store })

  const tusHttpMethodOverride = useCapabilityFilesTusSupportHttpMethodOverride()
  const tusMaxChunkSize = useCapabilityFilesTusSupportMaxChunkSize()
  const tusExtension = useCapabilityFilesTusExtension()

  const headers = computed((): { [key: string]: string } => {
    const headers = { 'X-Request-ID': uuidV4(), 'Accept-Language': currentLanguage }
    if (unref(isPublicLinkContext)) {
      const password = unref(publicLinkPassword)
      if (password) {
        return {
          ...headers,
          Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64')
        }
      }

      return headers
    }
    return {
      ...headers,
      Authorization: 'Bearer ' + unref(accessToken)
    }
  })

  const uppyOptions = computed(() => {
    const isTusSupported = unref(tusMaxChunkSize) > 0

    return {
      isTusSupported,
      onBeforeRequest: (req) => {
        req.setHeader('Authorization', unref(headers).Authorization)
        req.setHeader('X-Request-ID', unref(headers)['X-Request-ID'])
        req.setHeader('Accept-Language', unref(headers)['Accept-Language'])
      },
      headers: (file) => ({
        'x-oc-mtime': file.data.lastModified / 1000,
        ...unref(headers)
      }),
      ...(isTusSupported && {
        tusMaxChunkSize: unref(tusMaxChunkSize),
        tusHttpMethodOverride: unref(tusHttpMethodOverride),
        tusExtension: unref(tusExtension)
      }),
      ...(!isTusSupported && {
        xhrTimeout: store.getters.configuration?.options?.upload?.xhr?.timeout || 60000
      })
    }
  })

  watch(
    uppyOptions,
    () => {
      if (unref(uppyOptions).isTusSupported) {
        options.uppyService.useTus(unref(uppyOptions) as any)
        return
      }
      options.uppyService.useXhr(unref(uppyOptions) as any)
    },
    { immediate: true }
  )

  return {
    createDirectoryTree: createDirectoryTree({
      clientService,
      uppyService: options.uppyService
    })
  }
}

const createDirectoryTree = ({
  clientService,
  uppyService
}: {
  clientService: ClientService
  uppyService: UppyService
}) => {
  return async (
    space: SpaceResource,
    currentFolder: string,
    files: UppyResource[],
    currentFolderId?: string | number
  ): Promise<CreateDirectoryTreeResult> => {
    const { webdav } = clientService
    const createdFolders = []
    const failedFolders = []
    for (const file of files) {
      const directory = file.meta.relativeFolder

      if (!directory || createdFolders.includes(directory)) {
        continue
      }

      const folders = directory.split('/')
      let createdSubFolders = ''
      for (const subFolder of folders) {
        if (!subFolder) {
          continue
        }

        const folderToCreate = `${createdSubFolders}/${subFolder}`
        if (createdFolders.includes(folderToCreate)) {
          createdSubFolders += `/${subFolder}`
          createdFolders.push(createdSubFolders)
          continue
        }

        if (failedFolders.includes(folderToCreate)) {
          // only care about top level folders, no need to go deeper
          break
        }

        const uploadId = createdSubFolders ? uuid.v4() : file.meta.topLevelFolderId
        const uppyResource = {
          id: uuid.v4(),
          name: subFolder,
          isFolder: true,
          type: 'folder',
          meta: {
            // current space & folder
            spaceId: space.id,
            spaceName: space.name,
            driveAlias: space.driveAlias,
            driveType: space.driveType,
            currentFolder,
            currentFolderId,
            // upload data
            relativeFolder: createdSubFolders,
            uploadId,
            // route data
            routeName: file.meta.routeName,
            routeDriveAliasAndItem: file.meta.routeDriveAliasAndItem,
            routeShareId: file.meta.routeShareId
          }
        }

        uppyService.publish('addedForUpload', [uppyResource])

        try {
          const folder = await webdav.createFolder(space, {
            path: join(currentFolder, folderToCreate)
          })
          uppyService.publish('uploadSuccess', {
            ...uppyResource,
            meta: { ...uppyResource.meta, fileId: folder?.fileId }
          })

          createdSubFolders += `/${subFolder}`
          createdFolders.push(createdSubFolders)
        } catch (error) {
          console.error(error)
          failedFolders.push(folderToCreate)
          uppyService.publish('uploadError', { file: uppyResource, error })
        }
      }
    }

    return {
      successful: createdFolders,
      failed: failedFolders
    }
  }
}
