<template>
  <div class="file_info oc-flex oc-flex-between oc-p-s">
    <div class="oc-flex oc-flex-middle">
      <oc-resource-icon
        v-if="isSubPanelActive"
        :resource="resource"
        size="large"
        class="file_info__icon oc-mr-s"
      />
      <div class="file_info__body oc-text-overflow">
        <h3 data-testid="files-info-name" class="oc-font-semibold">
          <oc-resource-name
            :name="resource.name"
            :extension="resource.extension"
            :type="resource.type"
            :full-path="resource.webDavPath"
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

<script lang="ts">
import { computed, defineComponent, inject, unref } from 'vue'
import PrivateLinkItem from './PrivateLinkItem.vue'
import { Resource } from 'web-client'
import {
  useCapabilityFilesSharingPublicAlias,
  useCapabilityPrivateLinks,
  useStore
} from '@ownclouders/web-pkg'

export default defineComponent({
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
  setup() {
    const store = useStore()
    const resource = inject<Resource>('resource')
    const hasPublicLinkAliasSupport = useCapabilityFilesSharingPublicAlias()
    const hasPrivateLinkSupport = useCapabilityPrivateLinks()
    const areFileExtensionsShown = store.state.Files.areFileExtensionsShown

    const privateLinkEnabled = computed(() => {
      if (unref(hasPublicLinkAliasSupport)) {
        // alias links are the next UI concept iteration for "file pointers"
        // i.e. ignore private link capability if alias links are supported
        return false
      }
      return unref(hasPrivateLinkSupport) && unref(resource).privateLink
    })

    return { resource, areFileExtensionsShown, privateLinkEnabled }
  }
})
</script>

<style lang="scss">
.file_info {
  &.sidebar-panel__file_info {
    border-bottom: 1px solid var(--oc-color-border);
  }

  button {
    white-space: nowrap;
  }

  &__body {
    text-align: left;

    h3 {
      font-size: var(--oc-font-size-medium);
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
