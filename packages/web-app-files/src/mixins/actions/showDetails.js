import { mapActions } from 'vuex'
import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_showDetails_items() {
      return [
        {
          icon: 'info_outline',
          label: () => this.$gettext('Details'),
          handler: this.$_showDetails_trigger,
          isEnabled: () => !isTrashbinRoute(this.$route),
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
