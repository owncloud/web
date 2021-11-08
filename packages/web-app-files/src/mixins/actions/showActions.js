import { mapActions } from 'vuex'
import { isTrashbinRoute } from '../../helpers/route'

export default {
  computed: {
    $_showActions_items() {
      return [
        {
          name: 'show-actions',
          icon: 'slideshow',
          label: () => this.$gettext('All Actions'),
          handler: this.$_showActions_trigger,
          isEnabled: ({ resources }) => {
            // we don't have batch actions in the right sidebar, yet.
            // return hardcoded `true` in all cases once we have them.
            return resources.length === 1
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-show-actions-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files/sidebar', { openSidebarWithPanel: 'openWithPanel' }),

    async $_showActions_trigger() {
      // we don't have details in the trashbin, yet.
      // return hardcoded `actions-item` in all cases once we have them.
      await this.openSidebarWithPanel(isTrashbinRoute(this.$route) ? null : 'actions-item')
    }
  }
}
