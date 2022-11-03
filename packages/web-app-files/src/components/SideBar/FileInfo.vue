<template>
  <div class="file_info oc-flex oc-flex-between">
    <div class="oc-flex oc-flex-middle">
      <oc-resource-icon
        v-if="isSubPanelActive"
        :resource="file"
        size="large"
        class="file_info__icon oc-mr-s"
      />
      <div class="file_info__body oc-text-overflow">
        <h3 data-testid="files-info-name">
          <oc-resource-name
            :name="file.name"
            :extension="file.extension"
            :type="file.type"
            :full-path="file.webDavPath"
            :is-extension-displayed="areFileExtensionsShown"
            :is-path-displayed="false"
            :truncate-name="false"
          />
        </h3>
      </div>
    </div>
    <private-link-item v-if="privateLinkEnabled" class="oc-ml-s" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import PrivateLinkItem from './PrivateLinkItem.vue'

export default {
  name: 'FileInfo',
  components: {
    PrivateLinkItem
  },
  props: {
    isSubPanelActive: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapGetters(['capabilities']),
    ...mapGetters('Files', ['highlightedFile']),
    ...mapState('Files', ['areFileExtensionsShown']),

    privateLinkEnabled() {
      if (this.capabilities.files_sharing?.public?.alias) {
        // alias links are the next UI concept iteration for "file pointers"
        // i.e. ignore private link capability if alias links are supported
        return false
      }
      return this.capabilities.files.privateLinks && this.file.privateLink
    },

    file() {
      return this.highlightedFile
    }
  }
}
</script>

<style lang="scss">
.file_info {
  button {
    white-space: nowrap;
  }

  &__body {
    text-align: left;

    h3 {
      font-size: var(--oc-font-size-medium);
      font-weight: 600;
      margin: 0;
      word-break: break-all;
    }
  }

  &__favorite {
    .oc-star {
      display: inline-block;

      &-shining svg {
        fill: #ffba0a !important;

        path:not([fill='none']) {
          stroke: var(--oc-color-swatch-passive-default);
        }
      }
    }
  }
}
</style>
