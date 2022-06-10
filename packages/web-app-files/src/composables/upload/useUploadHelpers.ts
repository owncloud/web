import { Route } from 'vue-router'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { buildResource, buildWebDavFilesPath, buildWebDavSpacesPath } from '../../helpers/resources'
import { User } from '../../helpers/user'
import { DavProperties } from 'web-pkg/src/constants'
import { ClientService } from 'web-pkg/src/services'
import { Store } from 'vuex'
import {
  useCapabilityShareJailEnabled,
  useClientService,
  useRoute,
  useStore
} from 'web-pkg/src/composables'
import { useActiveLocation } from '../router'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { computed, onMounted, ref, Ref, unref } from '@vue/composition-api'
import { SHARE_JAIL_ID } from '../../services/folder'
import * as uuid from 'uuid'

interface UploadHelpersResult {
  inputFilesToUppyFiles(inputFileOptions): UppyResource[]
  updateStoreForCreatedFolders(files: UppyResource[]): void
  currentPath: Ref<string>
  uploadPath: Ref<string>
  personalDriveId: Ref<string>
}

interface inputFileOptions {
  route: Ref<Route>
  uploadPath: Ref<string>
  currentPath: Ref<string>
  webDavBasePath: Ref<string>
}

export function useUploadHelpers(): UploadHelpersResult {
  const store = useStore()
  const route = useRoute()
  const getToken = computed((): string => store.getters.getToken)
  const server = computed((): string => store.getters.configuration.server)
  const hasShareJail = useCapabilityShareJailEnabled()
  const publicLinkPassword = computed((): string => store.getters['Files/publicLinkPassword'])
  const isPublicLocation = useActiveLocation(isLocationPublicActive, 'files-public-files')
  const isSpacesProjectLocation = useActiveLocation(isLocationSpacesActive, 'files-spaces-project')
  const isSpacesShareLocation = useActiveLocation(isLocationSpacesActive, 'files-spaces-share')
  const clientService = useClientService()
  const user = computed((): User => store.getters.user)
  const personalDriveId = ref('')

  onMounted(async () => {
    if (unref(hasShareJail) && !unref(isPublicLocation)) {
      personalDriveId.value = await getPersonalDriveId(
        clientService,
        unref(server),
        unref(getToken)
      )
    }
  })

  const currentPath = computed((): string => {
    const { params } = unref(route)
    const path = params.item || ''
    if (path.endsWith('/')) {
      return path
    }
    return path + '/'
  })

  const webDavBasePath = computed((): string => {
    const { params, query } = unref(route)

    if (unref(isPublicLocation)) {
      return unref(currentPath)
    }

    if (unref(isSpacesShareLocation)) {
      return buildWebDavSpacesPath([SHARE_JAIL_ID, query?.shareId].join('!'), unref(currentPath))
    }

    if (unref(isSpacesProjectLocation)) {
      return buildWebDavSpacesPath(params.storageId, unref(currentPath))
    }

    if (unref(hasShareJail)) {
      return buildWebDavSpacesPath(unref(personalDriveId), unref(currentPath))
    }

    return buildWebDavFilesPath(unref(user)?.id, unref(currentPath))
  })

  const uploadPath = computed((): string => {
    const { owncloudSdk: client } = clientService
    if (unref(isPublicLocation)) {
      return client.publicFiles.getFileUrl(unref(webDavBasePath))
    }

    return client.files.getFileUrl(unref(webDavBasePath))
  })

  return {
    inputFilesToUppyFiles: inputFilesToUppyFiles({
      route,
      uploadPath,
      currentPath,
      webDavBasePath
    }),
    updateStoreForCreatedFolders: updateStoreForCreatedFolders({
      clientService,
      store,
      isPublicLocation,
      publicLinkPassword
    }),
    currentPath,
    uploadPath,
    personalDriveId
  }
}

const getPersonalDriveId = async (clientService, server: string, getToken: string) => {
  const graphClient = clientService.graphAuthenticated(server, getToken)

  const drivesResponse = await graphClient.drives.listMyDrives('', 'driveType eq personal')
  if (!drivesResponse.data) {
    throw new Error('No personal space found')
  }
  return drivesResponse.data.value[0].id
}

const updateStoreForCreatedFolders = ({
  clientService,
  store,
  isPublicLocation,
  publicLinkPassword
}: {
  clientService: ClientService
  store: Store<any>
  isPublicLocation: Ref<boolean>
  publicLinkPassword: Ref<string>
}) => {
  return async (files: UppyResource[]) => {
    const { owncloudSdk: client } = clientService
    const fetchedFolders = []
    for (const file of files) {
      if (!file.meta.relativeFolder) {
        continue
      }

      const relativeFolder = `/${file.meta.relativeFolder.replace(/^\/+/, '')}`
      // Only care about the root folders, no need to fetch nested folders
      const rootFolder = relativeFolder.split('/').slice(0, 2).join('/')
      const rootFolderPath = `${file.meta.webDavBasePath}/${rootFolder}`

      if (fetchedFolders.includes(rootFolderPath)) {
        continue
      }

      let resource
      if (unref(isPublicLocation)) {
        resource = await client.publicFiles.getFileInfo(
          `${file.meta.currentFolder}${rootFolder}`,
          unref(publicLinkPassword),
          DavProperties.PublicLink
        )
      } else {
        resource = await client.files.fileInfo(rootFolderPath, DavProperties.Default)
      }

      resource = buildResource(resource)
      store.commit('Files/UPSERT_RESOURCE', resource)
      fetchedFolders.push(rootFolderPath)
    }
  }
}

const inputFilesToUppyFiles = ({
  route,
  uploadPath,
  currentPath,
  webDavBasePath
}: inputFileOptions) => {
  return (files: File[]): UppyResource[] => {
    const uppyFiles: UppyResource[] = []

    const { params } = unref(route)
    const currentFolder = unref(currentPath)
    const topLevelFolderIds = {}

    for (const file of files) {
      // Get the relative path of the file when the file was inside a directory on the client computer
      const relativeFilePath = file.webkitRelativePath || (file as any).relativePath || null
      // Directory without filename
      const directory = relativeFilePath
        ? relativeFilePath.substring(0, relativeFilePath.lastIndexOf('/'))
        : ''

      // Build tus endpoint to dynamically set it on file upload.
      // Looks something like: https://localhost:9200/remote.php/dav/files/admin
      let tusEndpoint
      if (directory) {
        tusEndpoint = `${unref(uploadPath).replace(/\/+$/, '')}/${directory.replace(/^\/+/, '')}`
      } else {
        tusEndpoint = unref(uploadPath)
      }

      // Build the route object for this file. This is used later by the upload-info-box
      const item = params.item ? `${params.item}/${directory}` : directory
      const fileRoute = {
        ...unref(route),
        params: { ...params, item }
      }

      let topLevelFolderId
      if (relativeFilePath) {
        const topLevelDirectory = relativeFilePath.replace(/^\/+/, '').split('/')[0]
        if (!topLevelFolderIds[topLevelDirectory]) {
          topLevelFolderIds[topLevelDirectory] = uuid.v4()
        }
        topLevelFolderId = topLevelFolderIds[topLevelDirectory]
      }

      uppyFiles.push({
        source: 'file input',
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          currentFolder,
          relativeFolder: directory,
          relativePath: relativeFilePath, // uppy needs this property to be named relativePath
          tusEndpoint,
          webDavBasePath: unref(webDavBasePath), // WebDAV base path where the files will be uploaded to
          uploadId: uuid.v4(),
          topLevelFolderId,
          routeName: fileRoute.name,
          routeItem: fileRoute.params?.item || '',
          routeShareName: (fileRoute.params as any)?.shareName || '',
          routeStorage: (fileRoute.params as any)?.storage || '',
          routeStorageId: (fileRoute.params as any)?.storageId || ''
        }
      })
    }

    return uppyFiles
  }
}
