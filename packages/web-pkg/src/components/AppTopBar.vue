<template>
  <div class="oc-flex oc-p-s app-top-bar">
    <oc-resource
      v-if="resource"
      id="app-top-bar-resource"
      :is-thumbnail-displayed="false"
      :resource="resource"
    />
    <div v-else />
    <div>
      <slot name="right" />
      <oc-button
        id="app-top-bar-close"
        :aria-label="$gettext('Close')"
        size="small"
        @click="$emit('close')"
      >
        <oc-icon name="close" size="small" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Resource } from 'web-client/src'

export default defineComponent({
  name: 'AppTopBar',
  props: {
    resource: {
      type: Object as PropType<Resource>,
      default: null
    }
  },
  emits: ['close']
})
</script>

<style lang="scss" scoped>
.app-top-bar {
  align-items: center;
  justify-content: space-between;
}
</style>
