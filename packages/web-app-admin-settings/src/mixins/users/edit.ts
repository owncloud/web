import { eventBus } from 'web-pkg'
import { UserAction } from 'web-pkg/src/composables/actions'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export default {
  computed: {
    $_edit_items(): UserAction[] {
      return [
        {
          name: 'edit',
          icon: 'pencil',
          label: () => this.$gettext('Edit'),
          handler: this.$_edit_trigger,
          isEnabled: ({ resources }) => {
            return resources.length > 0
          },
          componentType: 'button',
          class: 'oc-users-actions-edit-trigger'
        }
      ]
    }
  },
  methods: {
    $_edit_trigger() {
      eventBus.publish(SideBarEventTopics.openWithPanel, 'EditPanel')
    }
  }
}
