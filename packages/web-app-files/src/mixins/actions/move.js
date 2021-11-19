import { canBeMoved } from '../../helpers/permissions'
import { checkRoute, isPublicFilesRoute } from '../../helpers/route'

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
      const context = isPublicFilesRoute(this.$route) ? 'public' : 'private'
      const item = this.currentFolder.path || this.homeFolder

      return this.$router.push({
        name: 'files-location-picker',
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
    }
  }
}
