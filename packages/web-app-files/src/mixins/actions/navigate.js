import { mapGetters, mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'
import {
  createLocationPublic,
  createLocationSpaces,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive,
  isLocationCommonActive
} from '../../router'
import { ShareStatus } from '../../helpers/share'
import merge from 'lodash-es/merge'

export default {
  computed: {
    ...mapGetters(['capabilities']),
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
            if (isLocationCommonActive(this.$router, 'files-common-projects-trash')) {
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
            const shareId = this.getShareId(resources[0])
            const shareName = this.getShareName(resources[0])
            return merge({}, this.routeName, {
              params: {
                item: resources[0].path,
                ...(shareName && { shareName })
              },
              query: {
                ...(shareId && { shareId })
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

      if (
        isLocationSpacesActive(this.$router, 'files-spaces-share') ||
        isLocationSharesActive(this.$router, 'files-shares-with-me')
      ) {
        return createLocationSpaces('files-spaces-share')
      }

      return createLocationSpaces('files-spaces-personal')
    }
  },
  methods: {
    getShareId(resource) {
      if (this.$route.query?.shareId) {
        return this.$route.query.shareId
      }
      if (
        this.capabilities?.spaces?.share_jail &&
        isLocationSharesActive(this.$router, 'files-shares-with-me')
      ) {
        return resource.id
      }
      return undefined
    },
    getShareName(resource) {
      if (this.$route.params?.shareName) {
        return this.$route.params.shareName
      }
      if (
        this.capabilities?.spaces?.share_jail &&
        isLocationSharesActive(this.$router, 'files-shares-with-me')
      ) {
        return resource.name
      }
      return undefined
    }
  }
}
