import { Route } from 'vue-router'
import { ClientService } from 'web-pkg/src/services'
import {
  useCapabilityFilesTusSupportHttpMethodOverride,
  useCapabilityFilesTusSupportMaxChunkSize,
  useClientService,
  useStore
} from 'web-pkg/src/composables'
import { computed, Ref, unref, watch } from '@vue/composition-api'
import { useActiveLocation } from 'files/src/composables'
import { isLocationPublicActive } from 'files/src/router'
import { UppyService } from '../../services/uppyService'

export interface UppyResource {
  id?: string
  source: string
  name: string
  type: string
  data: Blob
  meta: {
    currentFolder: string
    relativeFolder: string
    relativePath: string
    route: Route
    tusEndpoint: string
    webDavPath: string
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
  const publicLinkPassword = computed((): string => store.getters['Files/publicLinkPassword'])
  const isPublicLocation = useActiveLocation(isLocationPublicActive, 'files-public-files')
  const clientService = useClientService()
  const getToken = computed((): string => store.getters.getToken)

  const tusHttpMethodOverride = useCapabilityFilesTusSupportHttpMethodOverride()
  const tusMaxChunkSize = useCapabilityFilesTusSupportMaxChunkSize()
  const uploadChunkSize = computed((): number => store.getters.configuration.uploadChunkSize)

  const headers = computed((): { [key: string]: string } => {
    if (unref(isPublicLocation)) {
      const password = unref(publicLinkPassword)

      if (password) {
        return { Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64') }
      }

      return {}
    }
    return {
      Authorization: 'Bearer ' + unref(getToken)
    }
  })

  const uppyOptions = computed(() => {
    const isTusSupported = unref(tusMaxChunkSize) > 0

    if (isTusSupported) {
      return {
        isTusSupported,
        tusMaxChunkSize: unref(tusMaxChunkSize),
        uploadChunkSize: unref(uploadChunkSize),
        tusHttpMethodOverride: unref(tusHttpMethodOverride),
        headers: unref(headers)
      }
    }

    return { isTusSupported, headers: unref(headers) }
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
      isPublicLocation,
      publicLinkPassword
    })
  }
}

const createDirectoryTree = ({
  clientService,
  isPublicLocation,
  publicLinkPassword
}: {
  clientService: ClientService
  isPublicLocation: Ref<boolean>
  publicLinkPassword?: Ref<string>
}) => {
  return async (files: UppyResource[]) => {
    const { owncloudSdk: client } = clientService
    const createdFolders = []
    for (const file of files) {
      const currentFolder = file.meta.currentFolder
      const directory = file.meta.relativeFolder

      // @TODO check common prefixes
      if (!directory || createdFolders.includes(directory)) {
        continue
      }

      if (unref(isPublicLocation)) {
        await client.publicFiles.createFolder(currentFolder, directory, unref(publicLinkPassword))
      } else {
        await client.files.createFolder(file.meta.webDavPath)
      }

      createdFolders.push(directory)
    }
  }
}
