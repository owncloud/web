<template>
  <div class="file_info oc-flex oc-flex-between oc-p-s">
    <div class="oc-flex oc-flex-middle">
      <resource-icon
        v-if="isSubPanelActive"
        :resource="resource"
        size="large"
        class="file_info__icon oc-mr-s oc-position-relative"
      />
      <div class="file_info__body oc-text-overflow">
        <h3 data-testid="files-info-name" class="oc-font-semibold">
          <resource-name
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
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, inject } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { useResourcesStore } from '../../../composables'
import ResourceIcon from '../../FilesList/ResourceIcon.vue'
import ResourceName from '../../FilesList/ResourceName.vue'

export default defineComponent({
  name: 'FileInfo',
  components: { ResourceIcon, ResourceName },
  props: {
    isSubPanelActive: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const resourcesStore = useResourcesStore()

    const resource = inject<Resource>('resource')
    const areFileExtensionsShown = computed(() => resourcesStore.areFileExtensionsShown)

    return {
      resource,
      areFileExtensionsShown
    }
  }
})
</script>

<style lang="scss">
.file_info {
  &.sidebar-panel__file_info {
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
          stroke: var(--oc-color-secondary);
        }
      }
    }
  }
}
</style>
