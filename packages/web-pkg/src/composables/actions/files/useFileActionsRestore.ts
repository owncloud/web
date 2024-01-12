import { Store } from 'vuex'
import { dirname } from 'path'
import { isLocationTrashActive } from '../../../router'

import {
  Resource,
  isProjectSpaceResource,
  extractExtensionFromFile,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import {
  ResolveStrategy,
  ResolveConflict,
  resolveFileNameDuplicate,
  ConflictDialog
} from '../../../helpers/resource'
import { urlJoin } from '@ownclouders/web-client/src/utils'
import { useCapabilitySpacesEnabled } from '../../capability'
import { useClientService } from '../../clientService'
import { useLoadingService } from '../../loadingService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from '../types'
import { LoadingTaskCallbackArguments } from '../../../services'
import { useMessages, useSpacesStore, useUserStore } from '../../piniaStores'

export const useFileActionsRestore = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { showMessage, showErrorMessage } = useMessages()
  const userStore = useUserStore()
  const router = useRouter()
  const { $gettext, $ngettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const spacesStore = useSpacesStore()

  const hasSpacesEnabled = useCapabilitySpacesEnabled()

  const collectConflicts = async (space: SpaceResource, sortedResources: Resource[]) => {
    const existingResourcesCache = {}
    const conflicts: Resource[] = []
    const resolvedResources: Resource[] = []
    const missingFolderPaths: string[] = []
    for (const resource of sortedResources) {
      const parentPath = dirname(resource.path)

      let existingResources: Resource[] = []
      if (parentPath in existingResourcesCache) {
        existingResources = existingResourcesCache[parentPath]
      } else {
        try {
          existingResources = (
            await clientService.webdav.listFiles(space, {
              path: parentPath
            })
          ).children
        } catch (error) {
          missingFolderPaths.push(parentPath)
        }
        existingResourcesCache[parentPath] = existingResources
      }
      // Check for naming conflict in parent folder and between resources batch
      const hasConflict =
        existingResources.some((r) => r.name === resource.name) ||
        resolvedResources.filter((r) => r.id !== resource.id).some((r) => r.path === resource.path)
      if (hasConflict) {
        conflicts.push(resource)
      } else {
        resolvedResources.push(resource)
      }
    }
    return {
      existingResourcesByPath: existingResourcesCache,
      conflicts,
      resolvedResources,
      missingFolderPaths: missingFolderPaths.filter((path) => !existingResourcesCache[path]?.length)
    }
  }

  const collectResolveStrategies = async (conflicts: Resource[]) => {
    let count = 0
    const resolvedConflicts = []
    const allConflictsCount = conflicts.length
    let doForAllConflicts = false
    let allConflictsStrategy
    for (const conflict of conflicts) {
      const isFolder = conflict.type === 'folder'
      if (doForAllConflicts) {
        resolvedConflicts.push({
          resource: conflict,
          strategy: allConflictsStrategy
        })
        continue
      }
      const remainingConflictCount = allConflictsCount - count
      const conflictDialog = new ConflictDialog($gettext, $ngettext)
      const resolvedConflict: ResolveConflict = await conflictDialog.resolveFileExists(
        { name: conflict.name, isFolder } as Resource,
        remainingConflictCount,
        false
      )
      count++
      if (resolvedConflict.doForAllConflicts) {
        doForAllConflicts = true
        allConflictsStrategy = resolvedConflict.strategy
      }
      resolvedConflicts.push({
        resource: conflict,
        strategy: resolvedConflict.strategy
      })
    }
    return resolvedConflicts
  }

  const createFolderStructure = async (
    space: SpaceResource,
    path: string,
    existingPaths: string[]
  ) => {
    const { webdav } = clientService

    const pathSegments = path.split('/').filter(Boolean)
    let parentPath = ''
    for (const subFolder of pathSegments) {
      const folderPath = urlJoin(parentPath, subFolder)
      if (existingPaths.includes(folderPath)) {
        parentPath = urlJoin(parentPath, subFolder)
        continue
      }

      try {
        await webdav.createFolder(space, { path: folderPath })
      } catch (ignored) {}

      existingPaths.push(folderPath)
      parentPath = folderPath
    }

    return {
      existingPaths
    }
  }

  const restoreResources = async (
    space: SpaceResource,
    resources: Resource[],
    missingFolderPaths: string[],
    { setProgress }: LoadingTaskCallbackArguments
  ) => {
    const restoredResources = []
    const failedResources = []
    const errors = []

    let createdFolderPaths = []
    for (const [i, resource] of resources.entries()) {
      const parentPath = dirname(resource.path)
      if (missingFolderPaths.includes(parentPath)) {
        const { existingPaths } = await createFolderStructure(space, parentPath, createdFolderPaths)
        createdFolderPaths = existingPaths
      }

      try {
        await clientService.webdav.restoreFile(space, resource, resource, {
          overwrite: true
        })
        restoredResources.push(resource)
      } catch (e) {
        console.error(e)
        errors.push(e)
        failedResources.push(resource)
      } finally {
        setProgress({ total: resources.length, current: i + 1 })
      }
    }

    // success handler (for partial and full success)
    if (restoredResources.length) {
      store.dispatch('Files/removeFilesFromTrashbin', restoredResources)
      let title
      if (restoredResources.length === 1) {
        title = $gettext('%{resource} was restored successfully', {
          resource: restoredResources[0].name
        })
      } else {
        title = $gettext('%{resourceCount} files restored successfully', {
          resourceCount: restoredResources.length.toString()
        })
      }
      showMessage({ title })
    }

    // failure handler (for partial and full failure)
    if (failedResources.length) {
      let translated
      const translateParams: any = {}
      if (failedResources.length === 1) {
        translateParams.resource = failedResources[0].name
        translated = $gettext('Failed to restore "%{resource}"', translateParams, true)
      } else {
        translateParams.resourceCount = failedResources.length
        translated = $gettext('Failed to restore %{resourceCount} files', translateParams, true)
      }
      showErrorMessage({ title: translated, errors })
    }

    // Reload quota
    if (unref(hasSpacesEnabled)) {
      const graphClient = clientService.graphAuthenticated
      const driveResponse = await graphClient.drives.getDrive(space.id as string)
      spacesStore.updateSpaceField({
        id: driveResponse.data.id,
        field: 'spaceQuota',
        value: driveResponse.data.quota
      })
    }
  }

  const handler = async ({ space, resources }: FileActionOptions) => {
    // resources need to be sorted by path ASC to recover the parents first in case of deep nested folder structure
    const sortedResources = resources.sort((a, b) => a.path.length - b.path.length)

    // collect and request existing files in associated parent folders of each resource
    const { existingResourcesByPath, conflicts, resolvedResources, missingFolderPaths } =
      await collectConflicts(space, sortedResources)

    // iterate through conflicts and collect resolve strategies
    const resolvedConflicts = await collectResolveStrategies(conflicts)

    // iterate through conflicts and behave according to strategy
    const filesToOverwrite = resolvedConflicts
      .filter((e) => e.strategy === ResolveStrategy.REPLACE)
      .map((e) => e.resource)
    resolvedResources.push(...filesToOverwrite)
    const filesToKeepBoth = resolvedConflicts
      .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
      .map((e) => e.resource)

    for (let resource of filesToKeepBoth) {
      resource = { ...resource }
      const parentPath = dirname(resource.path)
      const existingResources = existingResourcesByPath[parentPath] || []
      const extension = extractExtensionFromFile(resource)
      const resolvedName = resolveFileNameDuplicate(resource.name, extension, [
        ...existingResources,
        ...resolvedConflicts.map((e) => e.resource),
        ...resolvedResources
      ])
      resource.name = resolvedName
      resource.path = urlJoin(parentPath, resolvedName)
      resolvedResources.push(resource)
    }
    return loadingService.addTask(
      ({ setProgress }) => {
        return restoreResources(space, resolvedResources, missingFolderPaths, { setProgress })
      },
      { indeterminate: false }
    )
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'restore',
      icon: 'arrow-go-back',
      label: () => $gettext('Restore'),
      handler,
      isEnabled: ({ space, resources }) => {
        if (!isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (!resources.every((r) => r.canBeRestored())) {
          return false
        }

        if (
          isProjectSpaceResource(space) &&
          !space.isEditor(userStore.user) &&
          !space.isManager(userStore.user)
        ) {
          return false
        }

        return resources.length > 0
      },
      componentType: 'button',
      class: 'oc-files-actions-restore-trigger'
    }
  ])

  return {
    actions,
    // HACK: exported for unit tests:
    restoreResources
  }
}
