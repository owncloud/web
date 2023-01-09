<template>
  <div
    class="oc-tile-card oc-card oc-card-default oc-rounded"
    :data-item-id="resource.id"
    :class="resource.disabled ? 'state-trashed' : ''"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <oc-resource-link
      class="oc-card-media-top oc-border-b oc-flex oc-flex-center oc-flex-middle"
      :resource="resource"
      :folder-link="resourceRoute"
      @click="$emit('click', $event)"
    >
      <oc-tag
        v-if="resource.disabled"
        class="resource-disabled-indicator oc-position-absolute"
        type="span"
      >
        <span v-translate>Disabled</span>
      </oc-tag>
      <!-- Slot for resource image, renders resource type icon by default -->
      <slot name="imageField" :item="resource">
        <oc-img v-if="resource.thumbnail" class="tile-preview" :src="resource.thumbnail" />
        <oc-resource-icon
          v-else
          :resource="resource"
          size="xxlarge"
          class="tile-default-image oc-p-m"
        />
      </slot>
    </oc-resource-link>
    <div class="oc-card-body oc-p-s">
      <div class="oc-flex oc-flex-between oc-flex-middle">
        <div class="oc-flex oc-flex-middle oc-text-truncate">
          <oc-resource
            :resource="resource"
            :folder-link="resourceRoute"
            @click="$emit('click', $event)"
          />
        </div>
        <div class="oc-flex oc-flex-middle">
          <!-- Slot for individual actions -->
          <slot name="actions" :item="resource" />
        </div>
      </div>
      <p
        v-if="resource.description"
        class="oc-text-left oc-ml-xs oc-mt-xs oc-mb-rm oc-text-truncate"
      >
        <small v-text="resource.description" />
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Resource } from 'web-client'

import OcImg from '../OcImage/OcImage.vue'
import OcResource from '../OcResource/OcResource.vue'
import OcResourceIcon from '../OcResourceIcon/OcResourceIcon.vue'
import OcResourceLink from '../OcResourceLink/OcResourceLink.vue'
import OcTag from '../OcTag/OcTag.vue'

export default defineComponent({
  name: 'OcTile',
  status: 'prototype',
  release: 'unreleased',
  components: {
    OcImg,
    OcResource,
    OcResourceIcon,
    OcResourceLink,
    OcTag
  },
  props: {
    /**
     * Resource to be displayed within the tile
     */
    resource: {
      type: Object as PropType<Resource>,
      default: () => {}
    },
    resourceRoute: {
      type: Object,
      default: () => {}
    }
  },
  emits: ['click', 'contextmenu']
})
</script>

<style lang="scss" scoped>
.oc-tile-card {
  box-shadow: none !important;
  background-color: var(--oc-color-background-highlight) !important;
  height: 100%;

  &.state-trashed {
    cursor: pointer;

    .tile-image,
    .tile-default-image > svg {
      filter: grayscale(100%);
      opacity: 80%;
    }
  }

  .oc-card-media-top {
    aspect-ratio: 16/9;
    justify-content: center;
    width: 100%;

    .oc-tag {
      color: var(--oc-color-text-default);

      &.resource-disabled-indicator {
        z-index: 1;
      }
    }

    .tile-preview {
      min-width: 252px;
      height: auto;
      aspect-ratio: 16/9;
      object-fit: cover;
    }
  }

  .resource-name {
    overflow: hidden;
    color: var(--oc-color-text-default);
  }
}
</style>
