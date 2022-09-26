import { Route } from 'vue-router'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { buildWebDavFilesPath } from '../../helpers/resources'
import { Resource, User } from 'web-client'
import {
  useCapabilityShareJailEnabled,
  useClientService,
  useRoute,
  useStore
} from 'web-pkg/src/composables'
import { useActiveLocation } from '../router'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { computed, ComputedRef, Ref, unref } from '@vue/composition-api'
import * as uuid from 'uuid'
import path from 'path'
import { buildWebDavSpacesPath } from 'web-client/src/helpers'

interface UploadHelpersOptions {
  space?: ComputedRef<Resource>
  currentPath?: ComputedRef<string>
}

interface UploadHelpersResult {
  inputFilesToUppyFiles(inputFileOptions): UppyResource[]
  currentPath: Ref<string>
  uploadPath: Ref<string>
}

interface inputFileOptions {
  route: Ref<Route>
  uploadPath: Ref<string>
  currentPath: Ref<string>
  webDavBasePath: Ref<string>
}

export function useUploadHelpers(options: UploadHelpersOptions = {}): UploadHelpersResult {
  const store = useStore()
  const route = useRoute()
  const hasShareJail = useCapabilityShareJailEnabled()
  const isPublicLocation = useActiveLocation(isLocationPublicActive, 'files-public-link')
  const isSpacesGenericLocation = useActiveLocation(isLocationSpacesActive, 'files-spaces-generic')
  const clientService = useClientService()
  const user = computed((): User => store.getters.user)

  const currentPath = computed((): string => {
    let path
    if (unref(isSpacesGenericLocation)) {
      path = unref(options.currentPath)
    } else {
      const { params } = unref(route)
      path = params.item || ''
    }
    return (path || '').replace(/\/+$/, '') + '/'
  })

  const webDavBasePath = computed((): string => {
    if (unref(isPublicLocation)) {
      return unref(currentPath)
    }

    if (unref(isSpacesGenericLocation)) {
      if (!unref(hasShareJail)) {
        return buildWebDavFilesPath(unref(user)?.id, unref(currentPath))
      }

      return buildWebDavSpacesPath(unref(options.space)?.id, unref(currentPath))
    }
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
    uploadPath
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

    const { name, params, query } = unref(route)
    const currentFolder = unref(currentPath)
    const trimmedUploadPath = unref(uploadPath).replace(/\/+$/, '')
    const topLevelFolderIds = {}

    for (const file of files) {
      // Get the relative path of the file when the file was inside a directory on the client computer
      const relativeFilePath = file.webkitRelativePath || (file as any).relativePath || null
      // Directory without filename
      const directory =
        !relativeFilePath || path.dirname(relativeFilePath) === '.'
          ? ''
          : path.dirname(relativeFilePath)

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
          routeShareName: (params as any)?.shareName || '', // TODO: delete?
          routeShareId: (query as any)?.shareId || '',
          routeStorage: (params as any)?.storage || '', // TODO: delete?
          routeStorageId: (params as any)?.storageId || '', // TODO: delete?
          routeParamName: (params as any)?.name || '', // TODO: delete?
          routeDriveAliasAndItem: (params as any)?.driveAliasAndItem || ''
        }
      })
    }

    return uppyFiles
  }
}
