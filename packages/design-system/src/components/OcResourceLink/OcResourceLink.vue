<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    v-if="isResourceClickable"
    :target="linkTargetBlank"
    :aria-describedby="opensInNewWindowDescriptionId"
    draggable="false"
    @dragstart.native.prevent.stop
    @click.stop="emitClick"
    @click.native.stop
  >
    <slot :opens-in-new-window-description-id="opensInNewWindowDescriptionId" />
  </component>
  <span v-else>
    <slot />
  </span>
</template>

<script>
import uniqueId from '../../utils/uniqueId'

/**
 * Wraps content in a resource link
 */
export default {
  name: 'OcResourceLink',
  status: 'prototype',
  release: 'unreleased',
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
  computed: {
    isFolder() {
      return this.resource.isFolder
    },
    componentType() {
      return this.isFolder ? 'router-link' : 'oc-button'
    },
    componentProps() {
      if (!this.isRouterLink) {
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
    isRouterLink() {
      return this.isResourceClickable && this.isFolder
    },
    linkTargetBlank() {
      if (this.isRouterLink && this.resource.opensInNewWindow) {
        return '_blank'
      }

      return null
    }
  },
  methods: {
    emitClick() {
      if (this.isFolder) {
        return
      }

      /**
       * Triggered when the resource is a file and the name is clicked
       */
      this.$emit('click')
    }
  }
}
</script>
