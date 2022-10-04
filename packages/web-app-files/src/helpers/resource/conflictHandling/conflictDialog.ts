import { join } from 'path'
import { Resource } from 'web-client'
import { SpaceResource } from 'web-client/src/helpers'
import { ResolveConflict, ResolveStrategy } from '.'

interface FileConflict {
  resource: Resource
  strategy?: ResolveStrategy
}

export class ConflictDialog {
  /* eslint-disable no-useless-constructor */
  constructor(
    protected createModal: (modal: object) => void,
    protected hideModal: () => void,
    protected showMessage: (data: object) => void,
    protected $gettext: (msg: string) => string,
    protected $ngettext: (msgid: string, plural: string, n: number) => string,
    protected $gettextInterpolate: (
      msg: string,
      context: object,
      disableHtmlEscaping?: boolean
    ) => string
  ) {}

  async resolveAllConflicts(
    resourcesToMove: Resource[],
    targetSpace: SpaceResource,
    targetFolder: Resource,
    targetFolderResources: Resource[]
  ) {
    // Collect all conflicting resources
    const allConflicts = []
    for (const resource of resourcesToMove) {
      const targetFilePath = join(targetFolder.path, resource.name)
      const exists = targetFolderResources.some((r) => r.path === targetFilePath)
      if (exists) {
        allConflicts.push({
          resource,
          strategy: null
        } as FileConflict)
      }
    }
    let count = 0
    let doForAllConflicts = false
    let doForAllConflictsStrategy = null
    const resolvedConflicts = []
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

  async resolveFileExists(
    resource: Resource,
    conflictCount: number,
    isSingleConflict: boolean,
    suggestMerge = false
  ): Promise<ResolveConflict> {
    return new Promise<ResolveConflict>((resolve) => {
      let doForAllConflicts = false
      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$gettext('File already exists'),
        message: this.$gettextInterpolate(
          resource.isFolder
            ? this.$gettext('Folder with name %{name} already exists.')
            : this.$gettext('File with name %{name} already exists.'),
          { name: resource.name },
          true
        ),
        cancelText: this.$gettext('Skip'),
        confirmText: this.$gettext('Keep both'),
        buttonSecondaryText: suggestMerge ? this.$gettext('Merge') : this.$gettext('Replace'),
        checkboxLabel: isSingleConflict
          ? ''
          : this.$gettextInterpolate(
              this.$gettext('Apply to all %{count} conflicts'),
              { count: conflictCount },
              true
            ),
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
        icon: 'alarm-warning',
        title: this.$gettext('Copy here?'),
        message: this.$gettext(
          'Moving files from one space to another is not possible. Do you want to copy instead? Note: Links and shares of the original file are not copied.'
        ),
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
