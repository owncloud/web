<template>
  <div
    class="no-content-message oc-flex oc-flex-column oc-flex-center oc-flex-middle oc-text-center"
  >
    <oc-icon :name="icon" type="div" size="xxlarge" :fill-type="iconFillType" class="oc-mb-m" />
    <div class="oc-text-muted oc-text-xlarge">
      <slot name="message" />
    </div>
    <div class="oc-text-muted">
      <slot name="callToAction" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'NoContentMessage',

  props: {
    icon: {
      type: String,
      required: true
    },
    iconFillType: {
      type: String,
      default: 'fill'
    }
  }
})
</script>
<style>
.no-content-message {
  height: 75vh;
}

.space-frontpage .no-content-message {
  height: 55vh;
}
</style>
