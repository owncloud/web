import { mapActions, mapMutations } from 'vuex'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../../composables/sideBar'
import { useGraphClient } from 'web-client/src/composables'

export default {
  setup() {
    return { ...useGraphClient() }
  },
  computed: {
    $_showDetails_items() {
      return [
        {
          name: 'show-details',
          icon: 'information',
          label: () => this.$gettext('Details'),
          handler: this.$_showDetails_trigger,
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

    $_showDetails_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      this.loadSpaceMembers({ graphClient: this.graphClient, space: resources[0] })
      this.SET_FILE_SELECTION([resources[0]])
      this.$_showDetails_openSideBar()
    },

    $_showDetails_openSideBar() {
      bus.publish(SideBarEventTopics.open)
    }
  }
}
