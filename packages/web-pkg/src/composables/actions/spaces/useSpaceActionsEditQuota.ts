import { Store } from 'vuex'
import { computed, ref } from 'vue'
import { SpaceAction } from '../types'
import { useGettext } from 'vue3-gettext'
import { useAbility } from '../../ability'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export const useSpaceActionsEditQuota = ({ store }: { store?: Store<any> } = {}) => {
  const { $gettext } = useGettext()
  const ability = useAbility()

  const modalOpen = ref(false)

  const closeModal = () => {
    modalOpen.value = false
  }

  const handler = () => {
    modalOpen.value = true
  }

  const actions = computed((): SpaceAction[] => [
    {
      name: 'editQuota',
      icon: 'cloud',
      label: () => {
        return $gettext('Edit quota')
      },
      handler,
      isEnabled: ({ resources }) => {
        if (!resources || !resources.length) {
          return false
        }
        if (resources.some((r) => !isProjectSpaceResource(r) || r.spaceQuota === false)) {
          return false
        }
        return ability.can('set-quota-all', 'Drive')
      },
      componentType: 'button',
      class: 'oc-files-actions-edit-quota-trigger'
    }
  ])

  return {
    modalOpen,
    closeModal,
    actions
  }
}
