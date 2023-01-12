import { mapMutations } from 'vuex'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { useGraphClient } from 'web-pkg/src/composables'

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
          isEnabled: ({ resources }) => resources.length === 1,
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
      // FIXME: Use SideBarEventTopics from files-app. Maybe make it global?
      eventBus.publish('app.files.sidebar.openWithPanel', 'space-share')
    }
  }
}
