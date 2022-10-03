import { mapActions, mapMutations } from 'vuex'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../../composables/sideBar'
import { useGraphClient } from 'web-client/src/composables'

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
    ...mapActions('runtime/spaces', ['loadSpaceMembers']),

    $_showMembers_trigger({ resources }) {
      this.loadSpaceMembers({ graphClient: this.graphClient, space: resources[0] })
      this.SET_FILE_SELECTION(resources)
      bus.publish(SideBarEventTopics.openWithPanel, 'space-share-item')
    }
  }
}
