import { mapGetters } from 'vuex'
import { isLocationPublicActive, isLocationTrashActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from '../../composables/sideBar'

export default {
  mixins: [isFilesAppActive],
  computed: {
    ...mapGetters(['capabilities']),

    $_showEditTags_items() {
      return [
        {
          name: 'show-edit-tags',
          icon: 'price-tag-3',
          label: () => this.$gettext('Add or edit tags'),
          handler: () => eventBus.publish(SideBarEventTopics.openWithPanel, 'tags-item'),
          // we don't have details in the trashbin, yet.
          // remove trashbin route rule once we have them.
          isEnabled: ({ resources }) => {
            // sidebar is currently only available inside files app
            if (!this.$_isFilesAppActive || !this.capabilities?.files?.tags) {
              return false
            }

            if (
              isLocationTrashActive(this.$router, 'files-trash-generic') ||
              isLocationPublicActive(this.$router, 'files-public-link')
            ) {
              return false
            }
            return resources.length === 1 && resources[0].canEditTags()
          },
          componentType: 'button',
          class: 'oc-files-actions-show-edit-tags-trigger'
        }
      ]
    }
  }
}
