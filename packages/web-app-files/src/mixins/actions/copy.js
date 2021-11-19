import { checkRoute, isPublicFilesRoute } from '../../helpers/route'

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
              !checkRoute(
                ['files-personal', 'files-public-list', 'files-favorites'],
                this.$route.name
              )
            ) {
              return false
            }
            if (resources.length === 0) {
              return false
            }

            if (isPublicFilesRoute(this.$route)) {
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
      const context = isPublicFilesRoute(this.$route) ? 'public' : 'private'
      const item = this.currentFolder.path || this.homeFolder

      return this.$router.push({
        name: 'files-location-picker',
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
    }
  }
}
