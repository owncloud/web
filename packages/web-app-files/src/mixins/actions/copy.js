import {
  createLocationOperations,
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSpacesActive
} from '../../router'

export default {
  computed: {
    $_copy_items() {
      return [
        {
          name: 'copy',
          icon: 'file-copy-2',
          handler: this.$_copy_trigger,
          label: () =>
            this.$pgettext('Action in the files list row to initiate copying resources', 'Copy'),
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

            if (isLocationPublicActive(this.$router, 'files-public-files')) {
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
            action: 'copy'
          },
          query
        })
      )
    }
  }
}
