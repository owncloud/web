import { eventBus } from 'web-pkg'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export default {
  computed: {
    $_showDetails_items() {
      return [
        {
          name: 'show-details',
          icon: 'information',
          label: () => this.$gettext('Details'),
          handler: this.$_showDetails_trigger,
          isEnabled: ({ resources }) => {
            return resources.length > 0
          },
          componentType: 'button',
          class: 'oc-spaces-actions-show-details-trigger'
        }
      ]
    }
  },
  methods: {
    $_showDetails_trigger() {
      eventBus.publish(SideBarEventTopics.open)
    }
  }
}
