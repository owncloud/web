import { eventBus } from '@ownclouders/web-pkg'
import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction } from '@ownclouders/web-pkg'
import { useCapabilityReadOnlyUserAttributes } from '@ownclouders/web-pkg'

export const useUserActionsEditLogin = () => {
  const readOnlyUserAttributes = useCapabilityReadOnlyUserAttributes()
  const { $gettext } = useGettext()

  const actions = computed((): UserAction[] => [
    {
      name: 'edit-login',
      icon: 'login-circle',
      componentType: 'button',
      class: 'oc-users-actions-edit-login-trigger',
      label: () => $gettext('Edit login'),
      isEnabled: ({ resources }) => {
        if (unref(readOnlyUserAttributes).includes('user.accountEnabled')) {
          return false
        }

        return resources.length > 0
      },
      handler() {
        eventBus.publish('app.admin-settings.users.actions.edit-login')
      }
    }
  ])

  return {
    actions
  }
}
