import { computed } from 'vue'
import { Store } from 'vuex'
import { eventBus } from 'web-pkg'
import { useClientService, useStore } from 'web-pkg/src/composables'
import { UserAction, UserActionOptions } from 'web-pkg/src/composables/actions'
import { useGettext } from 'vue3-gettext'

export const useUserActionsDelete = ({ store }: { store?: Store<any> }) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const clientService = useClientService()

  const deleteUsers = async (users) => {
    const graphClient = clientService.graphAuthenticated
    const promises = users.map((user) => graphClient.users.deleteUser(user.id))

    try {
      await Promise.all(promises)
      store.dispatch('hideModal')
      store.dispatch('showMessage', {
        title: $ngettext(
          'User "%{user}" was deleted successfully',
          '%{userCount} users were deleted successfully',
          users.length,
          { userCount: users.length, user: users[0].displayName },
          true
        )
      })
      eventBus.publish('app.admin-settings.list.load')
    } catch (error) {
      console.error(error)
      store.dispatch('hideModal')
      store.dispatch('showMessage', {
        title: $ngettext(
          'Failed to delete user "%{user}"',
          'Failed to delete %{userCount} users',
          users.length,
          { userCount: users.length, user: users[0].displayName },
          true
        ),
        status: 'danger'
      })
    }
  }

  const handler = ({ resources }: UserActionOptions) => {
    if (!resources.length) {
      return
    }

    const modal = {
      variation: 'danger',
      title: $ngettext('Delete user "%{user}"?', 'Delete %{userCount} users?', resources.length, {
        user: resources[0].displayName,
        userCount: resources.length.toString()
      }),
      cancelText: $gettext('Cancel'),
      confirmText: $gettext('Delete'),
      message: $ngettext(
        'Are you sure you want to delete this user?',
        'Are you sure you want to delete the %{userCount} selected users?',
        resources.length,
        {
          userCount: resources.length.toString()
        }
      ),
      hasInput: false,
      onCancel: () => store.dispatch('hideModal'),
      onConfirm: () => deleteUsers(resources)
    }

    store.dispatch('createModal', modal)
  }

  const actions = computed((): UserAction[] => [
    {
      name: 'delete',
      icon: 'delete-bin',
      label: () => {
        return $gettext('Delete')
      },
      handler,
      isEnabled: ({ resources }) => {
        return !!resources.length
      },
      componentType: 'button',
      class: 'oc-users-actions-delete-trigger'
    }
  ])

  return {
    actions
  }
}
