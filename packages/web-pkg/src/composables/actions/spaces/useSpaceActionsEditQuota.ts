import { Store } from 'vuex'
import { computed } from 'vue'
import { SpaceAction, SpaceActionOptions } from '../types'
import { useGettext } from 'vue3-gettext'
import { useAbility } from '../../ability'
import { SpaceResource, isProjectSpaceResource } from '@ownclouders/web-client/src/helpers'
import { useStore } from '../../store'
import { QuotaModal } from '../../../components'

export const useSpaceActionsEditQuota = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const { $gettext } = useGettext()
  const ability = useAbility()

  const getModalTitle = ({ resources }: { resources: SpaceResource[] }) => {
    if (resources.length === 1) {
      return $gettext('Change quota for Space "%{name}"', {
        name: resources[0].name
      })
    }
    return $gettext('Change quota for %{count} Spaces', {
      count: resources.length.toString()
    })
  }

  const handler = ({ resources }: SpaceActionOptions) => {
    return store.dispatch('createModal', {
      variation: 'passive',
      title: getModalTitle({ resources }),
      customComponent: QuotaModal,
      customComponentAttrs: () => ({
        spaces: resources,
        resourceType: 'space'
      }),
      hideActions: true
    })
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
    actions
  }
}
