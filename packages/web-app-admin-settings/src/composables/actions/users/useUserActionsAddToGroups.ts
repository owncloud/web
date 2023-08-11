import { eventBus } from 'web-pkg/src/services/eventBus'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction } from 'web-pkg/src/composables/actions'
import { useCapabilityReadOnlyUserAttributes } from 'web-pkg'

export const useUserActionsAddToGroups = () => {
  const { $gettext } = useGettext()
  const readOnlyUserAttributes = useCapabilityReadOnlyUserAttributes()

  const actions = computed((): UserAction[] => [
    {
      name: 'add-to-groups',
      icon: 'add',
      componentType: 'button',
      class: 'oc-users-actions-add-to-groups-trigger',
      label: () => $gettext('Add to groups'),
      isEnabled: ({ resources }) => {
        if (unref(readOnlyUserAttributes).includes('user.memberOf')) {
          return false
        }

        return resources.length > 0
      },
      handler() {
        eventBus.publish('app.admin-settings.users.actions.add-to-groups')
      }
    }
  ])

  return {
    actions
  }
}
