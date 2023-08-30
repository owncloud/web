import { join } from 'path'
import { Resource } from 'web-client'
import { ResolveConflict, ResolveStrategy } from '.'

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
    targetFolderResources: Resource[],
    enforceStrategyForAllConflicts?: ResolveStrategy | boolean
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
    let doForAllConflicts = enforceStrategyForAllConflicts ? true : false
    let doForAllConflictsStrategy = enforceStrategyForAllConflicts || null
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
      const result: ResolveConflict = await this.resolveFileExists(
        conflict.resource,
        conflictsLeft,
        conflictsLeft === 1
      )
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
    isSingleConflict: boolean,
    suggestMerge = false,
    separateSkipHandling = false // separate skip-handling between files and folders
  ): Promise<ResolveConflict> {
    let translatedSkipLabel

    if (!separateSkipHandling) {
      translatedSkipLabel = this.$gettext(
        'Apply to all %{count} conflicts',
        { count: conflictCount.toString() },
        true
      )
    } else if (resource.isFolder) {
      translatedSkipLabel = this.$gettext(
        'Apply to all %{count} folders',
        { count: conflictCount.toString() },
        true
      )
    } else {
      translatedSkipLabel = this.$gettext(
        'Apply to all %{count} files',
        { count: conflictCount.toString() },
        true
      )
    }

    return new Promise<ResolveConflict>((resolve) => {
      let doForAllConflicts = false
      const modal = {
        variation: 'danger',
        title: resource.isFolder
          ? this.$gettext('Folder already exists')
          : this.$gettext('File already exists'),
        message: resource.isFolder
          ? this.$gettext(
              'Folder with name "%{name}" already exists.',
              { name: resource.name },
              true
            )
          : this.$gettext(
              'File with name "%{name}" already exists.',
              { name: resource.name },
              true
            ),
        cancelText: this.$gettext('Skip'),
        confirmText: this.$gettext('Keep both'),
        buttonSecondaryText: suggestMerge ? this.$gettext('Merge') : this.$gettext('Replace'),
        checkboxLabel: isSingleConflict ? '' : translatedSkipLabel,
        onCheckboxValueChanged: (value) => {
          doForAllConflicts = value
        },
        onCancel: () => {
          this.hideModal()
          resolve({ strategy: ResolveStrategy.SKIP, doForAllConflicts } as ResolveConflict)
        },
        onConfirmSecondary: () => {
          this.hideModal()
          const strategy = suggestMerge ? ResolveStrategy.MERGE : ResolveStrategy.REPLACE
          resolve({ strategy, doForAllConflicts } as ResolveConflict)
        },
        onConfirm: () => {
          this.hideModal()
          resolve({ strategy: ResolveStrategy.KEEP_BOTH, doForAllConflicts } as ResolveConflict)
        }
      }
      this.createModal(modal)
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
