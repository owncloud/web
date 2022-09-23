<template>
  <div class="oc-flex oc-p-s app-top-bar">
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
