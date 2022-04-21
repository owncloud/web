import { mapActions } from 'vuex'
import { isLocationTrashActive, isLocationCommonActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'

export default {
  mixins: [isFilesAppActive],
  computed: {
    $_showActions_items() {
      return [
        {
          name: 'show-actions',
          icon: 'slideshow-3',
          label: () => this.$gettext('All Actions'),
          handler: this.$_showActions_trigger,
          isEnabled: ({ resources }) => {
            // sidebar is currently only available inside files app
            if (!this.$_isFilesAppActive) {
              return false
            }

            // we don't have batch actions in the right sidebar, yet.
            // return hardcoded `true` in all cases once we have them.
            if (isLocationCommonActive(this.$router, 'files-common-projects-trash')) return false
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
      await this.openSidebarWithPanel(
        isLocationTrashActive(this.$router, 'files-trash-personal') ||
          isLocationTrashActive(this.$router, 'files-trash-spaces-project') ||
          isLocationCommonActive(this.$router, 'files-common-projects-trash')
          ? null
          : 'actions-item'
      )
    }
  }
}
