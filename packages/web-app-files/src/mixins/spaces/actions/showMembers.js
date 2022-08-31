import { mapMutations } from 'vuex'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../../composables/sidebar'

export default {
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
      bus.publish(SideBarEventTopics.openWithPanel, 'space-share-item')
    }
  }
}
