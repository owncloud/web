import { Store } from 'vuex'
import { useStore } from '../../store'
import { SpaceAction, SpaceActionOptions } from '../types'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { ReadmeContentModal } from '../../../components'
import { useModals } from '../../piniaStores'

export const useSpaceActionsEditReadmeContent = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { dispatchModal } = useModals()
  const { $gettext } = useGettext()

  const handler = ({ resources }: SpaceActionOptions) => {
    dispatchModal({
      title: $gettext('Edit description for space %{name}', {
        name: resources[0].name
      }),
      customComponent: ReadmeContentModal,
      customComponentAttrs: () => ({ space: resources[0] })
    })
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'editReadmeContent',
      icon: 'article',
      label: () => {
        return $gettext('Edit description')
      },
      handler,
      isEnabled: ({ resources }) => {
        if (resources.length !== 1) {
          return false
        }

        if (!resources[0].canEditReadme({ user: store.getters.user })) {
          return false
        }

        return !!resources[0].spaceReadmeData
      },
      componentType: 'button',
      class: 'oc-files-actions-edit-readme-content-trigger'
    }
  ])

  return {
    actions
  }
}
