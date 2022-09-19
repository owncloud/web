import { mapGetters, mapState } from 'vuex'
import { isSameResource } from '../../helpers/resource'
import {
  createLocationPublic,
  createLocationSpaces,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationTrashActive
} from '../../router'
import { ShareStatus } from 'web-client/src/helpers/share'
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
            if (isLocationTrashActive(this.$router, 'files-trash-generic')) {
              return false
            }
            if (resources.length !== 1) {
              return false
            }

            if (this.currentFolder !== null && isSameResource(resources[0], this.currentFolder)) {
              return false
            }

            if (!resources[0].isFolder || resources[0].type === 'space') {
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
            const path = this.getPath(resources[0])
            const driveAliasAndItem = this.getDriveAliasAndItem(resources[0])
            const shareId = this.getShareId(resources[0])
            return merge({}, this.routeName, {
              params: {
                ...(path && { path }),
                ...(driveAliasAndItem && { driveAliasAndItem })
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

      return createLocationSpaces('files-spaces-generic')
    }
  },
  methods: {
    getPath(resource) {
      if (!isLocationPublicActive(this.$router, 'files-public-files')) {
        return null
      }
      return resource.path
    },
    getDriveAliasAndItem(resource) {
      if (
        this.capabilities?.spaces?.share_jail &&
        isLocationSharesActive(this.$router, 'files-shares-with-me')
      ) {
        return `share/${resource.name}`
      }
      if (!this.space) {
        return null
      }
      return this.space.driveAlias + resource.path
    },
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
    }
  }
}
