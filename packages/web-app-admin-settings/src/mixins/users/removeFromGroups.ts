import { eventBus } from 'web-pkg/src/services/eventBus'
import { computed, Ref } from 'vue'
import { useGettext } from 'vue3-gettext'

export const useRemoveFromGroups = (): { actions: Ref<unknown[]> } => {
  const { $gettext } = useGettext()

  const actions = computed((): unknown[] => [
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
