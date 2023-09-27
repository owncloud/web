import Uppy, { UppyFile } from '@uppy/core'
import BasePlugin from '@uppy/core/lib/BasePlugin.js'
import filesize from 'filesize'
import { dirname, join } from 'path'
import * as uuid from 'uuid'
import { Language } from 'vue3-gettext'
import { Ref, unref } from 'vue'
import { Store } from 'vuex'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { Resource, SpaceResource } from 'web-client/src'
import { urlJoin } from 'web-client/src/utils'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { ResourceConflict } from './helpers/resource'
import { locationPublicLink } from 'web-pkg/src/router/public'
import { locationSpacesGeneric } from 'web-pkg/src/router/spaces'
import { isPersonalSpaceResource, isShareSpaceResource } from 'web-client/src/helpers'
import { ClientService } from 'web-pkg/types'

export interface HandleUploadOptions {
  clientService: ClientService
  hasSpaces: Ref<boolean>
  language: Language
  route: Ref<RouteLocationNormalizedLoaded>
  store: Store<any>
  uppyService: UppyService
  id?: string
  space?: SpaceResource
  quotaCheckEnabled?: boolean
  directoryTreeCreateEnabled?: boolean
  conflictHandlingEnabled?: boolean
}

/**
 * Plugin to handle the file upload with uppy. The process goes through the following steps:
 *
 * 1. convert input files to uppy resources
 * 2. check quota if spaces are enabled
 * 3. handle potential naming conflicts
 * 4. create directory tree if needed
 * 5. start upload
 */
export class HandleUpload extends BasePlugin {
  clientService: ClientService
  hasSpaces: Ref<boolean>
  language: Language
  route: Ref<RouteLocationNormalizedLoaded>
  space: SpaceResource
  store: Store<any>
  uppyService: UppyService
  quotaCheckEnabled: boolean
  directoryTreeCreateEnabled: boolean
  conflictHandlingEnabled: boolean

  constructor(uppy: Uppy, opts: HandleUploadOptions) {
    super(uppy, opts)
    ;(this as any).id = opts.id || 'HandleUpload'
    ;(this as any).type = 'modifier'
    this.clientService = opts.clientService
    this.hasSpaces = opts.hasSpaces
    this.language = opts.language
    this.route = opts.route
    this.space = opts.space
    this.store = opts.store
    this.uppyService = opts.uppyService

    this.quotaCheckEnabled = opts.quotaCheckEnabled ?? true
    this.directoryTreeCreateEnabled = opts.directoryTreeCreateEnabled ?? true
    this.conflictHandlingEnabled = opts.conflictHandlingEnabled ?? true

    this.handleUpload = this.handleUpload.bind(this)
  }

  get _uppy(): Uppy {
    return (this as any).uppy
  }

  get currentFolder(): Resource {
    return this.store.getters['Files/currentFolder']
  }

  get files(): Resource[] {
    return this.store.getters['Files/files']
  }

  get spaces(): SpaceResource[] {
    return this.store.getters['runtime/spaces/spaces']
  }

  removeFilesFromUpload(filesToUpload: UppyResource[]) {
    for (const file of filesToUpload) {
      this._uppy.removeFile(file.id)
    }
  }

  /**
   * Sets the endpoint url for a given file.
   */
  setEndpointUrl(fileId: string, endpoint: string) {
    if (this._uppy.getPlugin('Tus')) {
      this._uppy.setFileState(fileId, { tus: { endpoint } })
      return
    }
    this._uppy.setFileState(fileId, { xhrUpload: { endpoint } })
  }

  /**
   * Converts the input files type UppyResources and updates the uppy upload queue
   */
  prepareFiles(files: UppyFile[]): UppyResource[] {
    const filesToUpload = []

    if (!this.currentFolder && unref(this.route)?.params?.token) {
      // public file drop
      const publicLinkToken = unref(this.route).params.token
      let endpoint = this.clientService.owncloudSdk.publicFiles.getFileUrl(publicLinkToken) + '/'
      for (const file of files) {
        if (!this._uppy.getPlugin('Tus')) {
          endpoint = urlJoin(endpoint, encodeURIComponent(file.name))
        }
        this.setEndpointUrl(file.id, endpoint)
        this._uppy.setFileMeta(file.id, {
          tusEndpoint: endpoint,
          uploadId: uuid.v4()
        })

        filesToUpload.push(this._uppy.getFile(file.id))
      }
      return filesToUpload
    }
    const { id: currentFolderId, path: currentFolderPath } = this.currentFolder

    const { name, params, query } = unref(this.route)
    const topLevelFolderIds = {}

    for (const file of files) {
      const relativeFilePath = file.meta.relativePath as string
      // Directory without filename
      const directory =
        !relativeFilePath || dirname(relativeFilePath) === '.' ? '' : dirname(relativeFilePath)

      let topLevelFolderId
      if (relativeFilePath) {
        const topLevelDirectory = relativeFilePath.split('/').filter(Boolean)[0]
        if (!topLevelFolderIds[topLevelDirectory]) {
          topLevelFolderIds[topLevelDirectory] = uuid.v4()
        }
        topLevelFolderId = topLevelFolderIds[topLevelDirectory]
      }

      const webDavUrl = this.space.getWebDavUrl({
        path: currentFolderPath.split('/').map(encodeURIComponent).join('/')
      })

      let endpoint = urlJoin(webDavUrl, directory.split('/').map(encodeURIComponent).join('/'))
      if (!this._uppy.getPlugin('Tus')) {
        endpoint = urlJoin(endpoint, encodeURIComponent(file.name))
      }

      this.setEndpointUrl(file.id, endpoint)
      this._uppy.setFileMeta(file.id, {
        // file data
        name: file.name,
        mtime: (file.data as any).lastModified / 1000,
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
        tusEndpoint: endpoint,
        uploadId: uuid.v4(),
        topLevelFolderId,
        // route data
        routeName: name as string,
        routeDriveAliasAndItem: (params as any)?.driveAliasAndItem || '',
        routeShareId: (query as any)?.shareId || ''
      })

      filesToUpload.push(this._uppy.getFile(file.id))
    }

    return filesToUpload
  }

  checkQuotaExceeded(filesToUpload: UppyResource[]): boolean {
    let quotaExceeded = false

    const uploadSizeSpaceMapping = filesToUpload.reduce((acc, uppyResource) => {
      let targetUploadSpace

      if (uppyResource.meta.routeName === locationPublicLink.name) {
        return acc
      }

      if (uppyResource.meta.routeName === locationSpacesGeneric.name) {
        targetUploadSpace = this.spaces.find((space) => space.id === uppyResource.meta.spaceId)
      }

      if (
        !targetUploadSpace ||
        isShareSpaceResource(targetUploadSpace) ||
        (isPersonalSpaceResource(targetUploadSpace) &&
          targetUploadSpace.isOwner(this.store.getters.user))
      ) {
        return acc
      }

      const existingFile = this.files.find(
        (c) => !uppyResource.meta.relativeFolder && c.name === uppyResource.name
      )
      const existingFileSize = existingFile ? Number(existingFile.size) : 0

      const matchingMappingRecord = acc.find(
        (mappingRecord) => mappingRecord.space.id === targetUploadSpace.id
      )

      if (!matchingMappingRecord) {
        acc.push({
          space: targetUploadSpace,
          uploadSize: uppyResource.data.size - existingFileSize
        })
        return acc
      }

      matchingMappingRecord.uploadSize = uppyResource.data.size - existingFileSize

      return acc
    }, [])

    const { $gettext } = this.language
    uploadSizeSpaceMapping.forEach(({ space, uploadSize }) => {
      if (space.spaceQuota.remaining && space.spaceQuota.remaining < uploadSize) {
        let spaceName = space.name

        if (space.driveType === 'personal') {
          spaceName = $gettext('Personal')
        }

        this.store.dispatch('showErrorMessage', {
          title: $gettext('Not enough quota'),
          desc: $gettext(
            'There is not enough quota on %{spaceName}, you need additional %{missingSpace} to upload these files',
            {
              spaceName,
              missingSpace: filesize((space.spaceQuota.remaining - uploadSize) * -1)
            }
          )
        })

        quotaExceeded = true
      }
    })

    return quotaExceeded
  }

  /**
   * Creates the directory tree and removes files of failed directories from the upload queue.
   */
  async createDirectoryTree(filesToUpload: UppyResource[]): Promise<UppyResource[]> {
    const { webdav } = this.clientService
    const space = this.space
    const { id: currentFolderId, path: currentFolderPath } = this.currentFolder

    const createdFolders = []
    const failedFolders = []

    for (const file of filesToUpload) {
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
            currentFolder: currentFolderPath,
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

        this.uppyService.publish('addedForUpload', [uppyResource])

        try {
          const folder = await webdav.createFolder(space, {
            path: join(currentFolderPath, folderToCreate)
          })
          this.uppyService.publish('uploadSuccess', {
            ...uppyResource,
            meta: { ...uppyResource.meta, fileId: folder?.fileId }
          })

          createdSubFolders += `/${subFolder}`
          createdFolders.push(createdSubFolders)
        } catch (error) {
          if (error.statusCode !== 405) {
            console.error(error)
            failedFolders.push(folderToCreate)
            this.uppyService.publish('uploadError', { file: uppyResource, error })
          }
        }
      }
    }

    let filesToRemove = []
    if (failedFolders.length) {
      // remove file of folders that could not be created
      filesToRemove = filesToUpload
        .filter((f) => failedFolders.some((r) => f.meta.relativeFolder.startsWith(r)))
        .map(({ id }) => id)
      for (const fileId of filesToRemove) {
        this._uppy.removeFile(fileId)
      }
    }

    return filesToUpload.filter(({ id }) => !filesToRemove.includes(id))
  }

  /**
   * The handler that prepares all files to be uploaded and goes through all necessary steps.
   * Eventually triggers to upload in Uppy.
   */
  async handleUpload(files: UppyFile[]) {
    let filesToUpload = this.prepareFiles(files)

    // quota check
    if (this.quotaCheckEnabled && unref(this.hasSpaces)) {
      const quotaExceeded = this.checkQuotaExceeded(filesToUpload)
      if (quotaExceeded) {
        this.removeFilesFromUpload(filesToUpload)
        return this.uppyService.clearInputs()
      }
    }

    // name conflict handling
    if (this.conflictHandlingEnabled) {
      const confictHandler = new ResourceConflict(this.store, this.language)
      const conflicts = confictHandler.getConflicts(filesToUpload)
      if (conflicts.length) {
        const dashboard = document.getElementsByClassName('uppy-Dashboard')
        if (dashboard.length) {
          ;(dashboard[0] as HTMLElement).style.display = 'none'
        }

        const result = await confictHandler.displayOverwriteDialog(filesToUpload, conflicts)
        if (result.length === 0) {
          this.removeFilesFromUpload(filesToUpload)
          return this.uppyService.clearInputs()
        }

        for (const file of filesToUpload) {
          const conflictResult = result.find(({ id }) => id === file.id)
          if (!conflictResult) {
            this._uppy.removeFile(file.id)
            continue
          }
          this._uppy.setFileMeta(file.id, conflictResult.meta)
          this._uppy.setFileState(file.id, { name: conflictResult.name })
          this.setEndpointUrl(
            file.id,
            !!this._uppy.getPlugin('Tus')
              ? conflictResult.meta.tusEndpoint
              : conflictResult.xhrUpload.endpoint
          )
        }

        filesToUpload = result
      }
    }

    this.uppyService.publish('uploadStarted')
    if (this.directoryTreeCreateEnabled) {
      filesToUpload = await this.createDirectoryTree(filesToUpload)
    }

    if (!filesToUpload.length) {
      this.uppyService.publish('uploadCompleted', { successful: [] })
      return this.uppyService.clearInputs()
    }

    this.uppyService.publish('addedForUpload', filesToUpload)
    this.uppyService.uploadFiles()
  }

  install() {
    this._uppy.on('files-added', this.handleUpload)
  }

  uninstall() {
    this._uppy.off('files-added', this.handleUpload)
  }
}
