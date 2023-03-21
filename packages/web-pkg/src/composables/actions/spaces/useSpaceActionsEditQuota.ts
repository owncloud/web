import { Store } from 'vuex'
import { useStore } from '../../store'
import { computed, ref, Ref } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'
import { SpaceResource } from 'web-client/src'
import { User } from 'web-client/src/generated'
import { useAbility } from '../../ability'
import { useClientService, useRoute } from 'web-pkg/src/composables'

export const useSpaceActionsEditQuota = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const ability = useAbility()
  const clientService = useClientService()
  const route = useRoute()

  const modalOpen = ref(false)
  const selectedSpace = ref(null) as Ref<SpaceResource>

  const spaceQuotaUpdated = (quota) => {
    selectedSpace.value.spaceQuota = quota
  }

  const closeModal = () => {
    modalOpen.value = false
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    selectedSpace.value = resources[0]
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
    spaceQuotaUpdated,
    selectedSpace,
    actions
  }
}
