import { mapActions } from 'vuex'
import { eventBus } from 'web-pkg'
import { GroupAction } from 'web-pkg/src/composables/actions'

export default {
  computed: {
    $_delete_items(): GroupAction[] {
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
          class: 'oc-groups-actions-delete-trigger'
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
          'Delete group %{group}?',
          'Delete %{groupCount} selected groups?',
          resources.length,
          {
            group: resources[0].displayName,
            groupCount: resources.length
          }
        ),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Delete'),
        message: this.$ngettext(
          'Are you sure you want to delete this group?',
          'Are you sure you want to delete all selected groups?',
          resources.length
        ),
        hasInput: false,
        onCancel: this.hideModal,
        onConfirm: () => this.$_delete_deleteGroups(resources)
      }

      this.createModal(modal)
    },

    async $_delete_deleteGroups(groups) {
      const graphClient = this.$clientService.graphAuthenticated
      const promises = groups.map((group) => graphClient.groups.deleteGroup(group.id))

      try {
        await Promise.all(promises)
        this.hideModal()
        this.showMessage({
          title: this.$ngettext(
            'Group "%{group}" was deleted successfully',
            '%{groupCount} groups were deleted successfully',
            groups.length,
            { groupCount: groups.length, group: groups[0].displayName },
            true
          )
        })
        eventBus.publish('app.admin-settings.list.load')
      } catch (error) {
        console.error(error)
        this.hideModal()
        this.showMessage({
          title: this.$ngettext(
            'Failed to delete group "%{group}"',
            'Failed to delete %{groupCount} groups',
            groups.length,
            { groupCount: groups.length, group: groups[0].displayName },
            true
          ),
          status: 'danger'
        })
      }
    }
  }
}
