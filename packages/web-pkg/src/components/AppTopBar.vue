<template>
  <div class="oc-flex oc-p-s app-top-bar">
    <div></div>
    <div>
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppTopBar',
  props: {
    resource: {
      type: Object,
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
