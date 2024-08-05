<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    v-if="isResourceClickable"
    :target="linkTargetBlank"
    :aria-describedby="opensInNewWindowDescriptionId"
    :draggable="false"
    @dragstart.prevent.stop
    @click="emitClick"
  >
    <slot :opens-in-new-window-description-id="opensInNewWindowDescriptionId" />
  </component>
  <span v-else>
    <slot />
  </span>
</template>

<script lang="ts">
import uniqueId from 'design-system/src/utils/uniqueId'

/**
 * Wraps content in a resource link
 */
export default {
  name: 'ResourceLink',
  props: {
    /**
     * The resource folder link
     */
    folderLink: {
      type: Object,
      required: false,
      default: null
    },
    /**
     * The resource to be displayed
     */
    resource: {
      type: Object,
      required: true
    },
    /**
     * Asserts whether clicking on the resource name triggers any action
     */
    isResourceClickable: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  emits: ['click'],
  computed: {
    isNavigatable() {
      return this.resource.isFolder && !this.resource.disabled
    },
    componentType() {
      return this.isNavigatable ? 'router-link' : 'oc-button'
    },
    componentProps() {
      if (!this.isNavigatable) {
        return {
          appearance: 'raw',
          gapSize: 'none',
          justifyContent: 'left'
        }
      }

      return {
        to: this.folderLink
      }
    },
    opensInNewWindowDescriptionId() {
      if (this.resource.opensInNewWindow) {
        return uniqueId('oc-link-description-')
      }

      return null
    },
    linkTargetBlank() {
      if (this.isNavigatable && this.resource.opensInNewWindow) {
        return '_blank'
      }

      return null
    }
  },
  methods: {
    emitClick(event: MouseEvent) {
      if (this.isNavigatable) {
        return
      }

      /**
       * Triggered when the resource is a file and the name is clicked
       */
      this.$emit('click', event)
    }
  }
}
</script>
