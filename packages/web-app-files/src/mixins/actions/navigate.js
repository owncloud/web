import { mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'
import {
  createLocationPublic,
  createLocationSpaces,
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive
} from '../../router'
import { ShareStatus } from '../../helpers/share'

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
            if (isLocationCommonActive(this.$router, 'files-common-trash')) {
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

            if (
              isLocationSharesActive(this.$router, 'files-shares-with-me') &&
              resources[0].status !== ShareStatus.accepted
            ) {
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
      return isLocationPublicActive(this.$router, 'files-public-files')
        ? createLocationSpaces('files-spaces-personal-home')
        : createLocationPublic('files-public-files')
    }
  }
}
