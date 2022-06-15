import { Route } from 'vue-router'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { buildWebDavFilesPath, buildWebDavSpacesPath } from '../../helpers/resources'
import { User } from '../../helpers/user'
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
import path from 'path'

interface UploadHelpersResult {
  inputFilesToUppyFiles(inputFileOptions): UppyResource[]
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

const inputFilesToUppyFiles = ({
  route,
  uploadPath,
  currentPath,
  webDavBasePath
}: inputFileOptions) => {
  return (files: File[]): UppyResource[] => {
    const uppyFiles: UppyResource[] = []

    const { name, params, query } = unref(route)
    const currentFolder = unref(currentPath)
    const trimmedUploadPath = unref(uploadPath).replace(/\/+$/, '')
    const topLevelFolderIds = {}

    for (const file of files) {
      // Get the relative path of the file when the file was inside a directory on the client computer
      const relativeFilePath = file.webkitRelativePath || (file as any).relativePath || null
      // Directory without filename
      const directory = path.dirname(relativeFilePath) === '.' ? '' : path.dirname(relativeFilePath)

      // Build tus endpoint to dynamically set it on file upload.
      // Looks something like: https://localhost:9200/remote.php/dav/files/admin
      const tusEndpoint = directory
        ? `${trimmedUploadPath}/${directory.replace(/^\/+/, '')}`
        : unref(uploadPath)

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
          routeName: name,
          routeItem: params.item ? `${params.item}/${directory}` : directory,
          routeShareName: (params as any)?.shareName || '',
          routeShareId: (query as any)?.shareId || '',
          routeStorage: (params as any)?.storage || '',
          routeStorageId: (params as any)?.storageId || ''
        }
      })
    }

    return uppyFiles
  }
}
