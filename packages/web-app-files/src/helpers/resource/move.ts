import { Resource } from './index'
import { join } from 'path'

export enum ResolveStrategy {
  CANCEL,
  REPLACE,
  MERGE,
  KEEP_BOTH
}
export interface ResolveConflict {
  strategy: ResolveStrategy
  doForAllConflicts: boolean
}
export interface FileConflict {
  resource: Resource
  strategy?: ResolveStrategy
}

const resolveFileExists = (createModal, hideModal, resourceName, conflictCount) => {
  return new Promise<ResolveConflict>((resolve) => {
    let doForAllConflicts = false
    const modal = {
      variation: 'danger',
      title: 'File already exists',
      message: `Resource with name ${resourceName} already exists.`,
      cancelText: 'Cancel',
      confirmText: 'Replace',
      checkbox: true,
      checkboxLabel: `Do this for all ${conflictCount} conflicts`,
      onCheckboxValueChanged: (value) => {
        doForAllConflicts = value
      },
      onCancel: () => {
        hideModal()
        resolve({ strategy: ResolveStrategy.CANCEL, doForAllConflicts } as ResolveConflict)
      },
      onConfirm: () => {
        hideModal()
        resolve({ strategy: ResolveStrategy.REPLACE, doForAllConflicts } as ResolveConflict)
      }
    }
    createModal(modal)
  })
}
const resolveAllConflicts = async (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal
) => {
  const targetFolderItems = await client.files.list(targetFolder.webDavPath, 50)
  const targetPath = targetFolder.path
  const index = targetFolder.webDavPath.lastIndexOf(targetPath)
  const webDavPrefix = targetFolder.webDavPath.substring(0, index)

  // Collect all conflicting resources
  const allConflicts = []
  for (const resource of resourcesToMove) {
    const potentialTargetWebDavPath = join(webDavPrefix, targetFolder.path, resource.path)
    const exists = targetFolderItems.some((e) => e.name === potentialTargetWebDavPath)
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
    const result: ResolveConflict = await resolveFileExists(
      createModal,
      hideModal,
      conflict.resource.name,
      conflictsLeft
    )
    conflict.strategy = result.strategy
    resolvedConflicts.push(conflict)
    count += 1

    // User checked 'do for all x conflicts'
    if (!result.doForAllConflicts) continue
    doForAllConflicts = true
    doForAllConflictsStrategy = result.strategy
  }
  return resolvedConflicts
}
const showResultMessage = async(errors, movedResources, showMessage) => {
  if (errors.length === 0) {
    const count = movedResources.length
    const title = `${count} item was moved successfully`
    showMessage({
      title,
      status: 'success'
    })
    return 
  }

  if (errors.length === 1) {
    const title = `Failed to move "${errors[0]?.resourceName}`
    showMessage({
      title,
      status: 'danger'
    })
    return
  }

  const title = `Failed to move ${errors.length} resources`
  showMessage({
    title,
    status: 'danger'
  })
}
export const move = async (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal,
  showMessage
) => {
  const errors = []
  const resolvedConflicts = await resolveAllConflicts(
    resourcesToMove,
    targetFolder,
    client,
    createModal,
    hideModal
  )
  const movedResources = []

  for (const resource of resourcesToMove) {
    const hasConflict = resolvedConflicts.some((e) => e.resource.id === resource.id)
    if (hasConflict) {
      const resolveStrategy = resolvedConflicts.find((e) => e.resource.id === resource.id)?.strategy
      if (resolveStrategy === ResolveStrategy.CANCEL) {
        continue
      }
      if (resolveStrategy === ResolveStrategy.REPLACE) {
        await client.files.delete(join(targetFolder.webDavPath, resource.name))
      }
    }
    try {
      await client.files.move(resource.webDavPath, join(targetFolder.webDavPath, resource.name))
      movedResources.push(resource)
    } catch (error) {
      console.error(error)
      error.resourceName = resource.name
      errors.push(error)
    }
  }
  showResultMessage(errors, movedResources, showMessage)
  return movedResources
}
