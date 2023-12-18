import { Store } from 'vuex'
import { cloneStateObject } from '../../../helpers/store'
import { isSameResource } from '../../../helpers/resource'
import { Resource, SpaceResource } from '@ownclouders/web-client/src/helpers'
import PQueue from 'p-queue'
import { isLocationSpacesActive } from '../../../router'
import { dirname } from 'path'
import { createFileRouteOptions } from '../../../helpers'
import { computed, unref } from 'vue'
import { queryItemAsString } from '../../appDefaults'
import { useGetMatchingSpace } from '../../spaces'
import { useRouteQuery } from '../../router'
import { useCapabilitySpacesEnabled } from '../../capability'
import { useLoadingService } from '../../loadingService'
import { useClientService } from '../../clientService'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { useGettext } from 'vue3-gettext'
import { ref } from 'vue'
import { useModals } from '../../piniaStores'

export const useFileActionsDeleteResources = ({ store }: { store?: Store<any> }) => {
  store = store || useStore()
  const router = useRouter()
  const language = useGettext()
  const { getMatchingSpace } = useGetMatchingSpace()
  const { $gettext, $ngettext } = language
  const hasSpacesEnabled = useCapabilitySpacesEnabled()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const { owncloudSdk } = clientService
  const { registerModal } = useModals()

  const queue = new PQueue({ concurrency: 4 })
  const deleteOps = []
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
    return cloneStateObject(unref(resourcesToDelete))
  })

  const dialogTitle = computed(() => {
    const currentResources = unref(resources)
    const isFolder = currentResources[0].type === 'folder'
    let title = null

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
      { amount: currentResources.length },
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
        store.dispatch('Files/removeFilesFromTrashbin', [resource])
        const translated = $gettext(
          '"%{file}" was deleted successfully',
          { file: resource.name },
          true
        )
        store.dispatch('showMessage', {
          title: translated
        })
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
        store.dispatch('showErrorMessage', {
          title: translated,
          error
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

    const resourceSpaceMapping: Record<string, { space: SpaceResource; resources: Resource[] }> =
      unref(resources).reduce((acc, resource) => {
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

    return Object.values(resourceSpaceMapping).map(
      ({ space: spaceForDeletion, resources: resourcesForDeletion }) => {
        return loadingService.addTask(
          (loadingCallbackArgs) => {
            return store
              .dispatch('Files/deleteFiles', {
                ...language,
                space: spaceForDeletion,
                files: resourcesForDeletion,
                clientService,
                loadingCallbackArgs
              })
              .then(async () => {
                // Load quota
                if (
                  isLocationSpacesActive(router, 'files-spaces-generic') &&
                  !['public', 'share'].includes(spaceForDeletion?.driveType)
                ) {
                  if (unref(hasSpacesEnabled)) {
                    const graphClient = clientService.graphAuthenticated
                    const driveResponse = await graphClient.drives.getDrive(
                      unref(resources)[0].storageId
                    )
                    store.commit('runtime/spaces/UPDATE_SPACE_FIELD', {
                      id: driveResponse.data.id,
                      field: 'spaceQuota',
                      value: driveResponse.data.quota
                    })
                  } else {
                    const user = await owncloudSdk.users.getUser(store.getters.user.id)
                    store.commit('SET_QUOTA', user.quota)
                  }
                }

                if (
                  unref(resourcesToDelete).length &&
                  isSameResource(unref(resourcesToDelete)[0], store.getters['Files/currentFolder'])
                ) {
                  // current folder is being deleted
                  return router.push(
                    createFileRouteOptions(spaceForDeletion, {
                      path: dirname(unref(resourcesToDelete)[0].path),
                      fileId: unref(resourcesToDelete)[0].parentFolderId
                    })
                  )
                }

                const activeFilesCount = store.getters['Files/activeFiles'].length
                const pageCount = Math.ceil(unref(activeFilesCount) / unref(itemsPerPage))
                if (unref(currentPage) > 1 && unref(currentPage) > pageCount) {
                  // reset pagination to avoid empty lists (happens when deleting all items on the last page)
                  currentPageQuery.value = pageCount.toString()
                }
              })
          },
          { indeterminate: false }
        )
      }
    )
  }

  const displayDialog = (space: SpaceResource, resources: Resource[]) => {
    resourcesToDelete.value = [...resources]

    registerModal({
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
