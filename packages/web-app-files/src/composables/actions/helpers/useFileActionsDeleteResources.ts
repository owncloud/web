import { Store } from 'vuex'
import { cloneStateObject } from '../../../helpers/store'
import { isSameResource } from '../../../helpers/resource'
import { buildWebDavFilesTrashPath } from '../../../helpers/resources'
import { buildWebDavSpacesTrashPath, Resource, SpaceResource } from 'web-client/src/helpers'
import PQueue from 'p-queue'
import { isLocationTrashActive, isLocationSpacesActive } from '../../../router'
import { dirname } from 'path'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { computed, unref } from 'vue'
import {
  useCapabilitySpacesEnabled,
  useCapabilityShareJailEnabled,
  useClientService,
  useRouter,
  useStore,
  useLoadingService
} from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { ref } from 'vue'

export const useFileActionsDeleteResources = ({ store }: { store?: Store<any> }) => {
  store = store || useStore()
  const router = useRouter()
  const language = useGettext()
  const { $gettext, $ngettext, interpolate: $gettextInterpolate } = language
  const hasShareJail = useCapabilityShareJailEnabled()
  const hasSpacesEnabled = useCapabilitySpacesEnabled()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const { owncloudSdk } = clientService

  const queue = new PQueue({ concurrency: 4 })
  const deleteOps = []
  const resourcesToDelete = ref([])

  const isInTrashbin = computed(() => {
    return isLocationTrashActive(router, 'files-trash-generic')
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
        title = unref(isInTrashbin)
          ? $gettext('Permanently delete folder %{name}')
          : $gettext('Delete folder %{name}')
      } else {
        title = unref(isInTrashbin)
          ? $gettext('Permanently delete file %{name}')
          : $gettext('Delete file %{name}')
      }
      return $gettextInterpolate(
        title,
        {
          name: currentResources[0].name
        },
        true
      )
    }

    title = unref(isInTrashbin)
      ? $ngettext(
          'Permanently delete selected resource?',
          'Permanently delete %{amount} selected resources?',
          currentResources.length
        )
      : $ngettext(
          'Delete selected resource?',
          'Delete %{amount} selected resources?',
          currentResources.length
        )

    return $gettextInterpolate(title, { amount: currentResources.length }, false)
  })

  const dialogMessage = computed(() => {
    const currentResources = unref(resources)
    const isFolder = currentResources[0].type === 'folder'

    if (currentResources.length === 1) {
      if (isFolder) {
        return unref(isInTrashbin)
          ? $gettext(
              'Are you sure you want to delete this folder? All its content will be permanently removed. This action cannot be undone.'
            )
          : $gettext('Are you sure you want to delete this folder?')
      }
      return unref(isInTrashbin)
        ? $gettext(
            'Are you sure you want to delete this file? All its content will be permanently removed. This action cannot be undone.'
          )
        : $gettext('Are you sure you want to delete this file?')
    }

    return unref(isInTrashbin)
      ? $gettext(
          'Are you sure you want to delete all selected resources? All their content will be permanently removed. This action cannot be undone.'
        )
      : $gettext('Are you sure you want to delete all selected resources?')
  })

  const trashbin_deleteOp = (space, resource) => {
    const path = unref(hasShareJail)
      ? buildWebDavSpacesTrashPath(space.id)
      : buildWebDavFilesTrashPath(store.getters.user.id)

    return owncloudSdk.fileTrash
      .clearTrashBin(path, resource.id)
      .then(() => {
        store.dispatch('Files/removeFilesFromTrashbin', [resource])
        const translated = $gettext('"%{file}" was deleted successfully')
        store.dispatch('showMessage', {
          title: $gettextInterpolate(translated, { file: resource.name }, true)
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
        const translated = $gettext('Failed to delete "%{file}"')
        store.dispatch('showMessage', {
          title: $gettextInterpolate(translated, { file: resource.name }, true),
          status: 'danger'
        })
      })
  }

  const trashbin_delete = (space: SpaceResource) => {
    // TODO: use clear all if all files are selected
    store.dispatch('toggleModalConfirmButton')
    // FIXME: Implement proper batch delete and add loading indicator
    for (const file of unref(resources)) {
      const p = queue.add(() => {
        return trashbin_deleteOp(space, file)
      })
      deleteOps.push(p)
    }

    Promise.all(deleteOps).then(() => {
      store.dispatch('hideModal')
      store.dispatch('toggleModalConfirmButton')
    })
  }

  const filesList_delete = (space: SpaceResource) => {
    return loadingService.addTask(
      (loadingCallbackArgs) => {
        return store
          .dispatch('Files/deleteFiles', {
            ...language,
            space,
            files: unref(resources),
            clientService,
            loadingCallbackArgs
          })
          .then(async () => {
            store.dispatch('hideModal')
            store.dispatch('toggleModalConfirmButton')

            // Load quota
            if (
              isLocationSpacesActive(router, 'files-spaces-generic') &&
              !['public', 'share'].includes(space?.driveType)
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
              return router.push(
                createFileRouteOptions(space, {
                  path: dirname(unref(resourcesToDelete)[0].path),
                  fileId: unref(resourcesToDelete)[0].parentFolderId
                })
              )
            }
          })
      },
      { indeterminate: false }
    )
  }

  const deleteHelper = (space: SpaceResource) => {
    store.dispatch('toggleModalConfirmButton')

    unref(isInTrashbin) ? trashbin_delete(space) : filesList_delete(space)
  }

  const displayDialog = (space: SpaceResource, resources: Resource[]) => {
    resourcesToDelete.value = [...resources]

    const modal = {
      variation: 'danger',
      title: unref(dialogTitle),
      message: unref(dialogMessage),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Delete'),
      onCancel: () => {
        store.dispatch('hideModal')
      },
      onConfirm: () => {
        deleteHelper(space)
      }
    }

    store.dispatch('createModal', modal)
  }

  return {
    displayDialog,
    // HACK: exported for unit tests:
    filesList_delete
  }
}
