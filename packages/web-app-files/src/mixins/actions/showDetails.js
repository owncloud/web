import { mapMutations } from 'vuex'
import { isLocationTrashActive, isLocationCommonActive } from '../../router'
import isFilesAppActive from './helpers/isFilesAppActive'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../composables/sideBar'

export default {
  mixins: [isFilesAppActive],
  computed: {
    $_showDetails_items() {
      return [
        {
          name: 'show-details',
          icon: 'information',
          label: () => this.$gettext('Details'),
          handler: this.$_showDetails_trigger,
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
            if (isLocationCommonActive(this.$router, 'files-common-projects-trash')) {
              return false
            }
            return resources.length > 0
          },
          componentType: 'button',
          class: 'oc-files-actions-show-details-trigger'
        }
      ]
    }
  },
  methods: {
    ...mapMutations('Files', ['SET_FILE_SELECTION']),

    $_showDetails_trigger({ resources }) {
      this.SET_FILE_SELECTION(resources)
      bus.publish(SideBarEventTopics.open)
    }
  }
}
