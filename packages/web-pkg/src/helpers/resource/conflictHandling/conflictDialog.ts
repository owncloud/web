import { join } from 'path'
import { Resource } from '@ownclouders/web-client'
import { ResolveConflict, ResolveStrategy } from '.'
import { ResourceConflictModal } from '../../../components'

export interface FileConflict {
  resource: Resource
  strategy?: ResolveStrategy
}

export class ConflictDialog {
  /* eslint-disable no-useless-constructor */
  constructor(
    protected createModal: (modal: object) => void,
    protected hideModal: () => void,
    protected showMessage: (data: object) => void,
    protected showErrorMessage: (data: object) => void,
    protected $gettext: (
      msgid: string,
      parameters?: {
        [key: string]: string
      },
      disableHtmlEscaping?: boolean
    ) => string,
    protected $ngettext: (
      msgid: string,
      plural: string,
      n: number,
      parameters?: {
        [key: string]: string
      },
      disableHtmlEscaping?: boolean
    ) => string
  ) {}

  async resolveAllConflicts(
    resourcesToMove: Resource[],
    targetFolder: Resource,
    targetFolderResources: Resource[]
  ): Promise<FileConflict[]> {
    // Collect all conflicting resources
    const allConflicts: FileConflict[] = []
    for (const resource of resourcesToMove) {
      const targetFilePath = join(targetFolder.path, resource.name)
      const exists = targetFolderResources.some((r) => r.path === targetFilePath)
      if (exists) {
        allConflicts.push({ resource, strategy: null })
      }
    }
    let count = 0
    let doForAllConflicts = false
    let doForAllConflictsStrategy = null
    const resolvedConflicts: FileConflict[] = []
    for (const conflict of allConflicts) {
      // Resolve conflicts accordingly
      if (doForAllConflicts) {
        conflict.strategy = doForAllConflictsStrategy
        resolvedConflicts.push(conflict)
        continue
      }

      // Resolve next conflict
      const conflictsLeft = allConflicts.length - count
      const result: ResolveConflict = await this.resolveFileExists(conflict.resource, conflictsLeft)
      conflict.strategy = result.strategy
      resolvedConflicts.push(conflict)
      count += 1

      // User checked 'do for all x conflicts'
      if (!result.doForAllConflicts) {
        continue
      }
      doForAllConflicts = true
      doForAllConflictsStrategy = result.strategy
    }
    return resolvedConflicts
  }

  resolveFileExists(
    resource: Resource,
    conflictCount: number,
    suggestMerge = false,
    separateSkipHandling = false // separate skip-handling between files and folders
  ): Promise<ResolveConflict> {
    return new Promise<ResolveConflict>((resolve) => {
      this.createModal({
        variation: 'danger',
        title: resource.isFolder
          ? this.$gettext('Folder already exists')
          : this.$gettext('File already exists'),
        hideActions: true,
        customComponent: ResourceConflictModal,
        customComponentAttrs: () => ({
          resource,
          conflictCount,
          suggestMerge,
          separateSkipHandling,
          callbackFn: (conflict: ResolveConflict) => {
            resolve(conflict)
          }
        })
      })
    })
  }

  resolveDoCopyInsteadOfMoveForSpaces(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const modal = {
        variation: 'danger',
        title: this.$gettext('Copy here?'),
        customContent: `<p>${this.$gettext(
          'Moving files from one space to another is not possible. Do you want to copy instead?'
        )}</p><p>${this.$gettext(
          'Note: Links and shares of the original file are not copied.'
        )}</p>`,
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Copy here'),
        onCancel: () => {
          this.hideModal()
          resolve(false)
        },
        onConfirm: () => {
          this.hideModal()
          resolve(true)
        }
      }
      this.createModal(modal)
    })
  }
}
