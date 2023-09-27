import quickActions, { canShare } from '../../../quickActions'
import { isLocationSharesActive, isLocationTrashActive } from '../../../router'
import { ShareStatus } from 'web-client/src/helpers/share'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useIsFilesAppActive, useRouter, useStore } from 'web-pkg/src/composables'
import { Store } from 'vuex'
import { FileAction, FileActionOptions } from 'web-pkg/src/composables/actions'

export const useFileActionsShowShares = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const isFilesAppActive = useIsFilesAppActive()

  const handler = ({ resources }: FileActionOptions) => {
    store.commit('Files/SET_FILE_SELECTION', resources)
    eventBus.publish(SideBarEventTopics.openWithPanel, 'sharing#peopleShares')
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'show-shares',
      icon: quickActions.collaborators.icon,
      iconFillType: quickActions.collaborators.iconFillType,
      label: () => $gettext('Share'),
      handler,
      isEnabled: ({ resources }) => {
        // sidebar is currently only available inside files app
        if (!unref(isFilesAppActive)) {
          return false
        }

        if (isLocationTrashActive(router, 'files-trash-generic')) {
          return false
        }
        if (resources.length !== 1) {
          return false
        }
        if (isLocationSharesActive(router, 'files-shares-with-me')) {
          if (resources[0].status !== ShareStatus.accepted) {
            return false
          }
        }
        return canShare(resources[0], store)
      },
      componentType: 'button',
      class: 'oc-files-actions-show-shares-trigger'
    }
  ])

  return {
    actions
  }
}
