import { mapActions } from 'vuex'
import { eventBus } from 'web-pkg'
import { UserAction } from 'web-pkg/src/composables/actions'

export default {
  computed: {
    $_delete_items(): UserAction[] {
      return [
        {
          name: 'delete',
          icon: 'delete-bin',
          label: () => {
            return this.$gettext('Delete')
          },
          handler: this.$_delete_trigger,
          isEnabled: ({ resources }) => {
            return !!resources.length
          },
          componentType: 'button',
          class: 'oc-users-actions-delete-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions(['createModal', 'hideModal', 'showMessage']),

    $_delete_trigger({ resources }) {
      if (!resources.length) {
        return
      }

      const modal = {
        variation: 'danger',
        icon: 'alarm-warning',
        title: this.$ngettext(
          'Delete user %{user}?',
          'Delete %{userCount} selected users?',
          resources.length,
          {
            user: resources[0].displayName,
            userCount: resources.length
          }
        ),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        message: this.$ngettext(
          'Are you sure you want to delete this user?',
          'Are you sure you want to delete all selected users?',
          resources.length
        ),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_delete_deleteUsers(resources)
      }

      this.createModal(modal)
    },

    async $_delete_deleteUsers(users) {
      const graphClient = this.$clientService.graphAuthenticated
      const promises = users.map((user) => graphClient.users.deleteUser(user.id))

      try {
        await Promise.all(promises)
        this.hideModal()
        this.showMessage({
          title: this.$ngettext(
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
        this.hideModal()
        this.showMessage({
          title: this.$ngettext(
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
  }
}
