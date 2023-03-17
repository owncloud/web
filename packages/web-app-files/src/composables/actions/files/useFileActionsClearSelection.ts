import { computed } from 'vue'
import { Store, useStore } from 'vuex'
import { FileAction } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'

export const useFileActionsClearSelection = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()

  const handler = () => {
    store.commit('Files/RESET_SELECTION')
  }

  const actions = computed((): FileAction[] => [
    {
      name: 'clear-selection',
      icon: 'close',
      label: () => $gettext('Clear selection'),
      hideLabel: true,
      handler,
      isEnabled: ({ resources }) => resources.length > 0,
      componentType: 'button',
      class: 'oc-files-actions-clear-selection-trigger'
    }
  ])

  return {
    actions
  }
}
