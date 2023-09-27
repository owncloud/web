import { Store } from 'vuex'
import { isLocationTrashActive } from '../../../router'
import {
  buildWebDavSpacesTrashPath,
  SpaceResource,
  isProjectSpaceResource,
  buildWebDavFilesTrashPath
} from 'web-client/src/helpers'
import { computed, unref } from 'vue'
import {
  useCapabilityFilesPermanentDeletion,
  useCapabilityShareJailEnabled,
  useClientService,
  useLoadingService,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'

export const useFileActionsEmptyTrashBin = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext, $pgettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()
  const hasShareJail = useCapabilityShareJailEnabled()
  const hasPermanentDeletion = useCapabilityFilesPermanentDeletion()

  const emptyTrashBin = ({ space }: { space: SpaceResource }) => {
    const path = unref(hasShareJail)
      ? buildWebDavSpacesTrashPath(space.id)
      : buildWebDavFilesTrashPath(store.getters.user.id)

    return clientService.owncloudSdk.fileTrash
      .clearTrashBin(path)
      .then(() => {
        store.dispatch('showMessage', {
          title: $gettext('All deleted files were removed')
        })
        store.dispatch('Files/clearTrashBin')
      })
      .catch((error) => {
        console.error(error)
        store.dispatch('showErrorMessage', {
          title: $pgettext(
            'Error message in case emptying trash bin fails',
            'Failed to empty trash bin'
          ),
          error
        })
      })
      .finally(() => {
        store.dispatch('hideModal')
      })
  }

  const handler = ({ space }: FileActionOptions) => {
    const modal = {
      variation: 'danger',
      title: $gettext('Empty trash bin'),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Delete'),
      message: $gettext(
        'Are you sure you want to permanently delete the listed items? You can’t undo this action.'
      ),
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => loadingService.addTask(() => emptyTrashBin({ space }))
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'empty-trash-bin',
      icon: 'delete-bin-5',
      label: () => $gettext('Empty trash bin'),
      handler,
      isEnabled: ({ space, resources }) => {
        if (!isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (!unref(hasPermanentDeletion)) {
          return false
        }

        if (
          isProjectSpaceResource(space) &&
          !space.canRemoveFromTrashbin({ user: store.getters.user })
        ) {
          return false
        }

        return true
      },
      isDisabled: () => {
        return store.getters['Files/activeFiles'].length === 0
      },
      componentType: 'button',
      class: 'oc-files-actions-empty-trash-bin-trigger',
      variation: 'danger',
      appearance: 'filled'
    }
  ])

  return {
    actions,
    // HACK: exported for unit tests:
    emptyTrashBin
  }
}
