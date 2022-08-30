import { mapMutations } from 'vuex'
import { bus } from 'web-pkg/src/instance'

export default {
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

    $_showDetails_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      this.SET_FILE_SELECTION([resources[0]])
      this.$_showDetails_openSideBar()
    },

    $_showDetails_openSideBar() {
      bus.publish('app.files.sidebar.open')
    }
  }
}
