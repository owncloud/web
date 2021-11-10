import { mapActions } from 'vuex'
import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_showDetails_items() {
      return [
        {
          name: 'show-details',
          icon: 'info_outline',
          label: () => this.$gettext('Details'),
          handler: this.$_showDetails_trigger,
          // we don't have details in the trashbin, yet.
          // remove trashbin route rule once we have them.
          isEnabled: ({ resources }) => {
            if (isTrashbinRoute(this.$route)) {
              return false
            }
            return resources.length > 0
          },
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
