import { Store } from 'vuex'
import { useStore } from '../../store'
import { computed, ref } from 'vue'
import { SpaceAction } from '../types'
import { useGettext } from 'vue3-gettext'
import { User } from 'web-client/src/generated'
import { useAbility } from '../../ability'

export const useSpaceActionsEditQuota = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
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
        // TODO: create separate useUserActionsEditQuota
        if (
          !resources.some(
            (resource) => 'spaceQuota' in resource || (resource as unknown as User).drive?.quota
          )
        ) {
          return false
        }
        if (resources.some((r) => r.spaceQuota === false)) {
          return false
        }
        return ability.can('set-quota-all', 'Space')
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
