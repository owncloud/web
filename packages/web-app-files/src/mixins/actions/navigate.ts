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
import { buildShareSpaceResource, isShareSpaceResource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

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
              resources[0].status === ShareStatus.declined
            ) {
              return false
            }

            return true
          },
          canBeDefault: true,
          componentType: 'router-link',
          route: ({ resources }) => {
            if (
              isShareSpaceResource(this.space) &&
              (isLocationSharesActive(this.$router, 'files-shares-with-others') ||
                isLocationSharesActive(this.$router, 'files-shares-via-link'))
            ) {
              // FIXME: This is a hacky way to resolve re-shares, but we don't have other options currently
              return { name: 'resolvePrivateLink', params: { fileId: resources[0].fileId } }
            }

            return merge(
              {},
              this.routeName,
              createFileRouteOptions(this.$_navigate_getSpace(resources[0]), {
                path: resources[0].path,
                fileId: resources[0].fileId
              })
            )
          },
          class: 'oc-files-actions-navigate-trigger'
        }
      ]
    },
    routeName() {
      if (isLocationPublicActive(this.$router, 'files-public-link')) {
        return createLocationPublic('files-public-link')
      }

      return createLocationSpaces('files-spaces-generic')
    }
  },
  methods: {
    $_navigate_getSpace(resource) {
      if (this.space) {
        return this.space
      }
      const storageId = resource.storageId
      // FIXME: Once we have the shareId in the OCS response, we can check for that and early return the share
      const space = this.$store.getters['runtime/spaces/spaces'].find(
        (space) => space.id === storageId
      )
      if (space) {
        return space
      }

      return buildShareSpaceResource({
        shareId: resource.shareId,
        shareName: resource.name,
        serverUrl: configurationManager.serverUrl
      })
    }
  }
}
