import { canBeMoved } from '../../helpers/permissions'
import {
  createLocationOperations,
  isLocationCommonActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'

export default {
  computed: {
    $_move_items() {
      return [
        {
          name: 'move',
          icon: 'folder-move',
          handler: this.$_move_trigger,
          label: () =>
            this.$pgettext('Action in the files list row to initiate moving resources', 'Move'),
          isEnabled: ({ resources }) => {
            if (
              !isLocationSpacesActive(this.$router) &&
              !isLocationSharesActive(this.$router, 'files-shares-public-files') &&
              !isLocationCommonActive(this.$router, 'files-common-favorites')
            ) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (!this.currentFolder) {
              return false
            }

            const moveDisabled = resources.some((resource) => {
              return canBeMoved(resource, this.currentFolder.path) === false
            })
            return !moveDisabled
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-move-trigger'
        }
      ]
    }
  },
  methods: {
    $_move_trigger({ resources }) {
      const context = isLocationSharesActive(this.$router, 'files-shares-public-files')
        ? 'public'
        : 'private'
      const item = this.currentFolder.path || this.homeFolder
      return this.$router.push(
        createLocationOperations('files-operations-location-picker', {
          params: {
            context,
            item,
            action: 'move'
          },
          query: {
            resource: resources.map((resource) => {
              return resource.path
            })
          }
        })
      )
    }
  }
}
