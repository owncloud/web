<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    v-if="isResourceClickable"
    :target="linkTarget"
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
import { useConfigStore } from '../../composables'
import { storeToRefs } from 'pinia'
import { computed, PropType, unref } from 'vue'
import { RouteLocationRaw } from 'vue-router'

/**
 * Wraps content in a resource link
 */
export default {
  name: 'ResourceLink',
  props: {
    /**
     * The resource folder link
     */
    link: {
      type: Object as PropType<RouteLocationRaw>,
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
  setup: (props) => {
    const configStore = useConfigStore()
    const { options } = storeToRefs(configStore)

    const linkTarget = computed(() => {
      return unref(options).cernFeatures && props.link ? '_blank' : '_self'
    })

    return {
      linkTarget
    }
  },
  computed: {
    isNavigatable() {
      return (this.resource.isFolder || this.link) && !this.resource.disabled
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
        to: this.link
      }
    }
  },
  methods: {
    emitClick() {
      if (this.isNavigatable) {
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
