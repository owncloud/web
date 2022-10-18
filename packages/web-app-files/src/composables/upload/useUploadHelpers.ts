import { Route } from 'vue-router'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { useRoute } from 'web-pkg/src/composables'
import { ComputedRef, Ref, unref } from '@vue/composition-api'
import * as uuid from 'uuid'
import path from 'path'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'

interface UploadHelpersOptions {
  space: ComputedRef<SpaceResource>
  currentFolder?: ComputedRef<string>
  currentFolderId?: ComputedRef<string | number>
}

interface UploadHelpersResult {
  inputFilesToUppyFiles(inputFileOptions): UppyResource[]
}

interface inputFileOptions {
  route: Ref<Route>
  space: Ref<SpaceResource>
  currentFolder: Ref<string>
  currentFolderId?: Ref<string | number>
}

export function useUploadHelpers(options: UploadHelpersOptions): UploadHelpersResult {
  return {
    inputFilesToUppyFiles: inputFilesToUppyFiles({
      route: useRoute(),
      space: options.space,
      currentFolder: options.currentFolder,
      currentFolderId: options.currentFolderId
    })
  }
}

/**
 * Get the relative path of the file when the file was inside a directory on the client computer.
 * @param file
 */
const getRelativeFilePath = (file: File): string | undefined => {
  const relativePath = file.webkitRelativePath || (file as any).relativePath
  if (!relativePath) {
    return undefined
  }

  return urlJoin(relativePath)
}

const inputFilesToUppyFiles = ({
  route,
  space,
  currentFolder,
  currentFolderId
}: inputFileOptions) => {
  return (files: File[]): UppyResource[] => {
    const uppyFiles: UppyResource[] = []

    const { name, params, query } = unref(route)
    const trimmedUploadPath = unref(space).getWebDavUrl({ path: unref(currentFolder) } as Resource)
    const topLevelFolderIds = {}

    for (const file of files) {
      const relativeFilePath = getRelativeFilePath(file)
      // Directory without filename
      const directory =
        !relativeFilePath || path.dirname(relativeFilePath) === '.'
          ? ''
          : path.dirname(relativeFilePath)

      // Build tus endpoint to dynamically set it on file upload.
      // Looks something like: https://localhost:9200/remote.php/dav/files/admin
      const tusEndpoint = urlJoin(trimmedUploadPath, directory)

      let topLevelFolderId
      if (relativeFilePath) {
        const topLevelDirectory = relativeFilePath.split('/').filter(Boolean)[0]
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
          // current path & space
          spaceId: unref(space).id,
          spaceName: unref(space).name,
          driveAlias: unref(space).driveAlias,
          driveType: unref(space).driveType,
          currentFolder: unref(currentFolder),
          currentFolderId: unref(currentFolderId),
          // upload data
          relativeFolder: directory,
          relativePath: relativeFilePath, // uppy needs this property to be named relativePath
          tusEndpoint,
          uploadId: uuid.v4(),
          topLevelFolderId,
          // route data
          routeName: name,
          routeDriveAliasAndItem: (params as any)?.driveAliasAndItem || '',
          routeShareId: (query as any)?.shareId || ''
        }
      })
    }

    return uppyFiles
  }
}
