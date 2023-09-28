import { useStore } from 'vuex'
import { eventBus } from '../../../services/eventBus'
import { SideBarEventTopics } from '../../sideBar'
import { Store } from 'vuex'
import { computed } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'

export const useSpaceActionsShowMembers = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()

  const handler = ({ resources }: SpaceActionOptions) => {
    store.commit('Files/SET_FILE_SELECTION', resources)
    eventBus.publish(SideBarEventTopics.openWithPanel, 'space-share')
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'show-members',
      icon: 'group',
      label: () => $gettext('Members'),
      handler,
      isEnabled: ({ resources }) => resources.length === 1,
      componentType: 'button',
      class: 'oc-files-actions-show-details-trigger'
    }
  ])

  return {
    actions
  }
}
