import { eventBus } from '@ownclouders/web-pkg'
import { computed, Ref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction } from '@ownclouders/web-pkg'

export const useUserActionsRemoveFromGroups = (): { actions: Ref<UserAction[]> } => {
  const { $gettext } = useGettext()

  const actions = computed((): UserAction[] => [
    {
      name: 'remove-users-from-groups',
      icon: 'subtract',
      componentType: 'button',
      class: 'oc-users-actions-remove-from-groups-trigger',
      label: () => $gettext('Remove from groups'),
      isEnabled: ({ resources }) => resources.length > 0,
      handler() {
        eventBus.publish('app.admin-settings.users.actions.remove-from-groups')
      }
    }
  ])

  return {
    actions
  }
}
