import { mapActions, mapGetters, mapState, Store } from 'vuex'
import { isLocationTrashActive } from '../../router'
import { buildWebDavFilesTrashPath } from '../../helpers/resources'
import { buildWebDavSpacesTrashPath, SpaceResource } from 'web-client/src/helpers'
import { isProjectSpaceResource } from 'web-client/src/helpers'
import { computed, unref } from 'vue'
import {
  useCapabilityFilesPermanentDeletion,
  useCapabilityShareJailEnabled,
  useClientService,
  useRouter,
  useStore
} from 'web-pkg/src'
import { useGettext } from 'vue3-gettext'
import { Action, ActionOptions } from 'web-pkg/src/composables/actions'

export const useEmptyTrashBin = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext, $pgettext } = useGettext()
  const { owncloudSdk } = useClientService()
  const hasShareJail = useCapabilityShareJailEnabled()
  const hasPermanentDeletion = useCapabilityFilesPermanentDeletion()

  const emptyTrashBin = ({ space }: { space: SpaceResource }) => {
    const path = unref(hasShareJail)
      ? buildWebDavSpacesTrashPath(space.id)
      : buildWebDavFilesTrashPath(store.getters.user.id)

    return owncloudSdk.fileTrash
      .clearTrashBin(path)
      .then(() => {
        store.dispatch('showMessage', {
          title: $gettext('All deleted files were removed')
        })
        store.dispatch('clearTrashBin')
      })
      .catch((error) => {
        console.error(error)
        store.dispatch('showMessage', {
          title: $pgettext(
            'Error message in case clearing the trash bin fails',
            'Failed to delete all files permanently'
          ),
          status: 'danger'
        })
      })
      .finally(() => {
        store.dispatch('hideModal')
      })
  }

  const handler = ({ space }: ActionOptions) => {
    const modal = {
      variation: 'danger',
      icon: 'alarm-warning',
      title: $gettext('Empty trash bin'),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Delete'),
      message: $gettext(
        'Are you sure you want to permanently delete your items in the trash bin? You can’t undo this action.'
      ),
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => emptyTrashBin({ space })
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): Action[] => [
    {
      name: 'empty-trash-bin',
      icon: 'delete-bin-5',
      label: () => $gettext('Empty trash bin'),
      handler,
      isEnabled: ({ space, resources }: ActionOptions) => {
        if (!isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (!unref(hasPermanentDeletion)) {
          return false
        }

        if (
          isProjectSpaceResource(space) &&
          !space.isEditor(store.getters.user) &&
          !space.isManager(store.getters.user)
        ) {
          return false
        }

        // empty trash bin is not available for individual resources, but only for the trash bin as a whole
        return resources.length === 0
      },
      isDisabled: ({ resources }: ActionOptions) => resources.length === 0,
      componentType: 'button',
      class: 'oc-files-actions-empty-trash-bin-trigger',
      variation: 'danger'
    }
  ])

  return {
    actions
  }
}
export default {
  computed: {
    ...mapGetters('Files', ['activeFiles']),
    ...mapGetters(['capabilities']),
    ...mapState(['user']),
    $_emptyTrashBin_items() {
      return
    }
  },
  methods: {
    ...mapActions(['showMessage', 'createModal', 'hideModal', 'toggleModalConfirmButton']),
    ...mapActions('Files', ['clearTrashBin'])
  }
}
