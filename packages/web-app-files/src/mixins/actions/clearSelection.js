import { mapMutations } from 'vuex'

export default {
  computed: {
    $_clearSelection_items() {
      return [
        {
          name: 'clear-selection',
          icon: 'close',
          label: () => this.$gettext('Clear selection'),
          hideLabel: true,
          handler: this.$_clearSelection_trigger,
          isEnabled: ({ resources }) => resources.length > 0,
          componentType: 'button',
          class: 'oc-files-actions-clear-selection-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['RESET_SELECTION']),

    $_clearSelection_trigger() {
      this.RESET_SELECTION()
    }
  }
}
