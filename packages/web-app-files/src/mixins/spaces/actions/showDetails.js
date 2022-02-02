import { mapActions } from 'vuex'

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
          isEnabled: () => false, // @TODO As soon as we have the details
          componentType: 'oc-button',
          class: 'oc-files-actions-show-details-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files/sidebar', { openSidebar: 'open' }),

    async $_showDetails_trigger() {
      await this.openSidebar()
    }
  }
}
