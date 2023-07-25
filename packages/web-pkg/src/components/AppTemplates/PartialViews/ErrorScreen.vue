<template>
  <div class="oc-text-center oc-flex oc-flex-center oc-flex-middle oc-height-1-1">
    <oc-icon size="xxlarge" name="error-warning" fill-type="line" />
    <p v-if="message" class="oc-text-xlarge">{{ message }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'ErrorScreen',
  props: {
    /**
     * Error message passed from external app
     */
    message: {
      default: '',
      type: String,
      required: false
    }
  }
})
</script>
