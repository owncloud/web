import { mapMutations } from 'vuex'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { useGraphClient } from 'web-pkg/src/composables'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

export default {
  setup() {
    return { ...useGraphClient() }
  },
  computed: {
    $_showMembers_items() {
      return [
        {
          name: 'show-members',
          icon: 'group',
          label: () => this.$gettext('Members'),
          handler: this.$_showMembers_trigger,
          isEnabled: ({ resources }) => false,
          componentType: 'button',
          class: 'oc-files-actions-show-details-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),

    $_showMembers_trigger({ resources }) {
      this.SET_FILE_SELECTION(resources)
      eventBus.publish(SideBarEventTopics.openWithPanel, 'space-share')
    }
  }
}
