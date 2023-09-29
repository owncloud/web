import { computed, unref } from 'vue'
import { Store } from 'vuex'
import { eventBus, useCapabilityDeleteUsersDisabled, useLoadingService } from '@ownclouders/web-pkg'
import { useClientService, useStore } from '@ownclouders/web-pkg'
import { UserAction, UserActionOptions } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

export const useUserActionsDelete = ({ store }: { store?: Store<any> }) => {
  store = store || useStore()
  const { $gettext, $ngettext } = useGettext()
  const clientService = useClientService()
  const loadingService = useLoadingService()

  const deleteUsers = async (users) => {
    const graphClient = clientService.graphAuthenticated
    const promises = users.map((user) => graphClient.users.deleteUser(user.id))
    const results = await loadingService.addTask(() => {
      return Promise.allSettled(promises)
    })

    const succeeded = results.filter((r) => r.status === 'fulfilled')
    if (succeeded.length) {
      const title =
        succeeded.length === 1 && users.length === 1
          ? $gettext('User "%{user}" was deleted successfully', { user: users[0].displayName })
          : $ngettext(
              '%{userCount} user was deleted successfully',
              '%{userCount} users were deleted successfully',
              succeeded.length,
              { userCount: succeeded.length.toString() },
              true
            )
      store.dispatch('showMessage', { title })
    }

    const failed = results.filter((r) => r.status === 'rejected')
    if (failed.length) {
      failed.forEach(console.error)

      const title =
        failed.length === 1 && users.length === 1
          ? $gettext('Failed to delete user "%{user}"', { user: users[0].displayName })
          : $ngettext(
              'Failed to delete %{userCount} user',
              'Failed to delete %{userCount} users',
              failed.length,
              { userCount: failed.length.toString() },
              true
            )
      store.dispatch('showErrorMessage', {
        title,
        errors: (failed as PromiseRejectedResult[]).map((f) => f.reason)
      })
    }

    store.dispatch('hideModal')
    eventBus.publish('app.admin-settings.list.load')
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
        return !!resources.length && !unref(useCapabilityDeleteUsersDisabled())
      },
      componentType: 'button',
      class: 'oc-users-actions-delete-trigger'
    }
  ])

  return {
    actions,
    // HACK: exported for unit tests:
    deleteUsers
  }
}
