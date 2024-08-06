<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    v-if="isResourceClickable"
    :draggable="false"
    @dragstart.prevent.stop
    @click="emitClick"
  >
    <slot />
  </component>
  <span v-else>
    <slot />
  </span>
</template>

<script lang="ts">
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
