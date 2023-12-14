import { computed, unref } from 'vue'
import { useGettext } from 'vue3-gettext'
import { UserAction, useCapabilityReadOnlyUserAttributes, useStore } from '@ownclouders/web-pkg'
import LoginModal from '../../../components/Users/LoginModal.vue'

export const useUserActionsEditLogin = () => {
  const store = useStore()
  const readOnlyUserAttributes = useCapabilityReadOnlyUserAttributes()
  const { $gettext, $ngettext } = useGettext()

  const handler = ({ resources }) => {
    return store.dispatch('createModal', {
      variation: 'passive',
      title: $ngettext(
        'Edit login for "%{user}"',
        'Edit login for %{userCount} users',
        resources.length,
        {
          user: resources[0].displayName,
          userCount: resources.length.toString()
        }
      ),
      hideActions: true,
      customComponent: LoginModal,
      customComponentAttrs: () => ({
        users: resources
      })
    })
  }

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
      handler
    }
  ])

  return {
    actions
  }
}
