import { Store } from 'vuex'
import { eventBus } from '../../../services'
import { useCapabilityFilesTags } from '../../capability'
import { useIsFilesAppActive } from '../helpers'
import { useRouter } from '../../router'
import { useStore } from '../../store'
import { isLocationTrashActive, isLocationPublicActive } from '../../../router'
import { SideBarEventTopics } from '../../sideBar'
import { computed, unref } from 'vue'
import { FileAction, FileActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'

export const useFileActionsShowEditTags = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()
  const hasTags = useCapabilityFilesTags()

  const handler = ({ resources }: FileActionOptions) => {
    store.commit('Files/SET_FILE_SELECTION', resources)
    eventBus.publish(SideBarEventTopics.openWithPanel, 'tags')
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'show-edit-tags',
      icon: 'price-tag-3',
      label: () => $gettext('Add or edit tags'),
      handler,
      isEnabled: ({ resources }) => {
        // sidebar is currently only available inside files app
        if (!unref(isFilesAppActive) || !unref(hasTags)) {
          return false
        }

        if (
          isLocationTrashActive(router, 'files-trash-generic') ||
          isLocationPublicActive(router, 'files-public-link')
        ) {
          return false
        }
        return resources.length === 1 && resources[0].canEditTags()
      },
      componentType: 'button',
      class: 'oc-files-actions-show-edit-tags-trigger'
    }
  ])

  return {
    actions
  }
}
