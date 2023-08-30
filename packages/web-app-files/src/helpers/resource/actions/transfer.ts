import { Resource } from 'web-client'
import { basename, join } from 'path'
import { SpaceResource } from 'web-client/src/helpers'
import { ClientService, LoadingService, LoadingTaskCallbackArguments } from 'web-pkg/src/services'
import {
  ConflictDialog,
  ResolveStrategy,
  isResourceBeeingMovedToSameLocation,
  resolveFileNameDuplicate,
  FileConflict
} from '../conflictHandling'
import { TransferType } from '.'

export class ResourceTransfer extends ConflictDialog {
  constructor(
    private sourceSpace: SpaceResource,
    private resourcesToMove: Resource[],
    private targetSpace: SpaceResource,
    private targetFolder: Resource,
    private clientService: ClientService,
    private loadingService: LoadingService,
    createModal: (modal: object) => void,
    hideModal: () => void,
    showMessage: (data: object) => void,
    showErrorMessage: (data: object) => void,
    $gettext: (
      msgid: string,
      parameters?: {
        [key: string]: string
      },
      disableHtmlEscaping?: boolean
    ) => string,
    $ngettext: (
      msgid: string,
      plural: string,
      n: number,
      parameters?: {
        [key: string]: string
      },
      disableHtmlEscaping?: boolean
    ) => string
  ) {
    super(createModal, hideModal, showMessage, showErrorMessage, $gettext, $ngettext)
  }

  hasRecursion(): boolean {
    if (this.sourceSpace.id !== this.targetSpace.id) {
      return false
    }
    return this.resourcesToMove.some(
      (resource: Resource) => this.targetFolder.path === resource.path
    )
  }

  showRecursionErrorMessage() {
    const count = this.resourcesToMove.length
    const title = this.$ngettext(
      "You can't paste the selected file at this location because you can't paste an item into itself.",
      "You can't paste the selected files at this location because you can't paste an item into itself.",
      count
    )
    this.showErrorMessage({ title })
  }

  showResultMessage(errors, movedResources: Array<Resource>, transferType: TransferType) {
    if (errors.length === 0) {
      const count = movedResources.length
      if (count === 0) {
        return
      }
      const title =
        transferType === TransferType.COPY
          ? this.$ngettext(
              '%{count} item was copied successfully',
              '%{count} items were copied successfully',
              count,
              { count: count.toString() },
              true
            )
          : transferType === TransferType.DUPLICATE
          ? this.$ngettext(
              '%{count} item was duplicated successfully',
              '%{count} items were duplicated successfully',
              count,
              { count: count.toString() },
              true
            )
          : this.$ngettext(
              '%{count} item was moved successfully',
              '%{count} items were moved successfully',
              count,
              { count: count.toString() },
              true
            )
      this.showMessage({
        title,
        status: 'success'
      })
      return
    }
    let title =
      transferType === TransferType.COPY
        ? this.$gettext('Failed to copy %{count} resources', { count: errors.length }, true)
        : transferType === TransferType.DUPLICATE
        ? this.$gettext('Failed to duplicate %{count} resources', { count: errors.length }, true)
        : this.$gettext('Failed to move %{count} resources', { count: errors.length }, true)
    if (errors.length === 1) {
      title =
        transferType === TransferType.COPY
          ? this.$gettext('Failed to copy "%{name}"', { name: errors[0]?.resourceName }, true)
          : transferType === TransferType.DUPLICATE
          ? this.$gettext('Failed to duplicate "%{name}"', { name: errors[0]?.resourceName }, true)
          : this.$gettext('Failed to move "%{name}"', { name: errors[0]?.resourceName }, true)
    }
    this.showErrorMessage({
      title,
      errors
    })
  }

  async perform(transferType: TransferType): Promise<Resource[]> {
    if (this.hasRecursion()) {
      this.showRecursionErrorMessage()
      return []
    }
    if (this.sourceSpace.id !== this.targetSpace.id && transferType === TransferType.MOVE) {
      const doCopyInsteadOfMove = await this.resolveDoCopyInsteadOfMoveForSpaces()
      if (!doCopyInsteadOfMove) {
        return []
      }
      transferType = TransferType.COPY
    }

    const targetFolderResources = (
      await this.clientService.webdav.listFiles(this.targetSpace, this.targetFolder)
    ).children

    const enforceStrategyForAllConflicts =
      transferType === TransferType.DUPLICATE ? ResolveStrategy.KEEP_BOTH : false

    const resolvedConflicts = await this.resolveAllConflicts(
      this.resourcesToMove,
      this.targetFolder,
      targetFolderResources,
      enforceStrategyForAllConflicts
    )

    return this.loadingService.addTask(
      ({ setProgress }) => {
        return this.moveResources(resolvedConflicts, targetFolderResources, transferType, {
          setProgress
        })
      },
      { indeterminate: transferType === TransferType.COPY }
    )
  }

  // This is for an edge case if a user moves a subfolder with the same name as the parent folder into the parent of the parent folder (which is not possible because of the backend)
  public isOverwritingParentFolder(resource, targetFolder, targetFolderResources) {
    if (resource.type !== 'folder') {
      return false
    }
    const folderName = basename(resource.path)
    const newPath = join(targetFolder.path, folderName)
    return targetFolderResources.some((resource) => resource.path === newPath)
  }

  private async moveResources(
    resolvedConflicts: FileConflict[],
    targetFolderResources: Resource[],
    transferType: TransferType,
    { setProgress }: LoadingTaskCallbackArguments
  ) {
    const movedResources: Resource[] = []
    const errors = []

    for (let [i, resource] of this.resourcesToMove.entries()) {
      // shallow copy of resources to prevent modifying existing rows
      resource = { ...resource }

      const hasConflict = resolvedConflicts.some((e) => e.resource.id === resource.id)
      let targetName = resource.name
      let overwriteTarget = false
      if (hasConflict) {
        const resolveStrategy = resolvedConflicts.find(
          (e) => e.resource.id === resource.id
        )?.strategy
        if (resolveStrategy === ResolveStrategy.SKIP) {
          continue
        }
        if (resolveStrategy === ResolveStrategy.REPLACE) {
          if (this.isOverwritingParentFolder(resource, this.targetFolder, targetFolderResources)) {
            errors.push({ resourceName: resource.name })
            continue
          }
          overwriteTarget = true
        }
        if (resolveStrategy === ResolveStrategy.KEEP_BOTH) {
          targetName = resolveFileNameDuplicate(resource.name, resource.extension, [
            ...movedResources,
            ...targetFolderResources
          ])
          resource.name = targetName
        }
      }
      try {
        if (
          isResourceBeeingMovedToSameLocation(
            this.sourceSpace,
            resource,
            this.targetSpace,
            this.targetFolder
          ) &&
          overwriteTarget
        ) {
          continue
        }
        if (transferType === TransferType.COPY || transferType === TransferType.DUPLICATE) {
          await this.clientService.webdav.copyFiles(
            this.sourceSpace,
            resource,
            this.targetSpace,
            { path: join(this.targetFolder.path, targetName) },
            { overwrite: overwriteTarget }
          )
          resource.id = undefined
          resource.fileId = undefined
        } else if (transferType === TransferType.MOVE) {
          await this.clientService.webdav.moveFiles(
            this.sourceSpace,
            resource,
            this.targetSpace,
            { path: join(this.targetFolder.path, targetName) },
            { overwrite: overwriteTarget }
          )
        }
        resource.path = join(this.targetFolder.path, resource.name)
        resource.webDavPath = join(this.targetFolder.webDavPath, resource.name)
        movedResources.push(resource)
      } catch (error) {
        console.error(error)
        error.resourceName = resource.name
        errors.push(error)
      } finally {
        setProgress({ total: this.resourcesToMove.length, current: i + 1 })
      }
    }
    this.showResultMessage(errors, movedResources, transferType)
    return movedResources
  }
}
