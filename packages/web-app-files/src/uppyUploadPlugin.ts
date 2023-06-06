import Uppy from '@uppy/core'
import BasePlugin from '@uppy/core/lib/BasePlugin.js'
import { dirname } from 'path'
import * as uuid from 'uuid'
import { Ref, unref } from 'vue'
import { Store } from 'vuex'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Resource, SpaceResource } from 'web-client/src'
import { urlJoin } from 'web-client/src/utils'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { UppyService } from 'web-runtime/src/services/uppyService'

/**
 * Prepares all input files and adds necessary data for the upload. This is only used for
 * the cloud import at the moment.
 *
 * It basically does the same as the inputFilesToUppyFiles method from the upload helpers.
 * TODO: Remove the upload helpers and use this plugin for upload handling in general.
 */
export class HandleUpload extends BasePlugin {
  route: Ref<RouteLocationNormalizedLoaded>
  store: Store<any>
  uppyService: UppyService

  constructor(uppy, opts) {
    super(uppy, opts)
    ;(this as any).id = opts.id || 'HandleUpload'
    ;(this as any).type = 'modifier'
    this.route = opts.route
    this.store = opts.store
    this.uppyService = opts.uppyService

    this.prepareUpload = this.prepareUpload.bind(this)
  }

  get _uppy(): Uppy {
    return (this as any).uppy
  }

  get currentFolder(): Resource {
    return this.store.getters['Files/currentFolder']
  }

  get space(): SpaceResource {
    return this.store.getters['runtime/spaces/spaces'].find(
      ({ id }) => id === this.currentFolder.storageId
    )
  }

  /**
   * Get the relative path of the file when the file was inside a directory on the client computer.
   * @param file
   */
  getRelativeFilePath = (file): string | undefined => {
    const relativePath = file.webkitRelativePath || (file as any).relativePath
    if (!relativePath) {
      return undefined
    }

    return urlJoin(relativePath)
  }

  prepareUpload(fileIDs: string[]) {
    if (this._uppy.getFile(fileIDs[0])?.meta.tusEndpoint) {
      // files have been processed already. can probably be removed once inputFilesToUppyFiles has been removed
      return Promise.resolve()
    }

    const { id: currentFolderId, path: currentFolderPath } = this.currentFolder
    this.uppyService.publish('uploadStarted')

    const preparedFiles: UppyResource[] = []
    const { name, params, query } = unref(this.route)
    const trimmedUploadPath = this.space.getWebDavUrl({
      path: currentFolderPath
    })
    const topLevelFolderIds = {}

    for (const fileID of fileIDs) {
      const file = this._uppy.getFile(fileID)
      const relativeFilePath = this.getRelativeFilePath(file)
      // Directory without filename
      const directory =
        !relativeFilePath || dirname(relativeFilePath) === '.' ? '' : dirname(relativeFilePath)

      const tusEndpoint = urlJoin(trimmedUploadPath, directory)

      let topLevelFolderId
      if (relativeFilePath) {
        const topLevelDirectory = relativeFilePath.split('/').filter(Boolean)[0]
        if (!topLevelFolderIds[topLevelDirectory]) {
          topLevelFolderIds[topLevelDirectory] = uuid.v4()
        }
        topLevelFolderId = topLevelFolderIds[topLevelDirectory]
      }

      this._uppy.setFileState(file.id, {
        tus: { endpoint: tusEndpoint }
      })

      this._uppy.setFileMeta(file.id, {
        // current path & space
        spaceId: this.space.id,
        spaceName: this.space.name,
        driveAlias: this.space.driveAlias,
        driveType: this.space.driveType,
        currentFolder: currentFolderPath,
        currentFolderId,
        // upload data
        uppyId: this.uppyService.generateUploadId(file as any),
        relativeFolder: directory,
        relativePath: relativeFilePath, // uppy needs this property to be named relativePath
        tusEndpoint,
        uploadId: uuid.v4(),
        topLevelFolderId,
        // route data
        routeName: name as string,
        routeDriveAliasAndItem: (params as any)?.driveAliasAndItem || '',
        routeShareId: (query as any)?.shareId || ''
      })

      preparedFiles.push(this._uppy.getFile(fileID) as unknown as UppyResource)
    }
    this.uppyService.publish('addedForUpload', preparedFiles)

    return Promise.resolve()
  }

  install() {
    this._uppy.addPreProcessor(this.prepareUpload)
  }

  uninstall() {
    this._uppy.removePreProcessor(this.prepareUpload)
  }
}
