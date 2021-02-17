import { dirname } from 'path'

import { canBeMoved } from '../../helpers/permissions'
import { checkRoute } from '../../helpers/route'

export default {
  computed: {
    $_move_items() {
      return [
        {
          icon: 'folder-move',
          handler: resource => this.$_move_trigger(resource),
          ariaLabel: () =>
            this.$pgettext(
              'Action in the files list row to initiate move of a single resource',
              'Move'
            ),
          isEnabled: ({ resource }) => {
            if (
              !checkRoute(
                ['files-all-files', 'files-public-list', 'files-favorites'],
                this.$route.name
              )
            ) {
              return false
            }

            if (!this.currentFolder) {
              return false
            }

            return canBeMoved(resource, this.currentFolder.path)
          }
        }
      ]
    }
  },
  methods: {
    $_move_trigger(resource) {
      // Parent of the resource selected for copy used as a default target location
      const parent = dirname(resource.path)
      this.$router.push({
        name: 'files-location-picker',
        query: { action: 'move', target: parent, resource: resource.path }
      })
    }
  }
}
