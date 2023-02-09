import { mapGetters, mapMutations } from 'vuex'
import { eventBus } from 'web-pkg'
import { isLocationTrashActive, isLocationPublicActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'

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
          handler: this.$_showEditTags_trigger,
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
  },
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),

    $_showEditTags_trigger({ resources }) {
      this.SET_FILE_SELECTION(resources)
      eventBus.publish(SideBarEventTopics.openWithPanel, 'tags')
    }
  }
}
