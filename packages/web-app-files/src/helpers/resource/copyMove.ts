import { Resource } from 'web-client'
import { extractNameWithoutExtension } from './index'
import { dirname, join } from 'path'
import { SpaceResource } from 'web-client/src/helpers'
import { ClientService } from 'web-pkg/src/services'
import { ClipboardActions } from '../clipboardActions'
import path from 'path/win32'

export enum ResolveStrategy {
  SKIP,
  REPLACE,
  KEEP_BOTH,
  MERGE
}
export interface ResolveConflict {
  strategy: ResolveStrategy
  doForAllConflicts: boolean
}
interface FileConflict {
  resource: Resource
  strategy?: ResolveStrategy
}

export interface FileExistsResolver {
  (
    createModal: void,
    hideModal: void,
    resource: Resource,
    conflictCount: number,
    $gettext: void,
    $gettextInterpolate: void,
    isSingleConflict: boolean,
    suggestMerge: boolean
  )
}

export const resolveDoCopyInsteadOfMoveForSpaces = (
  createModal,
  hideModal,
  $gettext
): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    const modal = {
      variation: 'danger',
      icon: 'alarm-warning',
      title: $gettext('Move not possible'),
      message: $gettext(
        'Moving files from one space to another is not possible. Do you want to copy instead?'
      ),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Copy here'),
      contextualHelperLabel: 'Note: Links and shares of the original file are not copied.',
      contextualHelperData: { title: 'test' },
      onCancel: () => {
        hideModal()
        resolve(false)
      },
      onConfirm: () => {
        hideModal()
        resolve(true)
      }
    }
    createModal(modal)
  })
}

export const resolveFileExists = (
  createModal,
  hideModal,
  resource,
  conflictCount,
  $gettext,
  $gettextInterpolate,
  isSingleConflict,
  suggestMerge = false
): Promise<ResolveConflict> => {
  return new Promise<ResolveConflict>((resolve) => {
    let doForAllConflicts = false
    const modal = {
      variation: 'danger',
      icon: 'alarm-warning',
      title: $gettext('File already exists'),
      message: $gettextInterpolate(
        resource.isFolder
          ? $gettext('Folder with name %{name} already exists.')
          : $gettext('File with name %{name} already exists.'),
        { name: resource.name },
        true
      ),
      cancelText: $gettext('Skip'),
      confirmText: $gettext('Keep both'),
      buttonSecondaryText: suggestMerge ? $gettext('Merge') : $gettext('Replace'),
      checkboxLabel: isSingleConflict
        ? ''
        : $gettextInterpolate(
            $gettext('Apply to all %{count} conflicts'),
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
        const strategy = suggestMerge ? ResolveStrategy.MERGE : ResolveStrategy.REPLACE
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
  resourcesToMove: Resource[],
  targetSpace: SpaceResource,
  targetFolder: Resource,
  targetFolderResources: Resource[],
  createModal,
  hideModal,
  $gettext,
  $gettextInterpolate,
  resolveFileExistsMethod
) => {
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
    const result: ResolveConflict = await resolveFileExistsMethod(
      createModal,
      hideModal,
      conflict.resource,
      conflictsLeft,
      $gettext,
      $gettextInterpolate,
      conflictsLeft === 1
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

const hasRecursion = (
  sourceSpace: SpaceResource,
  resourcesToMove: Resource[],
  targetSpace: SpaceResource,
  targetResource: Resource
): boolean => {
  if (sourceSpace.id !== targetSpace.id) {
    return false
  }
  return resourcesToMove.some((resource: Resource) => targetResource.path === resource.path)
}

const showRecursionErrorMessage = (movedResources, showMessage, $ngettext) => {
  const count = movedResources.length
  const title = $ngettext(
    "You can't paste the selected file at this location because you can't paste an item into itself.",
    "You can't paste the selected files at this location because you can't paste an item into itself.",
    count
  )
  showMessage({ title, status: 'danger' })
}

const showResultMessage = (
  errors,
  movedResources,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext,
  clipboardAction: 'cut' | 'copy'
) => {
  if (errors.length === 0) {
    const count = movedResources.length
    const ntitle =
      clipboardAction === ClipboardActions.Copy
        ? $ngettext(
            '%{count} item was copied successfully',
            '%{count} items were copied successfully',
            count
          )
        : $ngettext(
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
    clipboardAction === ClipboardActions.Copy
      ? $gettext('Failed to copy %{count} resources')
      : $gettext('Failed to move %{count} resources'),
    { count: errors.length },
    true
  )
  if (errors.length === 1) {
    title = $gettextInterpolate(
      clipboardAction === ClipboardActions.Copy
        ? $gettext('Failed to copy "%{name}"')
        : $gettext('Failed to move "%{name}"'),
      { name: errors[0]?.resourceName },
      true
    )
  }
  showMessage({
    title,
    status: 'danger'
  })
}

export const resolveFileNameDuplicate = (name, extension, existingFiles, iteration = 1) => {
  let potentialName
  if (extension.length === 0) {
    potentialName = `${name} (${iteration})`
  } else {
    const nameWithoutExtension = extractNameWithoutExtension({ name, extension } as Resource)
    potentialName = `${nameWithoutExtension} (${iteration}).${extension}`
  }
  const hasConflict = existingFiles.some((f) => f.name === potentialName)
  if (!hasConflict) return potentialName
  return resolveFileNameDuplicate(name, extension, existingFiles, iteration + 1)
}


const isResourceBeeingMovedToSameLocation = (sourceSpace: SpaceResource, resource: Resource, targetSpace: SpaceResource, targetFolder: Resource) => {
  return sourceSpace.id === targetSpace.id && dirname(resource.path) === targetFolder.path
}

export const copyMoveResource = async (
  sourceSpace: SpaceResource,
  resourcesToMove: Resource[],
  targetSpace: SpaceResource,
  targetFolder: Resource,
  clientService: ClientService,
  createModal,
  hideModal,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext,
  clipboardAction: 'cut' | 'copy'
): Promise<Resource[]> => {
  if (hasRecursion(sourceSpace, resourcesToMove, targetSpace, targetFolder)) {
    showRecursionErrorMessage(resourcesToMove, showMessage, $ngettext)
    return []
  }
  if (sourceSpace.id != targetSpace.id && clipboardAction === ClipboardActions.Cut) {
    const doCopyInsteadOfMove = await resolveDoCopyInsteadOfMoveForSpaces(
      createModal,
      hideModal,
      $gettext
    )
    if (!doCopyInsteadOfMove) return []
    clipboardAction = ClipboardActions.Copy
  }

  const errors = []
  const targetFolderResources = await clientService.webdav.listFiles(targetSpace, targetFolder)

  const resolvedConflicts = await resolveAllConflicts(
    resourcesToMove,
    targetSpace,
    targetFolder,
    targetFolderResources,
    createModal,
    hideModal,
    $gettext,
    $gettextInterpolate,
    resolveFileExists
  )
  const movedResources: Resource[] = []

  for (let resource of resourcesToMove) {
    // shallow copy of resources to prevent modifing existing rows
    resource = { ...resource }
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
        targetName = resolveFileNameDuplicate(resource.name, resource.extension, [
          ...movedResources,
          ...targetFolderResources
        ])
        resource.name = targetName
      }
    }
    try {
      if (isResourceBeeingMovedToSameLocation(sourceSpace, resource, targetSpace, targetFolder) && overwriteTarget) continue
      if (clipboardAction === ClipboardActions.Copy) {
        await clientService.webdav.copyFiles(
          sourceSpace,
          resource,
          targetSpace,
          { path: join(targetFolder.path, targetName) },
          { overwrite: overwriteTarget }
        )
      } else if (clipboardAction === ClipboardActions.Cut) {
        await clientService.webdav.moveFiles(
          sourceSpace,
          resource,
          targetSpace,
          { path: join(targetFolder.path, targetName) },
          { overwrite: overwriteTarget }
        )
      }
      resource.path = join(targetFolder.path, resource.name)
      resource.webDavPath = join(targetFolder.webDavPath, resource.name)
      movedResources.push(resource)
    } catch (error) {
      console.error(error)
      error.resourceName = resource.name
      errors.push(error)
    }
  }
  showResultMessage(
    errors,
    movedResources,
    showMessage,
    $gettext,
    $gettextInterpolate,
    $ngettext,
    clipboardAction
  )
  return movedResources
}
