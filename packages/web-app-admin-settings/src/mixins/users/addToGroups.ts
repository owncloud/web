import { eventBus } from 'web-pkg/src/services/eventBus'
import { computed, Ref } from 'vue'
import { useGettext } from 'vue3-gettext'

export const useAddToGroups = (): { actions: Ref<unknown[]> } => {
  const { $gettext } = useGettext()

  const actions = computed((): unknown[] => [
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
