import { eventBus } from '@ownclouders/web-pkg'
import { computed } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction } from '@ownclouders/web-pkg'

export const useUserActionsAddToGroups = () => {
  const { $gettext } = useGettext()

  const actions = computed((): UserAction[] => [
    {
      name: 'add-to-groups',
      icon: 'add',
      componentType: 'button',
      class: 'oc-users-actions-add-to-groups-trigger',
      label: () => $gettext('Add to groups'),
      isEnabled: ({ resources }) => resources.length > 0,
      handler() {
        eventBus.publish('app.admin-settings.users.actions.add-to-groups')
      }
    }
  ])

  return {
    actions
  }
}
