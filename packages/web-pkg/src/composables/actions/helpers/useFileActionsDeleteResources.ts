import { cloneStateObject } from '../../../helpers/store'
import { isSameResource } from '../../../helpers/resource'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import PQueue from 'p-queue'
import { isLocationSpacesActive } from '../../../router'
import { dirname } from 'path'
import { createFileRouteOptions } from '../../../helpers'
import { computed, unref } from 'vue'
import { queryItemAsString } from '../../appDefaults'
import { useGetMatchingSpace } from '../../spaces'
import { useRouteQuery } from '../../router'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { useGettext } from 'vue3-gettext'
import { ref } from 'vue'
import {
  useMessages,
  useModals,
  useSpacesStore,
  useConfigStore,
  useSharesStore,
  useResourcesStore
} from '../../piniaStores'
import { storeToRefs } from 'pinia'
import { useDeleteWorker } from '../../webWorkers'

export const useFileActionsDeleteResources = () => {
  const configStore = useConfigStore()
  const messageStore = useMessages()
  const { showMessage, showErrorMessage } = messageStore
  const router = useRouter()
  const language = useGettext()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext, $ngettext } = language
  const clientService = useClientService()
  const { dispatchModal } = useModals()
  const spacesStore = useSpacesStore()
  const sharesStore = useSharesStore()
  const { startWorker } = useDeleteWorker()

  const resourcesStore = useResourcesStore()
  const { currentFolder } = storeToRefs(resourcesStore)

  const queue = new PQueue({
    concurrency: configStore.options.concurrentRequests.resourceBatchActions
  })
  const deleteOps: Promise<void>[] = []
  const resourcesToDelete = ref([])

  const currentPageQuery = useRouteQuery('page', '1')
  const currentPage = computed(() => {
    return parseInt(queryItemAsString(unref(currentPageQuery)))
  })

  const itemsPerPageQuery = useRouteQuery('items-per-page', '1')
  const itemsPerPage = computed(() => {
    return parseInt(queryItemAsString(unref(itemsPerPageQuery)))
  })

  const resources = computed(() => {
    return cloneStateObject<Resource[]>(unref(resourcesToDelete))
  })

  const dialogTitle = computed(() => {
    const currentResources = unref(resources)
    const isFolder = currentResources[0].type === 'folder'
    let title: string = null

    if (currentResources.length === 1) {
      if (isFolder) {
        title = $gettext(
          'Permanently delete folder %{name}',
          {
            name: currentResources[0].name
          },
          true
        )
      } else {
        title = $gettext(
          'Permanently delete file %{name}',
          {
            name: currentResources[0].name
          },
          true
        )
      }
      return title
    }

    return $ngettext(
      'Permanently delete selected resource?',
      'Permanently delete %{amount} selected resources?',
      currentResources.length,
      { amount: currentResources.length.toString() },
      false
    )
  })

  const dialogMessage = computed(() => {
    const currentResources = unref(resources)
    const isFolder = currentResources[0].type === 'folder'

    if (currentResources.length === 1) {
      if (isFolder) {
        return $gettext(
          'Are you sure you want to delete this folder? All its content will be permanently removed. This action cannot be undone.'
        )
      }
      return $gettext(
        'Are you sure you want to delete this file? All its content will be permanently removed. This action cannot be undone.'
      )
    }

    return $gettext(
      'Are you sure you want to delete all selected resources? All their content will be permanently removed. This action cannot be undone.'
    )
  })

  const trashbin_deleteOp = (space: SpaceResource, resource: Resource) => {
    return clientService.webdav
      .clearTrashBin(space, {
        id: resource.id
      })
      .then(() => {
        resourcesStore.removeResources([resource])
        resourcesStore.resetSelection()

        const translated = $gettext(
          '"%{file}" was deleted successfully',
          { file: resource.name },
          true
        )
        showMessage({ title: translated })
      })
      .catch((error) => {
        if (error.statusCode === 423) {
          // TODO: we need a may retry option ....
          const p = queue.add(() => {
            return trashbin_deleteOp(space, resource)
          })
          deleteOps.push(p)
          return
        }

        console.error(error)
        const translated = $gettext('Failed to delete "%{file}"', { file: resource.name }, true)
        showErrorMessage({
          title: translated,
          errors: [error]
        })
      })
  }

  const trashbin_delete = async (space: SpaceResource) => {
    // TODO: use clear all if all files are selected
    // FIXME: Implement proper batch delete and add loading indicator
    for (const file of unref(resources)) {
      const p = queue.add(() => {
        return trashbin_deleteOp(space, file)
      })
      deleteOps.push(p)
    }

    await Promise.all(deleteOps)
  }

  const filesList_delete = (resources: Resource[]) => {
    resourcesToDelete.value = [...resources]

    const resourceSpaceMapping = unref(resources).reduce<
      Record<string, { space: SpaceResource; resources: Resource[] }>
    >((acc, resource) => {
      if (resource.storageId in acc) {
        acc[resource.storageId].resources.push(resource)
        return acc
      }

      const matchingSpace = getMatchingSpace(resource)

      if (!(matchingSpace.id in acc)) {
        acc[matchingSpace.id] = { space: matchingSpace, resources: [] }
      }

      acc[matchingSpace.id].resources.push(resource)
      return acc
    }, {})

    const originalCurrentFolderId = unref(currentFolder).id

    return Object.values(resourceSpaceMapping).map(
      ({ space: spaceForDeletion, resources: resourcesForDeletion }) => {
        startWorker(
          { space: spaceForDeletion, resources: resourcesForDeletion },
          async ({ successful, failed }) => {
            if (successful.length) {
              const title =
                successful.length === 1 && resources.length === 1
                  ? $gettext('"%{item}" was moved to trash bin', { item: successful[0].name })
                  : $ngettext(
                      '%{itemCount} item was moved to trash bin',
                      '%{itemCount} items were moved to trash bin',
                      successful.length,
                      { itemCount: successful.length.toString() },
                      true
                    )

              messageStore.showMessage({ title })
            }

            failed.forEach(({ status, resource }) => {
              let title = $gettext('Failed to delete "%{resource}"', { resource: resource.name })
              if (status === 423) {
                title = $gettext('Failed to delete "%{resource}" - the file is locked', {
                  resource: resource.name
                })
              }

              messageStore.showErrorMessage({ title, errors: [new Error()] })
            })

            // user hasn't navigated to another location meanwhile
            if (originalCurrentFolderId === unref(currentFolder)?.id) {
              resourcesStore.removeResources(successful)

              successful.forEach(({ id }) => {
                resourcesStore.removeSelection(id)
              })

              const activeFilesCount = resourcesStore.activeResources.length
              const pageCount = Math.ceil(unref(activeFilesCount) / unref(itemsPerPage))
              if (unref(currentPage) > 1 && unref(currentPage) > pageCount) {
                // reset pagination to avoid empty lists (happens when deleting all items on the last page)
                currentPageQuery.value = pageCount.toString()
              }
            }

            // Load quota
            if (
              isLocationSpacesActive(router, 'files-spaces-generic') &&
              !['public', 'share'].includes(spaceForDeletion?.driveType)
            ) {
              const graphClient = clientService.graphAuthenticated
              const driveResponse = await graphClient.drives.getDrive(unref(resources)[0].storageId)
              spacesStore.updateSpaceField({
                id: driveResponse.data.id,
                field: 'spaceQuota',
                value: driveResponse.data.quota
              })
            }

            if (
              unref(resourcesToDelete).length &&
              isSameResource(unref(resourcesToDelete)[0], unref(currentFolder))
            ) {
              // current folder is being deleted
              return router.push(
                createFileRouteOptions(spaceForDeletion, {
                  path: dirname(unref(resourcesToDelete)[0].path),
                  fileId: unref(resourcesToDelete)[0].parentFolderId
                })
              )
            }
          }
        )
      }
    )
  }

  const displayDialog = (space: SpaceResource, resources: Resource[]) => {
    resourcesToDelete.value = [...resources]

    dispatchModal({
      variation: 'danger',
      title: unref(dialogTitle),
      message: unref(dialogMessage),
      confirmText: $gettext('Delete'),
      onConfirm: () => trashbin_delete(space)
    })
  }

  return {
    displayDialog,
    // HACK: exported for unit tests:
    filesList_delete
  }
}
