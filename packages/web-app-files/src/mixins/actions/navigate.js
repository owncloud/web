import { mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'
import {
  createLocationPublic,
  createLocationSpaces,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive
} from '../../router'
import { ShareStatus } from '../../helpers/share'
import merge from 'lodash-es/merge'

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
            if (
              isLocationTrashActive(this.$router, 'files-trash-personal') ||
              isLocationTrashActive(this.$router, 'files-trash-spaces-project')
            ) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            if (this.currentFolder !== null && isSameResource(resources[0], this.currentFolder)) {
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
          route: ({ resources }) => {
            return merge({}, this.routeName, {
              params: {
                item: resources[0].path
              }
            })
          },
          class: 'oc-files-actions-navigate-trigger'
        }
      ]
    },
    routeName() {
      if (isLocationPublicActive(this.$router, 'files-public-files')) {
        return createLocationPublic('files-public-files')
      }

      if (isLocationSpacesActive(this.$router, 'files-spaces-project')) {
        return createLocationPublic('files-spaces-project')
      }

      return createLocationSpaces('files-spaces-personal-home')
    }
  }
}
