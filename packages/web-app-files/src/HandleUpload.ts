import Uppy, { BasePlugin, UppyFile } from '@uppy/core'
import { filesize } from 'filesize'
import { basename, dirname, join } from 'path'
import * as uuid from 'uuid'
import { Language } from 'vue3-gettext'
import { Ref, unref } from 'vue'
import { RouteLocationNormalizedLoaded } from 'vue-router'
import { extractNodeId, SpaceResource } from '@ownclouders/web-client'
import { urlJoin } from '@ownclouders/web-client'
import { UploadResourceConflict } from './helpers/resource'
import {
  MessageStore,
  ResourcesStore,
  SpacesStore,
  UserStore,
  locationPublicLink
} from '@ownclouders/web-pkg'
import { locationSpacesGeneric, UppyService, UppyResource } from '@ownclouders/web-pkg'
import { isPersonalSpaceResource, isShareSpaceResource } from '@ownclouders/web-client'
import { ClientService, queryItemAsString } from '@ownclouders/web-pkg'

export interface HandleUploadOptions {
  clientService: ClientService
  language: Language
  route: Ref<RouteLocationNormalizedLoaded>
  userStore: UserStore
  messageStore: MessageStore
  spacesStore: SpacesStore
  resourcesStore: ResourcesStore
  uppyService: UppyService
  id?: string
  space?: Ref<SpaceResource>
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
  language: Language
  route: Ref<RouteLocationNormalizedLoaded>
  space: Ref<SpaceResource>
  userStore: UserStore
  messageStore: MessageStore
  spacesStore: SpacesStore
  resourcesStore: ResourcesStore
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
    this.language = opts.language
    this.route = opts.route
    this.space = opts.space
    this.userStore = opts.userStore
    this.messageStore = opts.messageStore
    this.spacesStore = opts.spacesStore
    this.resourcesStore = opts.resourcesStore
    this.uppyService = opts.uppyService

    this.quotaCheckEnabled = opts.quotaCheckEnabled ?? true
    this.directoryTreeCreateEnabled = opts.directoryTreeCreateEnabled ?? true
    this.conflictHandlingEnabled = opts.conflictHandlingEnabled ?? true

    this.handleUpload = this.handleUpload.bind(this)
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

    if (!this.resourcesStore.currentFolder && unref(this.route)?.params?.token) {
      // public file drop
      const publicLinkToken = queryItemAsString(unref(this.route).params.token)
      let endpoint = urlJoin(
        this.clientService.webdav.getPublicFileUrl(unref(this.space), publicLinkToken),
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
    const { id: currentFolderId, path: currentFolderPath } = this.resourcesStore.currentFolder

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

      const webDavUrl = unref(this.space).getWebDavUrl(currentFolderId)

      let endpoint = urlJoin(webDavUrl, directory.split('/').map(encodeURIComponent).join('/'))
      if (!this.uppy.getPlugin('Tus')) {
        endpoint = urlJoin(endpoint, encodeURIComponent(file.name))
      }

      file[this.getUploadPluginName()] = { endpoint }
      file.meta = {
        ...file.meta,
        // file data
        name: file.name,
        mtime: file.data.lastModified / 1000,
        // current path & space
        spaceId: unref(this.space).id,
        spaceName: unref(this.space).name,
        driveAlias: unref(this.space).driveAlias,
        driveType: unref(this.space).driveType,
        currentFolder: currentFolderPath,
        currentFolderId,
        // upload data
        uppyId: this.uppyService.generateUploadId(file),
        relativeFolder: directory,
        tusEndpoint: endpoint,
        uploadId: uuid.v4(),
        topLevelFolderId,
        // route data
        routeName: name as string,
        routeDriveAliasAndItem: queryItemAsString(params?.driveAliasAndItem) || '',
        routeShareId: queryItemAsString(query?.shareId) || ''
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
        targetUploadSpace = this.spacesStore.spaces.find(
          ({ id }) => id === uppyResource.meta.spaceId
        )
      }

      if (
        !targetUploadSpace ||
        isShareSpaceResource(targetUploadSpace) ||
        (isPersonalSpaceResource(targetUploadSpace) &&
          !targetUploadSpace.isOwner(this.userStore.user))
      ) {
        return acc
      }

      const existingFile = this.resourcesStore.resources.find(
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

        this.messageStore.showErrorMessage({
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
    const space = unref(this.space)
    const { id: currentFolderId, path: currentFolderPath } = this.resourcesStore.currentFolder

    const routeName = filesToUpload[0].meta.routeName
    const routeDriveAliasAndItem = filesToUpload[0].meta.routeDriveAliasAndItem
    const routeShareId = filesToUpload[0].meta.routeShareId

    const failedFolders: string[] = []
    const directoryTree: Record<string, any> = {}
    const topLevelIds: Record<string, string> = {}

    for (const file of filesToUpload.filter(({ meta }) => !!meta.relativeFolder)) {
      const folders = file.meta.relativeFolder.split('/').filter(Boolean)
      let current = directoryTree
      if (folders.length <= 1) {
        topLevelIds[file.meta.relativeFolder] = file.meta.topLevelFolderId
      }
      for (const folder of folders) {
        current[folder] = current[folder] || {}
        current = current[folder]
      }
    }

    const createDirectoryLevel = async (current: Record<string, any>, path = '') => {
      if (path) {
        const isRoot = path.split('/').length <= 1
        path = urlJoin(path, { leadingSlash: true })
        const uploadId = !isRoot ? uuid.v4() : topLevelIds[path]
        const relativeFolder = dirname(path) === '/' ? '' : dirname(path)

        const uppyResource = {
          id: uuid.v4(),
          name: basename(path),
          isFolder: true,
          type: 'folder',
          meta: {
            spaceId: space.id,
            spaceName: space.name,
            driveAlias: space.driveAlias,
            driveType: space.driveType,
            currentFolder: currentFolderPath,
            currentFolderId,
            relativeFolder,
            uploadId,
            routeName,
            routeDriveAliasAndItem,
            routeShareId
          }
        }

        if (failedFolders.includes(relativeFolder)) {
          // return if top level folder failed to create
          return
        }

        this.uppyService.publish('addedForUpload', [uppyResource])

        try {
          const folder = await webdav.createFolder(space, {
            path: urlJoin(currentFolderPath, path),
            fetchFolder: isRoot
          })
          this.uppyService.publish('uploadSuccess', {
            ...uppyResource,
            meta: { ...uppyResource.meta, fileId: folder?.fileId }
          })
        } catch (error) {
          if (error.statusCode !== 405) {
            console.error(error)
            failedFolders.push(path)
            this.uppyService.publish('uploadError', { file: uppyResource, error })
          }
        }
      }

      const foldersToBeCreated = Object.keys(current)
      const promises: Promise<unknown>[] = []
      for (const folder of foldersToBeCreated) {
        promises.push(createDirectoryLevel(current[folder], join(path, folder)))
      }
      return Promise.allSettled(promises)
    }

    await createDirectoryLevel(directoryTree)

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
    if (!files.length) {
      return
    }

    let filesToUpload = this.prepareFiles(files)

    // quota check
    if (this.quotaCheckEnabled) {
      const quotaExceeded = this.checkQuotaExceeded(filesToUpload)
      if (quotaExceeded) {
        this.removeFilesFromUpload(filesToUpload)
        return this.uppyService.clearInputs()
      }
    }

    // name conflict handling
    if (this.conflictHandlingEnabled) {
      const conflictHandler = new UploadResourceConflict(this.resourcesStore, this.language)
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
