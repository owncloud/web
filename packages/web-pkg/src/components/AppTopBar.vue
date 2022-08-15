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
      <slot name="right"></slot>
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
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'AppTopBar',
  props: {
    resource: {
      type: Object,
      default: null
    }
  }
})
</script>

<style lang="scss" scoped>
.app-top-bar {
  align-items: center;
  justify-content: space-between;
}
</style>
