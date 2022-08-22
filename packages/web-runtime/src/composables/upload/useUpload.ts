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
import { computed, Ref, unref, watch } from '@vue/composition-api'
import { UppyService } from '../../services/uppyService'
import * as uuid from 'uuid'

export interface UppyResource {
  id?: string
  source: string
  name: string
  type: string
  data: Blob
  meta: {
    // must only contain primitive types because the properties can't be serialized otherwise!
    currentFolder: string
    relativeFolder: string
    relativePath: string
    tusEndpoint: string
    webDavBasePath: string
    uploadId: string
    topLevelFolderId?: string
    routeName?: string
    routeItem?: string
    routeShareName?: string
    routeShareId?: string
    routeStorage?: string
    routeStorageId?: string
    routeParamName?: string
  }
}

interface UploadOptions {
  uppyService: UppyService
}

interface UploadResult {
  createDirectoryTree(files: UppyResource[]): void
}

export function useUpload(options: UploadOptions): UploadResult {
  const store = useStore()
  const clientService = useClientService()
  const publicLinkPassword = usePublicLinkPassword({ store })
  const isPublicLinkContext = usePublicLinkContext({ store })
  const accessToken = useAccessToken({ store })

  const tusHttpMethodOverride = useCapabilityFilesTusSupportHttpMethodOverride()
  const tusMaxChunkSize = useCapabilityFilesTusSupportMaxChunkSize()
  const tusExtension = useCapabilityFilesTusExtension()

  const headers = computed((): { [key: string]: string } => {
    if (unref(isPublicLinkContext)) {
      const password = unref(publicLinkPassword)
      if (password) {
        return { Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64') }
      }

      return {}
    }
    return {
      Authorization: 'Bearer ' + unref(accessToken)
    }
  })

  const uppyOptions = computed(() => {
    const isTusSupported = unref(tusMaxChunkSize) > 0

    return {
      isTusSupported,
      onBeforeRequest: (req) => {
        req.setHeader('Authorization', unref(headers).Authorization)
      },
      headers: () => unref(headers),
      ...(isTusSupported && {
        tusMaxChunkSize: unref(tusMaxChunkSize),
        tusHttpMethodOverride: unref(tusHttpMethodOverride),
        tusExtension: unref(tusExtension)
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
      isPublicLinkContext,
      publicLinkPassword,
      uppyService: options.uppyService
    })
  }
}

const createDirectoryTree = ({
  clientService,
  isPublicLinkContext,
  publicLinkPassword,
  uppyService
}: {
  clientService: ClientService
  isPublicLinkContext: Ref<boolean>
  publicLinkPassword?: Ref<string>
  uppyService: UppyService
}) => {
  return async (files: UppyResource[]) => {
    const { owncloudSdk: client } = clientService
    const createdFolders = []
    for (const file of files) {
      const currentFolder = file.meta.currentFolder
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

        let uploadId
        if (!createdSubFolders) {
          uploadId = file.meta.topLevelFolderId
        } else {
          uploadId = uuid.v4()
        }

        const uppyResource = {
          id: uuid.v4(),
          name: subFolder,
          isFolder: true,
          type: 'folder',
          meta: {
            relativeFolder: createdSubFolders,
            currentFolder: file.meta.currentFolder,
            uploadId,
            routeName: file.meta.routeName,
            routeItem: file.meta.routeItem,
            routeShareName: file.meta.routeShareName,
            routeShareId: file.meta.routeShareId,
            routeStorage: file.meta.routeStorage,
            routeStorageId: file.meta.routeStorageId,
            routeParamName: file.meta.routeParamName
          }
        }

        uppyService.publish('addedForUpload', [uppyResource])

        if (unref(isPublicLinkContext)) {
          await client.publicFiles.createFolder(
            currentFolder,
            folderToCreate,
            unref(publicLinkPassword)
          )
        } else {
          try {
            await client.files.createFolder(`${file.meta.webDavBasePath}/${folderToCreate}`)
          }catch(ex) {

          }
        }

        uppyService.publish('uploadSuccess', uppyResource)

        createdSubFolders += `/${subFolder}`
        createdFolders.push(createdSubFolders)
      }
    }
  }
}
