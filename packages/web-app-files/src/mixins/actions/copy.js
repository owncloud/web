import { dirname } from 'path'

import { checkRoute } from '../../helpers/route'

export default {
  computed: {
    $_copy_items() {
      return [
        {
          icon: 'file_copy',
          handler: this.$_copy_trigger,
          ariaLabel: () => this.$gettext('Copy'),
          isEnabled: () => {
            if (!checkRoute(['files-list', 'public-files', 'files-favorites'], this.$route.name)) {
              return false
            }

            if (this.publicPage()) {
              return this.currentFolder.canCreate()
            }

            return true
          }
        }
      ]
    }
  },
  methods: {
    $_copy_trigger(resource) {
      // Parent of the resource selected for copy used as a default target location
      const parent = dirname(resource.path)
      this.$router.push({
        name: 'location-picker',
        query: { action: 'copy', target: parent, resource: resource.path }
      })
    }
  }
}
