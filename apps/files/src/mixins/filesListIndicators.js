import { mapGetters, mapMutations, mapActions } from 'vuex'
import intersection from 'lodash/intersection'
import { shareTypes, userShareTypes } from '../helpers/shareTypes'
import { getParentPaths } from '../helpers/path'

export default {
  computed: {
    ...mapGetters('Files', ['sharesTree']),

    shareTypesIndirect() {
      const parentPath = this.currentFolder.path
      if (!parentPath) {
        return []
      }
      const parentPaths = getParentPaths(parentPath, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      const shareTypes = {}
      parentPaths.forEach(parentPath => {
        // TODO: optimize for performance by skipping once we got all known types
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach(share => {
            // note: no distinction between incoming and outgoing shares as we display the same
            // indirect indicator for them
            shareTypes[share.shareType] = true
          })
        }
      })

      return Object.keys(shareTypes).map(shareType => parseInt(shareType, 10))
    }
  },
  methods: {
    ...mapActions('Files', ['setHighlightedFile']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_EXPANDED_ACCORDION']),

    indicatorArray(item) {
      const indicators = [
        {
          id: 'files-sharing',
          label: this.shareUserIconLabel(item),
          visible: this.isUserShare(item),
          icon: 'group',
          handler: this.indicatorHandler
        },
        {
          id: 'file-link',
          label: this.shareLinkIconLabel(item),
          visible: this.isLinkShare(item),
          icon: 'link',
          handler: this.indicatorHandler
        }
      ]

      return indicators.filter(indicator => indicator.visible)
    },

    $_shareTypes(item) {
      if (typeof item.shareTypes !== 'undefined') {
        return item.shareTypes
      }

      if (item.shares) {
        return Array.from(new Set(item.shares.map(share => parseInt(share.type, 10))))
      }
      return []
    },

    isDirectUserShare(item) {
      return intersection(userShareTypes, this.$_shareTypes(item)).length > 0
    },

    isIndirectUserShare(item) {
      return (
        item.isReceivedShare() || intersection(userShareTypes, this.shareTypesIndirect).length > 0
      )
    },

    isDirectLinkShare(item) {
      return this.$_shareTypes(item).indexOf(shareTypes.link) >= 0
    },

    isIndirectLinkShare() {
      return this.shareTypesIndirect.indexOf(shareTypes.link) >= 0
    },

    isUserShare(item) {
      return this.isDirectUserShare(item) || this.isIndirectUserShare(item)
    },

    isLinkShare(item) {
      return this.isDirectLinkShare(item) || this.isIndirectLinkShare(item)
    },

    shareUserIconLabel(item) {
      return this.isDirectUserShare(item)
        ? this.$gettext('Directly shared with people')
        : this.$gettext('Shared with people through one of the parent folders')
    },

    shareLinkIconLabel(item) {
      return this.isDirectLinkShare(item)
        ? this.$gettext('Directly shared with links')
        : this.$gettext('Shared with links through one of the parent folders')
    },

    indicatorHandler(resource, accordion) {
      this.setHighlightedFile(resource)
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION(accordion)
    }
  }
}
