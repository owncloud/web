import { Store } from 'vuex'
import { useStore } from '../../store'
import { SpaceAction, SpaceActionOptions } from '../types'
import { computed, ref } from 'vue'
import { useGettext } from 'vue3-gettext'

export const useSpaceActionsEditReadmeContent = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()

  const modalOpen = ref(false)

  const closeModal = () => {
    modalOpen.value = false
  }

  const handler = ({}: SpaceActionOptions) => {
    modalOpen.value = true
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
    modalOpen,
    closeModal,
    actions
  }
}
