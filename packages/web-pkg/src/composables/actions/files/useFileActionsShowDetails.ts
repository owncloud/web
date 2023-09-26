import { Store } from 'vuex'
import { isLocationTrashActive } from '../../../router'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useRouter, useStore, useIsFilesAppActive } from 'web-pkg/src/composables'
import { FileAction } from 'web-pkg/src/composables/actions/types'

export const useFileActionsShowDetails = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()

  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()

  const actions = computed((): FileAction[] => [
    {
      name: 'show-details',
      icon: 'information',
      componentType: 'button',
      class: 'oc-files-actions-show-details-trigger',
      label: () => $gettext('Details'),
      // we don't have details in the trashbin, yet.
      // remove trashbin route rule once we have them.
      isEnabled: ({ resources }) => {
        // sidebar is currently only available inside files app
        if (!unref(isFilesAppActive)) {
          return false
        }

        if (isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        return resources.length > 0
      },
      handler({ resources }) {
        store.commit('Files/SET_FILE_SELECTION', resources)
        eventBus.publish(SideBarEventTopics.open)
      }
    }
  ])

  return {
    actions
  }
}
