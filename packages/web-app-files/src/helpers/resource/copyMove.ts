import { Resource } from 'web-client'
import { extractNameWithoutExtension } from './index'
import { join } from 'path'
import { buildResource } from '../resources'
import { DavProperties } from 'web-pkg/src/constants'

enum ResolveStrategy {
  SKIP,
  REPLACE,
  KEEP_BOTH
}
export interface ResolveConflict {
  strategy: ResolveStrategy
  doForAllConflicts: boolean
}
interface FileConflict {
  resource: Resource
  strategy?: ResolveStrategy
}

const resolveFileExists = (
  createModal,
  hideModal,
  resource,
  conflictCount,
  $gettext,
  $gettextInterpolate,
  isSingleConflict
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
      buttonSecondaryText: $gettext('Replace'),
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
  resolveFileExistsMethod
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

const hasRecursion = (resourcesToMove: Resource[], targetResource: Resource): boolean => {
  return resourcesToMove.some((resource: Resource) =>
    targetResource.webDavPath.endsWith(resource.webDavPath)
  )
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
  copy = true
) => {
  if (errors.length === 0) {
    const count = movedResources.length
    const ntitle = copy
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
    copy
      ? $gettext('Failed to copy %{count} resources')
      : $gettext('Failed to move %{count} resources'),
    { count: errors.length },
    true
  )
  if (errors.length === 1) {
    title = $gettextInterpolate(
      copy ? $gettext('Failed to copy "%{name}"') : $gettext('Failed to move "%{name}"'),
      { name: errors[0]?.resourceName },
      true
    )
  }
  showMessage({
    title,
    status: 'danger'
  })
}

export const move = (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext,
  isPublicLinkContext: boolean,
  publicLinkPassword: string | null = null
): Promise<Resource[]> => {
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
    isPublicLinkContext,
    publicLinkPassword,
    false
  )
}

export const copy = (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext,
  isPublicLinkContext: boolean,
  publicLinkPassword: string | null = null
): Promise<Resource[]> => {
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
    isPublicLinkContext,
    publicLinkPassword,
    true
  )
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

const clientListFilesInFolder = async (
  client: any,
  webDavPath: string,
  depth: number,
  isPublicLinkContext: boolean,
  publicLinkPassword: string
) => {
  if (isPublicLinkContext) {
    return client.publicFiles.list(webDavPath, publicLinkPassword, DavProperties.Default, depth)
  }
  return client.files.list(webDavPath, depth, DavProperties.Default)
}

const clientMoveFilesInFolder = async (
  client: any,
  webDavPathSource: string,
  webDavPathTarget: string,
  overwrite: boolean,
  isPublicLinkContext: boolean,
  publicLinkPassword: string
) => {
  if (isPublicLinkContext) {
    return client.publicFiles.move(
      webDavPathSource,
      webDavPathTarget,
      publicLinkPassword,
      overwrite
    )
  }
  return client.files.move(webDavPathSource, webDavPathTarget, overwrite)
}

const clientCopyFilesInFolder = async (
  client: any,
  webDavPathSource: string,
  webDavPathTarget: string,
  overwrite: boolean,
  isPublicLinkContext: boolean,
  publicLinkPassword: string
) => {
  if (isPublicLinkContext) {
    return client.publicFiles.copy(
      webDavPathSource,
      webDavPathTarget,
      publicLinkPassword,
      overwrite
    )
  }
  return client.files.copy(webDavPathSource, webDavPathTarget, overwrite)
}

const copyMoveResource = async (
  resourcesToMove,
  targetFolder,
  client,
  createModal,
  hideModal,
  showMessage,
  $gettext,
  $gettextInterpolate,
  $ngettext,
  isPublicLinkContext,
  publicLinkPassword,
  copy = false
): Promise<Resource[]> => {
  if (hasRecursion(resourcesToMove, targetFolder)) {
    showRecursionErrorMessage(resourcesToMove, showMessage, $ngettext)
    return []
  }

  const errors = []
  // if we implement MERGE, we need to use 'infinity' instead of 1
  // const targetFolderItems = await client.files.list(targetFolder.webDavPath, 1)
  const targetFolderItems = await clientListFilesInFolder(
    client,
    targetFolder.webDavPath,
    1,
    isPublicLinkContext,
    publicLinkPassword
  )
  const targetFolderResources = targetFolderItems.map((i) => buildResource(i))

  const resolvedConflicts = await resolveAllConflicts(
    resourcesToMove,
    targetFolder,
    targetFolderItems,
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
      const webDavPathTarget = join(targetFolder.webDavPath, targetName)
      if (copy) {
        await clientCopyFilesInFolder(
          client,
          resource.webDavPath,
          webDavPathTarget,
          overwriteTarget,
          isPublicLinkContext,
          publicLinkPassword
        )
      } else {
        await clientMoveFilesInFolder(
          client,
          resource.webDavPath,
          webDavPathTarget,
          overwriteTarget,
          isPublicLinkContext,
          publicLinkPassword
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
    copy
  )
  return movedResources
}
