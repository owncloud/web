import { isPublicFilesRoute, isTrashbinRoute } from '../../helpers/route'
import { mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'

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

            return resources[0].isFolder
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
