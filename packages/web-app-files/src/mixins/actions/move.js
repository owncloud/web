import { canBeMoved } from '../../helpers/permissions'
import {
  createLocationOperations,
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'

export default {
  computed: {
    $_move_items() {
      return [
        {
          name: 'move',
          icon: 'folder-shared',
          handler: this.$_move_trigger,
          label: () =>
            this.$pgettext('Action in the files list row to initiate moving resources', 'Move'),
          isEnabled: ({ resources }) => {
            if (
              !isLocationSpacesActive(this.$router, 'files-spaces-personal-home') &&
              !isLocationSpacesActive(this.$router, 'files-spaces-project') &&
              !isLocationPublicActive(this.$router, 'files-public-files') &&
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
      let context = 'private'

      const query = {
        resource: resources.map((resource) => {
          return resource.path
        })
      }

      if (isLocationPublicActive(this.$router, 'files-public-files')) {
        context = 'public'
      }

      if (isLocationSpacesActive(this.$router, 'files-spaces-project')) {
        context = 'space'
        query.storageId = this.$route.params.storageId
      }

      const item = this.currentFolder.path || this.homeFolder

      return this.$router.push(
        createLocationOperations('files-operations-location-picker', {
          params: {
            context,
            item,
            action: 'move'
          },
          query
        })
      )
    }
  }
}
