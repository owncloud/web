<template>
  <div class="oc-flex oc-p-s app-top-bar">
    <oc-resource v-if="resource" id="app-top-bar-resource" :is-thumbnail-displayed="false" :resource="resource" />
    <div v-if="message" class="app-top-bar-message">{{message}}</div>
    <div>
      <slot name="right"></slot>
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
    },
    message: {
      type: String,
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

.app-top-bar-message {
  color: var(--oc-color-swatch-success-default);
}
</style>
