import { Route } from 'vue-router'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { buildResource, buildWebDavFilesPath, buildWebDavSpacesPath } from '../../helpers/resources'
import { User } from '../../helpers/user'
import { DavProperties } from 'web-pkg/src/constants'
import { ClientService } from 'web-pkg/src/services'
import { Store } from 'vuex'
import { useClientService, useRoute, useStore } from 'web-pkg/src/composables'
import { useActiveLocation } from '../router'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { computed, Ref, unref } from '@vue/composition-api'

interface UploadHelpersResult {
  inputFilesToUppyFiles(inputFileOptions): UppyResource[]
  updateStoreForCreatedFolders(files: UppyResource[]): void
  currentPath: Ref<string>
  uploadPath: Ref<string>
}

interface inputFileOptions {
  route: Ref<Route>
  uploadPath: Ref<string>
  currentPath: Ref<string>
  user: Ref<User>
}

export function useUploadHelpers(): UploadHelpersResult {
  const store = useStore()
  const route = useRoute()
  const publicLinkPassword = computed((): string => store.getters['Files/publicLinkPassword'])
  const isPublicLocation = useActiveLocation(isLocationPublicActive, 'files-public-files')
  const isSpacesProjectLocation = useActiveLocation(isLocationSpacesActive, 'files-spaces-project')
  const clientService = useClientService()
  const user = computed((): User => store.getters.user)

  const currentPath = computed((): string => {
    const { params } = unref(route)
    const path = params.item || ''
    if (path.endsWith('/')) {
      return path
    }
    return path + '/'
  })

  const uploadPath = computed((): string => {
    const { params } = unref(route)
    const { owncloudSdk: client } = clientService

    if (unref(isPublicLocation)) {
      return client.publicFiles.getFileUrl(unref(currentPath))
    }

    if (unref(isSpacesProjectLocation)) {
      const path = buildWebDavSpacesPath(params.storageId, unref(currentPath))
      return client.files.getFileUrl(path)
    }

    return client.files.getFileUrl(buildWebDavFilesPath(unref(user).id, unref(currentPath)))
  })

  return {
    inputFilesToUppyFiles: inputFilesToUppyFiles({ route, uploadPath, currentPath, user }),
    updateStoreForCreatedFolders: updateStoreForCreatedFolders({
      clientService,
      store,
      isPublicLocation,
      publicLinkPassword
    }),
    currentPath,
    uploadPath
  }
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

const inputFilesToUppyFiles = ({ route, uploadPath, currentPath, user }: inputFileOptions) => {
  return (files: File[]): UppyResource[] => {
    const uppyFiles: UppyResource[] = []

    const { params } = unref(route)
    const currentFolder = unref(currentPath)

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

      const storageId = params.storageId
      const webDavBasePath = storageId
        ? buildWebDavSpacesPath(storageId, currentFolder)
        : buildWebDavFilesPath(unref(user)?.id, currentFolder)

      uppyFiles.push({
        source: 'file input',
        name: file.name,
        type: file.type,
        data: file,
        meta: {
          currentFolder,
          relativeFolder: directory,
          relativePath: relativeFilePath, // uppy needs this property to be named relativePath
          route: fileRoute,
          tusEndpoint,
          webDavBasePath // WebDAV base path where the files will be uploaded to
        }
      })
    }

    return uppyFiles
  }
}
