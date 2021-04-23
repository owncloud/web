import { dirname } from 'path'

import { checkRoute } from '../../helpers/route'
import MixinRoutes from '../routes'

export default {
  mixins: [MixinRoutes],
  computed: {
    $_copy_items() {
      return [
        {
          icon: 'file_copy',
          handler: this.$_copy_trigger,
          label: () => this.$gettext('Copy'),
          isEnabled: () => {
            if (
              !checkRoute(
                ['files-personal', 'files-public-list', 'files-favorites'],
                this.$route.name
              )
            ) {
              return false
            }

            if (this.publicPage()) {
              return this.currentFolder.canCreate()
            }

            return true
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-sidebar-copy-trigger'
        }
      ]
    }
  },
  methods: {
    $_copy_trigger(resource) {
      // Parent of the resource selected for copy used as a default target location
      const parent = dirname(resource.path)
      const context = this.isPublicPage ? 'public' : 'private'
      this.$router.push({
        name: 'files-location-picker',
        params: {
          context,
          item: parent,
          action: 'copy'
        },
        query: { resource: resource.path }
      })
    }
  }
}
