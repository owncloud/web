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
import { locationPublicLink } from '@ownclouders/web-pkg/src/router/public'
import { locationSpacesGeneric } from '@ownclouders/web-pkg/src/router/spaces'
import { isPersonalSpaceResource, isShareSpaceResource } from 'web-client/src/helpers'
import { ClientService } from 'web-pkg/types'
import { queryItemAsString } from 'web-pkg/src/composables'

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
  id: string
  type: string
  uppy: Uppy

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
    this.id = opts.id || 'HandleUpload'
    this.type = 'modifier'
    this.uppy = uppy

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
      this.uppy.removeFile(file.id)
    }
  }

  getUploadPluginName() {
    return this.uppy.getPlugin('Tus') ? 'tus' : 'xhrUpload'
  }

  /**
   * Converts the input files type UppyResources and updates the uppy upload queue
   */
  prepareFiles(files: UppyFile[]): UppyResource[] {
    const filesToUpload: Record<string, UppyResource> = {}

    if (!this.currentFolder && unref(this.route)?.params?.token) {
      // public file drop
      const publicLinkToken = queryItemAsString(unref(this.route).params.token)
      let endpoint = urlJoin(
        this.clientService.webdav.getPublicFileUrl(this.space, publicLinkToken),
        { trailingSlash: true }
      )

      for (const file of files) {
        if (!this.uppy.getPlugin('Tus')) {
          endpoint = urlJoin(endpoint, encodeURIComponent(file.name))
        }

        file[this.getUploadPluginName()] = { endpoint }
        file.meta = {
          ...file.meta,
          tusEndpoint: endpoint,
          uploadId: uuid.v4()
        }

        filesToUpload[file.id] = file as unknown as UppyResource
      }
      this.uppy.setState({ files: { ...this.uppy.getState().files, ...filesToUpload } })
      return Object.values(filesToUpload)
    }
    const { id: currentFolderId, path: currentFolderPath } = this.currentFolder

    const { name, params, query } = unref(this.route)
    const topLevelFolderIds: Record<string, string> = {}

    for (const file of files) {
      const relativeFilePath = file.meta.relativePath as string
      // Directory without filename
      const directory =
        !relativeFilePath || dirname(relativeFilePath) === '.' ? '' : dirname(relativeFilePath)

      let topLevelFolderId: string
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
      if (!this.uppy.getPlugin('Tus')) {
        endpoint = urlJoin(endpoint, encodeURIComponent(file.name))
      }

      file[this.getUploadPluginName()] = { endpoint }
      file.meta = {
        ...file.meta,
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
      }

      filesToUpload[file.id] = file as unknown as UppyResource
    }

    this.uppy.setState({ files: { ...this.uppy.getState().files, ...filesToUpload } })
    return Object.values(filesToUpload)
  }

  checkQuotaExceeded(filesToUpload: UppyResource[]): boolean {
    let quotaExceeded = false

    const uploadSizeSpaceMapping = filesToUpload.reduce((acc, uppyResource) => {
      let targetUploadSpace: SpaceResource

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

    let filesToRemove: string[] = []
    if (failedFolders.length) {
      // remove files of folders that could not be created
      filesToRemove = filesToUpload
        .filter((f) => failedFolders.some((r) => f.meta.relativeFolder.startsWith(r)))
        .map(({ id }) => id)
      for (const fileId of filesToRemove) {
        this.uppy.removeFile(fileId)
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
      const conflictHandler = new ResourceConflict(this.store, this.language)
      const conflicts = conflictHandler.getConflicts(filesToUpload)
      if (conflicts.length) {
        const dashboard = document.getElementsByClassName('uppy-Dashboard')
        if (dashboard.length) {
          ;(dashboard[0] as HTMLElement).style.display = 'none'
        }

        const result = await conflictHandler.displayOverwriteDialog(filesToUpload, conflicts)
        if (result.length === 0) {
          this.removeFilesFromUpload(filesToUpload)
          return this.uppyService.clearInputs()
        }

        filesToUpload = result
        const conflictMap = result.reduce<Record<string, UppyResource>>((acc, file) => {
          acc[file.id] = file
          return acc
        }, {})
        this.uppy.setState({ files: { ...this.uppy.getState().files, ...conflictMap } })
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
    this.uppy.on('files-added', this.handleUpload)
  }

  uninstall() {
    this.uppy.off('files-added', this.handleUpload)
  }
}
