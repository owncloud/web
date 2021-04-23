import { dirname } from 'path'

import { canBeMoved } from '../../helpers/permissions'
import { checkRoute } from '../../helpers/route'
import MixinRoutes from '../routes'

export default {
  mixins: [MixinRoutes],
  computed: {
    $_move_items() {
      return [
        {
          icon: 'folder-move',
          handler: resource => this.$_move_trigger(resource),
          label: () =>
            this.$pgettext(
              'Action in the files list row to initiate move of a single resource',
              'Move'
            ),
          isEnabled: ({ resource }) => {
            if (
              !checkRoute(
                ['files-personal', 'files-public-list', 'files-favorites'],
                this.$route.name
              )
            ) {
              return false
            }

            if (!this.currentFolder) {
              return false
            }

            return canBeMoved(resource, this.currentFolder.path)
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-sidebar-move-trigger'
        }
      ]
    }
  },
  methods: {
    $_move_trigger(resource) {
      // Parent of the resource selected for copy used as a default target location
      const parent = dirname(resource.path)
      const context = this.isPublicPage ? 'public' : 'private'
      this.$router.push({
        name: 'files-location-picker',
        params: {
          context,
          item: parent,
          action: 'move'
        },
        query: { resource: resource.path }
      })
    }
  }
}
