import filesize from 'filesize'
import { Resource } from 'web-client'
import {
  extractExtensionFromFile,
  isShareSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'
import { UppyResource } from 'web-runtime/src/composables/upload'
import { ConflictDialog, ResolveConflict, resolveFileNameDuplicate, ResolveStrategy } from '..'
import { locationPublicLink } from '../../../router/public'
import { locationSpacesGeneric } from '../../../router/spaces'

export class ResourcesUpload extends ConflictDialog {
  constructor(
    private filesToUpload: File[],
    private currentFiles: Resource[],
    private inputFilesToUppyFiles: (inputFileOptions) => UppyResource[],
    private $uppyService: any,
    private space: SpaceResource,
    private currentFolder: string,
    private currentFolderId: string | number,
    private spaces: SpaceResource[],
    private hasSpaces: boolean,
    private createDirectoryTree: any,
    createModal: (modal: object) => void,
    hideModal: () => void,
    showMessage: (data: object) => void,
    $gettext: (msg: string) => string,
    $ngettext: (msgid: string, plural: string, n: number) => string,
    $gettextInterpolate: (msg: string, context: object, disableHtmlEscaping?: boolean) => string
  ) {
    super(createModal, hideModal, showMessage, $gettext, $ngettext, $gettextInterpolate)
  }

  async perform() {
    const conflicts = []
    const uppyResources: UppyResource[] = this.inputFilesToUppyFiles(this.filesToUpload)
    const quotaExceeded = this.checkQuotaExceeded(uppyResources)

    if (quotaExceeded) {
      return this.$uppyService.clearInputs()
    }
    for (const file of uppyResources) {
      const relativeFilePath = file.meta.relativePath
      if (relativeFilePath) {
        // Logic for folders, applies to all files inside folder and subfolders
        const rootFolder = relativeFilePath.replace(/^\/+/, '').split('/')[0]
        const exists = this.currentFiles.find((f) => f.name === rootFolder)
        if (exists) {
          if (conflicts.some((conflict) => conflict.name === rootFolder)) {
            continue
          }
          conflicts.push({
            name: rootFolder,
            type: 'folder'
          })
          continue
        }
      }
      // Logic for files
      const exists = this.currentFiles.find(
        (f) => f.name === file.name && !file.meta.relativeFolder
      )
      if (exists) {
        conflicts.push({
          name: file.name,
          type: 'file'
        })
      }
    }
    if (conflicts.length) {
      await this.displayOverwriteDialog(uppyResources, conflicts)
    } else {
      this.handleUppyFileUpload(this.space, this.currentFolder, uppyResources)
    }
  }

  async handleUppyFileUpload(space: SpaceResource, currentFolder: string, files: UppyResource[]) {
    this.$uppyService.publish('uploadStarted')
    await this.createDirectoryTree(space, currentFolder, files, this.currentFolderId)
    this.$uppyService.publish('addedForUpload', files)
    this.$uppyService.uploadFiles(files)
  }

  async displayOverwriteDialog(files: UppyResource[], conflicts) {
    let count = 0
    const allConflictsCount = conflicts.length
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
      const conflictsLeft = allConflictsCount - count
      const resolvedConflict: ResolveConflict = await this.resolveFileExists(
        { name: conflict.name, isFolder } as Resource,
        conflictsLeft,
        conflictsLeft === 1,
        isFolder
      )
      count++
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

      const matchingMappingRecord = acc.find(
        (mappingRecord) => mappingRecord.space.id === targetUploadSpace.id
      )

      if (!matchingMappingRecord) {
        acc.push({
          space: targetUploadSpace,
          uploadSize: uppyResource.data.size
        })
        return acc
      }

      matchingMappingRecord.uploadSize += uppyResource.data.size

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
