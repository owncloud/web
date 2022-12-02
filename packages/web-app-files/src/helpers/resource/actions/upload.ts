import filesize from 'filesize'
import { Resource } from 'web-client'
import {
  extractExtensionFromFile,
  isShareSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'
import { CreateDirectoryTreeResult, UppyResource } from 'web-runtime/src/composables/upload'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { ConflictDialog, ResolveConflict, resolveFileNameDuplicate, ResolveStrategy } from '..'
import { locationPublicLink } from '../../../router/public'
import { locationSpacesGeneric } from '../../../router/spaces'

interface ConflictedResource {
  name: string
  type: string
}

export class ResourcesUpload extends ConflictDialog {
  constructor(
    private filesToUpload: File[],
    private currentFiles: Resource[],
    private inputFilesToUppyFiles: (inputFileOptions) => UppyResource[],
    private $uppyService: UppyService,
    private space: SpaceResource,
    private currentFolder: string,
    private currentFolderId: string | number,
    private spaces: SpaceResource[],
    private hasSpaces: boolean,
    private createDirectoryTree: (
      space: SpaceResource,
      currentPath: string,
      files: UppyResource[],
      currentFolderId?: string | number
    ) => Promise<CreateDirectoryTreeResult>,
    createModal: (modal: object) => void,
    hideModal: () => void,
    showMessage: (data: object) => void,
    $gettext: (msg: string) => string,
    $ngettext: (msgid: string, plural: string, n: number) => string,
    $gettextInterpolate: (msg: string, context: object, disableHtmlEscaping?: boolean) => string
  ) {
    super(createModal, hideModal, showMessage, $gettext, $ngettext, $gettextInterpolate)
  }

  perform() {
    const uppyResources: UppyResource[] = this.inputFilesToUppyFiles(this.filesToUpload)
    const quotaExceeded = this.checkQuotaExceeded(uppyResources)
    if (quotaExceeded) {
      return this.$uppyService.clearInputs()
    }

    const conflicts = this.getConflicts(uppyResources)
    if (conflicts.length) {
      return this.displayOverwriteDialog(uppyResources, conflicts)
    }

    this.handleUppyFileUpload(this.space, this.currentFolder, uppyResources)
  }

  getConflicts(files: UppyResource[]): ConflictedResource[] {
    const conflicts: ConflictedResource[] = []
    for (const file of files) {
      const relativeFilePath = file.meta.relativePath
      if (relativeFilePath) {
        // Logic for folders, applies to all files inside folder and subfolders
        const rootFolder = relativeFilePath.replace(/^\/+/, '').split('/')[0]
        const exists = this.currentFiles.find((f) => f.name === rootFolder)
        if (exists) {
          if (conflicts.some((conflict) => conflict.name === rootFolder)) {
            continue
          }
          conflicts.push({ name: rootFolder, type: 'folder' })
          continue
        }
      }
      // Logic for files
      const exists = this.currentFiles.find(
        (f) => f.name === file.name && !file.meta.relativeFolder
      )
      if (exists) {
        conflicts.push({ name: file.name, type: 'file' })
      }
    }
    return conflicts
  }

  async handleUppyFileUpload(space: SpaceResource, currentFolder: string, files: UppyResource[]) {
    this.$uppyService.publish('uploadStarted')
    const result = await this.createDirectoryTree(space, currentFolder, files, this.currentFolderId)

    // filter out files in folders that could not be created
    let filesToUpload = files
    if (result.failed.length) {
      filesToUpload = files.filter(
        (f) => !result.failed.some((r) => f.meta.relativeFolder.startsWith(r))
      )
    }

    // gather failed files to be retried
    const failedFiles = this.$uppyService.getFailedFiles()
    const retries = []

    for (const failedFile of failedFiles) {
      const fileToRetry = filesToUpload.find((f) => f.meta.uppyId === failedFile.meta.uppyId)
      if (fileToRetry) {
        // re-use the old uploadId
        fileToRetry.meta.uploadId = failedFile.meta.uploadId
        retries.push(fileToRetry)
      }
    }

    if (filesToUpload.length) {
      this.$uppyService.publish('addedForUpload', filesToUpload)
    }

    for (const retry of retries) {
      this.$uppyService.retryUpload(retry.meta.uppyId)
      // filter out files that have been retried
      filesToUpload = filesToUpload.filter((f) => f.meta.uppyId !== retry.meta.uppyId)
    }

    if (filesToUpload.length) {
      this.$uppyService.uploadFiles(filesToUpload)
    }

    if (!filesToUpload.length && !retries.length) {
      this.$uppyService.publish('uploadCompleted', { successful: [] })
    }
  }

  async displayOverwriteDialog(files: UppyResource[], conflicts: ConflictedResource[]) {
    let fileCount = 0
    let folderCount = 0
    const resolvedFileConflicts = []
    const resolvedFolderConflicts = []
    let doForAllConflicts = false
    let allConflictsStrategy
    let doForAllConflictsFolders = false
    let allConflictsStrategyFolders

    for (const conflict of conflicts) {
      const isFolder = conflict.type === 'folder'
      const conflictArray = isFolder ? resolvedFolderConflicts : resolvedFileConflicts

      if (doForAllConflicts && !isFolder) {
        conflictArray.push({
          name: conflict.name,
          strategy: allConflictsStrategy
        })
        continue
      }
      if (doForAllConflictsFolders && isFolder) {
        conflictArray.push({
          name: conflict.name,
          strategy: allConflictsStrategyFolders
        })
        continue
      }

      const conflictsLeft =
        conflicts.filter((c) => c.type === conflict.type).length -
        (isFolder ? folderCount : fileCount)

      const resolvedConflict: ResolveConflict = await this.resolveFileExists(
        { name: conflict.name, isFolder } as Resource,
        conflictsLeft,
        conflictsLeft === 1,
        isFolder,
        true
      )
      isFolder ? folderCount++ : fileCount++
      if (resolvedConflict.doForAllConflicts) {
        if (isFolder) {
          doForAllConflictsFolders = true
          allConflictsStrategyFolders = resolvedConflict.strategy
        } else {
          doForAllConflicts = true
          allConflictsStrategy = resolvedConflict.strategy
        }
      }

      conflictArray.push({
        name: conflict.name,
        strategy: resolvedConflict.strategy
      })
    }
    const filesToSkip = resolvedFileConflicts
      .filter((e) => e.strategy === ResolveStrategy.SKIP)
      .map((e) => e.name)
    const foldersToSkip = resolvedFolderConflicts
      .filter((e) => e.strategy === ResolveStrategy.SKIP)
      .map((e) => e.name)

    files = files.filter((e) => !filesToSkip.includes(e.name))
    files = files.filter(
      (file) =>
        !foldersToSkip.some((folderName) => file.meta.relativeFolder.split('/')[1] === folderName)
    )

    const filesToKeepBoth = resolvedFileConflicts
      .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
      .map((e) => e.name)
    const foldersToKeepBoth = resolvedFolderConflicts
      .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
      .map((e) => e.name)

    for (const fileName of filesToKeepBoth) {
      const file = files.find((e) => e.name === fileName && !e.meta.relativeFolder)
      const extension = extractExtensionFromFile({ name: fileName } as Resource)
      file.name = resolveFileNameDuplicate(fileName, extension, this.currentFiles)
    }
    for (const folder of foldersToKeepBoth) {
      const filesInFolder = files.filter((e) => e.meta.relativeFolder.split('/')[1] === folder)
      for (const file of filesInFolder) {
        const newFolderName = resolveFileNameDuplicate(folder, '', this.currentFiles)
        file.meta.relativeFolder = file.meta.relativeFolder.replace(
          new RegExp(`/${folder}`),
          `/${newFolderName}`
        )
        file.meta.relativePath = file.meta.relativePath.replace(
          new RegExp(`/${folder}/`),
          `/${newFolderName}/`
        )
        file.meta.tusEndpoint = file.meta.tusEndpoint.replace(
          new RegExp(`/${folder}`),
          `/${newFolderName}`
        )
      }
    }
    if (files.length === 0) {
      return this.$uppyService.clearInputs()
    }
    this.handleUppyFileUpload(this.space, this.currentFolder, files)
  }

  checkQuotaExceeded(uppyResources: UppyResource[]) {
    if (!this.hasSpaces) {
      return false
    }

    let quotaExceeded = false

    const uploadSizeSpaceMapping = uppyResources.reduce((acc, uppyResource) => {
      let targetUploadSpace

      if (uppyResource.meta.routeName === locationPublicLink.name) {
        return acc
      }

      if (uppyResource.meta.routeName === locationSpacesGeneric.name) {
        targetUploadSpace = this.spaces.find((space) => space.id === uppyResource.meta.spaceId)
      }

      if (!targetUploadSpace || isShareSpaceResource(targetUploadSpace)) {
        return acc
      }

      const existingFile = this.currentFiles.find(
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

    uploadSizeSpaceMapping.forEach(({ space, uploadSize }) => {
      if (space.spaceQuota.remaining && space.spaceQuota.remaining < uploadSize) {
        let spaceName = space.name

        if (space.driveType === 'personal') {
          spaceName = this.$gettext('Personal')
        }

        const translated = this.$gettext(
          'There is not enough quota on %{spaceName}, you need additional %{missingSpace} to upload these files'
        )

        this.showMessage({
          title: this.$gettext('Not enough quota'),
          desc: this.$gettextInterpolate(translated, {
            spaceName,
            missingSpace: filesize((space.spaceQuota.remaining - uploadSize) * -1)
          }),
          status: 'danger'
        })

        quotaExceeded = true
      }
    })

    return quotaExceeded
  }
}
