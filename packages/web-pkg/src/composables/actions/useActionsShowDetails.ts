import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { eventBus } from '@ownclouders/web-pkg'
import { SideBarEventTopics } from '@ownclouders/web-pkg'
import { Action } from './types'

export const useActionsShowDetails = () => {
  const { $gettext } = useGettext()

  const actions = computed((): Action[] => [
    {
      name: 'show-details',
      icon: 'information',
      label: () => $gettext('Details'),
      handler: () => eventBus.publish(SideBarEventTopics.open),
      isEnabled: ({ resources }) => {
        return (resources as unknown[]).length > 0
      },
      componentType: 'button',
      class: 'oc-admin-settings-show-details-trigger'
    }
  ])

  return {
    actions
  }
}
