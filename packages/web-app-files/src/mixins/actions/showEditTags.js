import { mapActions } from 'vuex'
import { isLocationTrashActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'

export default {
  mixins: [isFilesAppActive],
  computed: {
    $_showEditTags_items() {
      return [
        {
          name: 'show-edit-tags',
          icon: 'price-tag-3',
          label: () => this.$gettext('Add or edit tags'),
          handler: this.$_showEditTags_trigger,
          // we don't have details in the trashbin, yet.
          // remove trashbin route rule once we have them.
          isEnabled: ({ resources }) => {
            // sidebar is currently only available inside files app
            if (!this.$_isFilesAppActive) {
              return false
            }

            if (
              isLocationTrashActive(this.$router, 'files-trash-personal') ||
              isLocationTrashActive(this.$router, 'files-trash-spaces-project')
            ) {
              return false
            }
            return resources.length === 1
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-show-edit-tags-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapActions('Files/sidebar', { openSidebarWithPanel: 'openWithPanel' }),

    async $_showEditTags_trigger() {
      await this.openSidebarWithPanel('tags-item')
    }
  }
}
