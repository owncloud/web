<template>
  <div
    class="oc-tile-card oc-card oc-card-default oc-rounded"
    :data-item-id="resource.id"
    :class="{
      'oc-tile-card-selected': isResourceSelected,
      'state-trashed': resource.disabled
    }"
    @contextmenu="$emit('contextmenu', $event)"
  >
    <oc-resource-link
      class="oc-card-media-top oc-flex oc-flex-center oc-flex-middle oc-m-rm"
      :resource="resource"
      :folder-link="resourceRoute"
      tabindex="-1"
      @click="$emit('click')"
    >
      <div class="oc-tile-card-selection">
        <slot name="selection" :item="resource" />
      </div>
      <oc-tag
        v-if="resource.disabled"
        class="resource-disabled-indicator oc-position-absolute"
        type="span"
      >
        <span v-text="$gettext('Disabled')" />
      </oc-tag>
      <div class="oc-tile-card-preview oc-flex oc-flex-middle oc-flex-center">
        <div class="oc-tile-card-hover"></div>
        <slot name="imageField" :item="resource">
          <oc-img v-if="resource.thumbnail" class="tile-preview" :src="resource.thumbnail" />
          <oc-resource-icon
            v-else
            :resource="resource"
            :size="resourceIconSize"
            class="tile-default-image oc-pt-xs"
          />
        </slot>
      </div>
    </oc-resource-link>
    <div class="oc-card-body oc-p-s">
      <div class="oc-flex oc-flex-between oc-flex-middle">
        <div class="oc-flex oc-flex-middle oc-text-truncate resource-name-wrapper">
          <oc-resource
            :resource="resource"
            :is-icon-displayed="false"
            :is-extension-displayed="isExtensionDisplayed"
            :folder-link="resourceRoute"
            @click="$emit('click')"
          />
        </div>
        <div class="oc-flex oc-flex-middle">
          <!-- Slot for individual actions -->
          <slot name="actions" :item="resource" />
          <!-- Slot for contextmenu -->
          <slot name="contextMenu" :item="resource" />
        </div>
      </div>
      <p v-if="resource.description" class="oc-text-left oc-my-rm oc-text-truncate">
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
    },
    isResourceSelected: {
      type: Boolean,
      required: false,
      default: false
    },
    isExtensionDisplayed: {
      type: Boolean,
      default: true
    },
    resourceIconSize: {
      type: String,
      default: 'xlarge',
      validator: (value: string) => {
        return ['large', 'xlarge', 'xxlarge', 'xxxlarge'].includes(value)
      }
    }
  },
  emits: ['click', 'contextmenu']
})
</script>

<style lang="scss">
.oc-tile-card {
  background-color: var(--oc-color-background-highlight) !important;
  box-shadow: none;
  height: 100%;
  display: flex;
  flex-flow: column;
  outline: 1px solid var(--oc-color-border);

  &.state-trashed {
    cursor: pointer;

    .tile-image,
    .tile-default-image > svg {
      filter: grayscale(100%);
      opacity: 80%;
    }
  }

  .oc-card-media-top {
    position: relative;
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
      aspect-ratio: 16/9;
      height: 100%;
      object-fit: cover;
      width: 100%;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;
    }

    &:hover {
      .oc-tile-card-hover {
        opacity: 15%;
      }
    }
  }

  &-selected {
    outline: 2px solid var(--oc-color-swatch-primary-hover);

    .oc-tile-card-preview {
      width: calc(100% - var(--oc-space-medium));
      height: calc(100% - var(--oc-space-medium));

      .tile-preview,
      .oc-tile-card-hover {
        border-radius: 5px !important;
      }
      .oc-tile-card-hover {
        opacity: 10%;
      }
    }
  }

  &-selection {
    z-index: 1;
    position: absolute;
    top: 0;
    left: 0;

    input {
      background-color: var(--oc-color-background-muted);
    }
    input.oc-checkbox-checked {
      background-color: var(--oc-color-swatch-inverse-default);
    }
  }

  &-preview {
    position: absolute;
    height: 100%;
    width: 100%;
    text-align: center;
  }

  &-hover {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #000;
    opacity: 0;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
  }

  .resource-name-wrapper {
    color: var(--oc-color-text-default);
    max-width: 70%;
    overflow: hidden;
  }
}
</style>
