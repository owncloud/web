import { Resource } from './index'
import { join } from 'path'
import { buildResource } from '../resources'

export enum ResolveStrategy {
  SKIP,
  REPLACE,
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

export const resolveFileExists = (
  createModal,
  hideModal,
  resource,
  conflictCount,
  $gettext,
  $gettextInterpolate,
  isSingleConflict
) => {
  return new Promise<ResolveConflict>((resolve) => {
    let doForAllConflicts = false
    const modal = {
      variation: 'danger',
      title: $gettext('File already exists'),
      message: $gettextInterpolate(
        $gettext('Resource with name %{name} already exists.'),
        { name: resource.name },
        true
      ),
      cancelText: $gettext('Skip'),
      confirmText: $gettext('Keep both'),
      buttonSecondaryText: $gettext('Replace'),
      checkboxLabel: isSingleConflict
        ? ''
        : $gettextInterpolate(
            $gettext('Do this for all %{count} conflicts'),
            { count: conflictCount },
            true
          ),
      onCheckboxValueChanged: (value) => {
        doForAllConflicts = value
      },
      onCancel: () => {
        hideModal()
        resolve({ strategy: ResolveStrategy.SKIP, doForAllConflicts } as ResolveConflict)
      },
      onConfirmSecondary: () => {
        hideModal()
        const strategy = ResolveStrategy.REPLACE
        resolve({ strategy, doForAllConflicts } as ResolveConflict)
      },
      onConfirm: () => {
        hideModal()
        resolve({ strategy: ResolveStrategy.KEEP_BOTH, doForAllConflicts } as ResolveConflict)
      }
    }
    createModal(modal)
  })
}

export const resolveAllConflicts = async (
  resourcesToMove,
  targetFolder,
  targetFolderItems,
  createModal,
  hideModal,
  $gettext,
  $gettextInterpolate,
  resolveFileExistsMethod,
  copy = false
) => {
  const targetPath = targetFolder.path
  const index = targetFolder.webDavPath.lastIndexOf(targetPath)
  const webDavPrefix =
    targetPath === '/' ? targetFolder.webDavPath : targetFolder.webDavPath.substring(0, index)

  // Collect all conflicting resources
  const allConflicts = []
  for (const resource of resourcesToMove) {
    const potentialTargetWebDavPath = join(webDavPrefix, targetFolder.path, resource.name)
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
    const result: ResolveConflict = await resolveFileExistsMethod(
      createModal,
      hideModal,
      conflict.resource,
      conflictsLeft,
      $gettext,
      $gettextInterpolate,
      allConflicts.length === 1
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
export const showResultMessage = async (
  errors,
  movedResources,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext
) => {
  if (errors.length === 0) {
    const count = movedResources.length
    const ntitle = $ngettext(
      '%{count} item was moved successfully',
      '%{count} items were moved successfully',
      count
    )
    const title = $gettextInterpolate(ntitle, { count }, true)
    showMessage({
      title,
      status: 'success'
    })
    return
  }
  let title = $gettextInterpolate(
    $gettext('Failed to move %{count} resources'),
    { count: errors.length },
    true
  )
  if (errors.length === 1) {
    title = $gettextInterpolate(
      $gettext('Failed to move "%{name}"'),
      { name: errors[0]?.resourceName },
      true
    )
  }
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
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext
) => {
  return copyMoveResource(
    resourcesToMove,
    targetFolder,
    client,
    createModal,
    hideModal,
    showMessage,
    $gettext,
    $gettextInterpolate,
    $ngettext,
    false
  )
}
export const copy = async (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext
) => {
  return copyMoveResource(
    resourcesToMove,
    targetFolder,
    client,
    createModal,
    hideModal,
    showMessage,
    $gettext,
    $gettextInterpolate,
    $ngettext,
    true
  )
}

export const resolveFileNameDuplicate = (name, existingFiles, iteration = 1) => {
  const potentialName = `${name} (${iteration})`
  const hasConflict = existingFiles.some((f) => f.name === potentialName)
  if (!hasConflict) return potentialName
  return resolveFileNameDuplicate(name, existingFiles, iteration + 1)
}

export const copyMoveResource = async (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext,
  copy = false
) => {
  const errors = []
  // if we implement MERGE, we need to use 'infinity' instead of 1
  const targetFolderItems = await client.files.list(targetFolder.webDavPath, 1)
  const targetFolderResources = targetFolderItems.map((i) => buildResource(i))
  const resolvedConflicts = await resolveAllConflicts(
    resourcesToMove,
    targetFolder,
    targetFolderItems,
    createModal,
    hideModal,
    $gettext,
    $gettextInterpolate,
    resolveFileExists,
    copy
  )
  const movedResources = []

  for (let resource of resourcesToMove) {
    // because javascripts way of cloning is awesome
    resource = JSON.parse(JSON.stringify(resource))
    const hasConflict = resolvedConflicts.some((e) => e.resource.id === resource.id)
    let targetName = resource.name
    let overwriteTarget = false
    if (hasConflict) {
      const resolveStrategy = resolvedConflicts.find((e) => e.resource.id === resource.id)?.strategy
      if (resolveStrategy === ResolveStrategy.SKIP) {
        continue
      }
      if (resolveStrategy === ResolveStrategy.REPLACE) {
        overwriteTarget = true
      }
      if (resolveStrategy === ResolveStrategy.KEEP_BOTH) {
        targetName = resolveFileNameDuplicate(resource.name, [
          ...movedResources,
          ...targetFolderResources
        ])
        resource.name = targetName
      }
    }
    resource.path = join(targetFolder.path, resource.name)
    try {
      if (copy) {
        await client.files.copy(
          resource.webDavPath,
          join(targetFolder.webDavPath, targetName),
          overwriteTarget
        )
      } else {
        await client.files.move(
          resource.webDavPath,
          join(targetFolder.webDavPath, targetName),
          overwriteTarget
        )
      }
      resource.webDavPath = join(targetFolder.webDavPath, resource.name)
      movedResources.push(resource)
    } catch (error) {
      console.error(error)
      error.resourceName = resource.name
      errors.push(error)
    }
  }
  showResultMessage(errors, movedResources, showMessage, $gettext, $gettextInterpolate, $ngettext)
  return movedResources
}
