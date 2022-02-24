import { mapActions, mapMutations } from 'vuex'

export default {
  computed: {
    $_showDetails_items() {
      return [
        {
          name: 'show-details',
          icon: 'information',
          iconFillType: 'line',
          label: () => this.$gettext('Details'),
          handler: this.$_showDetails_trigger,
          isEnabled: ({ resources }) => resources.length === 1,
          componentType: 'oc-button',
          class: 'oc-files-actions-show-details-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files/sidebar', { openSidebar: 'open', closeSidebar: 'close' }),
    ...mapMutations('Files', ['SET_FILE_SELECTION']),

    $_showDetails_trigger({ resources }) {
      if (resources.length !== 1) {
        return
      }

      this.SET_FILE_SELECTION([resources[0]])
      this.openSidebar()
    }
  }
}
