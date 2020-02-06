<template>
  <div>
    <oc-button
      v-for="(indicator, index) in indicators"
      :key="index"
      class="file-row-share-indicator uk-text-middle"
      :class="{ 'uk-margin-xsmall-left' : index > 0, 'uk-invisible' : !indicator.visible }"
      :aria-label="indicator.label"
      @click="indicator.handler(item, indicator.id)"
      variation="raw"
    >
      <oc-icon
        :name="indicator.icon"
        class="uk-text-middle"
        size="small"
        :variation="indicator.status"
      />
    </oc-button>
  </div>
</template>

<script>
import intersection from 'lodash/intersection'
import { mapGetters } from 'vuex'
import { shareTypes, userShareTypes } from '../../../helpers/shareTypes'
import { getParentPaths } from '../../../helpers/path'

export default {
  name: 'StatusIndicators',

  props: {
    item: {
      type: Object,
      required: true
    },
    parentPath: {
      type: String,
      required: true
    }
  },

  computed: {
    ...mapGetters('Files', ['sharesTree']),

    indicators () {
      return [{
        id: 'files-sharing',
        label: this.shareUserIconLabel(this.item),
        visible: this.isUserShare(this.item),
        icon: 'group',
        status: this.shareUserIconVariation(this.item),
        handler: this.indicatorHandler
      }, {
        id: 'file-link',
        label: this.shareLinkIconLabel(this.item),
        visible: this.isLinkShare(this.item),
        icon: 'link',
        status: this.shareLinkIconVariation(this.item),
        handler: this.indicatorHandler
      }]
    },

    shareTypesIndirect () {
      const parentPaths = getParentPaths(this.parentPath, true)
      if (parentPaths.length === 0) {
        return []
      }

      // remove root entry
      parentPaths.pop()

      const shareTypes = {}
      parentPaths.forEach((parentPath) => {
        // TODO: optimize for performance by skipping once we got all known types
        const shares = this.sharesTree[parentPath]
        if (shares) {
          shares.forEach((share) => {
            // note: no distinction between incoming and outgoing shares as we display the same
            // indirect indicator for them
            shareTypes[share.info.share_type] = true
          })
        }
      })

      return Object.keys(shareTypes).map(shareType => parseInt(shareType, 10))
    }
  },

  methods: {
    isDirectUserShare (item) {
      return (intersection(userShareTypes, item.shareTypes).length > 0)
    },

    isIndirectUserShare (item) {
      return (item.isReceivedShare() || intersection(userShareTypes, this.shareTypesIndirect).length > 0)
    },

    isDirectLinkShare (item) {
      return (item.shareTypes.indexOf(shareTypes.link) >= 0)
    },

    isIndirectLinkShare () {
      return (this.shareTypesIndirect.indexOf(shareTypes.link) >= 0)
    },

    isUserShare (item) {
      return this.isDirectUserShare(item) || this.isIndirectUserShare(item)
    },

    isLinkShare (item) {
      return this.isDirectLinkShare(item) || this.isIndirectLinkShare(item)
    },

    shareUserIconVariation (item) {
      return this.isDirectUserShare(item) ? 'active' : 'passive'
    },

    shareLinkIconVariation (item) {
      return this.isDirectLinkShare(item) ? 'active' : 'passive'
    },

    shareUserIconLabel (item) {
      return this.isDirectUserShare(item) ? this.$gettext('Directly shared with collaborators') : this.$gettext('Shared with collaborators through one of the parent folders')
    },

    shareLinkIconLabel (item) {
      return this.isDirectLinkShare(item) ? this.$gettext('Directly shared with links') : this.$gettext('Shared with links through one of the parent folders')
    },

    indicatorHandler (item, sideBarName) {
      this.$emit('click', item, sideBarName)
    }
  }
}
</script>
