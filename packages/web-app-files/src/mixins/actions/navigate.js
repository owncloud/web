import { isPublicFilesRoute, isSharedWithMeRoute, isTrashbinRoute } from '../../helpers/route'
import { mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'
import { shareStatus } from '../../helpers/shareStatus'

export default {
  computed: {
    ...mapState('Files', ['currentFolder']),
    $_navigate_items() {
      return [
        {
          name: 'navigate',
          icon: 'folder-open',
          label: () =>
            this.$pgettext('Action in the files list row to open a folder', 'Open folder'),
          isEnabled: ({ resources }) => {
            if (isTrashbinRoute(this.$route)) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            if (isSameResource(resources[0], this.currentFolder)) {
              return false
            }

            if (!resources[0].isFolder) {
              return false
            }

            if (isSharedWithMeRoute(this.$route) && resources[0].status !== shareStatus.accepted) {
              return false
            }

            return true
          },
          canBeDefault: true,
          componentType: 'router-link',
          route: this.route,
          class: 'oc-files-actions-navigate-trigger'
        }
      ]
    },
    route() {
      if (isPublicFilesRoute(this.$route)) {
        return 'files-public-list'
      }
      return 'files-personal'
    }
  }
}
