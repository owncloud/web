import {
  createLocationOperations,
  isLocationCommonActive,
  isLocationSharesActive,
  isLocationSpacesActive
} from '../../router'

export default {
  computed: {
    $_copy_items() {
      return [
        {
          name: 'copy',
          icon: 'file_copy',
          handler: this.$_copy_trigger,
          label: () =>
            this.$pgettext('Action in the files list row to initiate copying resources', 'Copy'),
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

            if (isLocationSharesActive(this.$router, 'files-shares-public-files')) {
              return this.currentFolder.canCreate()
            }

            // copy can't be restricted in authenticated context, because
            // a user always has their home dir with write access
            return true
          },
          componentType: 'oc-button',
          class: 'oc-files-actions-copy-trigger'
        }
      ]
    }
  },
  methods: {
    $_copy_trigger({ resources }) {
      const context = isLocationSharesActive(this.$router, 'files-shares-public-files')
        ? 'public'
        : 'private'
      const item = this.currentFolder.path || this.homeFolder
      return this.$router.push(
        createLocationOperations('files-operations-location-picker', {
          params: {
            context,
            item,
            action: 'copy'
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
