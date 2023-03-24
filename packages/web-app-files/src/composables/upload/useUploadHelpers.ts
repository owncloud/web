import { RouteLocation } from 'vue-router'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { useRoute } from 'web-pkg/src/composables'
import { ComputedRef, Ref, unref } from 'vue'
import * as uuid from 'uuid'
import path from 'path'
import { SpaceResource } from 'web-client/src/helpers'
import { urlJoin } from 'web-client/src/utils'
import { UppyService } from 'web-runtime/src/services/uppyService'
interface UploadHelpersOptions {
  space: ComputedRef<SpaceResource>
  currentFolder?: ComputedRef<string>
  currentFolderId?: ComputedRef<string | number>
  uppyService: UppyService
}

interface UploadHelpersResult {
  inputFilesToUppyFiles(inputFileOptions): UppyResource[]
}

interface inputFileOptions {
  uppyService: UppyService
  route: Ref<RouteLocation>
  space: Ref<SpaceResource>
  currentFolder: Ref<string>
  currentFolderId?: Ref<string | number>
}

export function useUploadHelpers(options: UploadHelpersOptions): UploadHelpersResult {
  return {
    inputFilesToUppyFiles: inputFilesToUppyFiles({
      uppyService: options.uppyService,
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
  uppyService,
  route,
  space,
  currentFolder,
  currentFolderId
}: inputFileOptions) => {
  return (files: File[]): UppyResource[] => {
    const uppyFiles: UppyResource[] = []

    const { name, params, query } = unref(route)
    const trimmedUploadPath = unref(space).getWebDavUrl({ path: unref(currentFolder) })
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
        isFolder: false,
        type: file.type,
        size: file.size,
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
          uppyId: uppyService.generateUploadId(file),
          relativeFolder: directory,
          relativePath: relativeFilePath, // uppy needs this property to be named relativePath
          tusEndpoint,
          uploadId: uuid.v4(),
          topLevelFolderId,
          // route data
          routeName: name as string,
          routeDriveAliasAndItem: (params as any)?.driveAliasAndItem || '',
          routeShareId: (query as any)?.shareId || ''
        }
      })
    }

    return uppyFiles
  }
}
