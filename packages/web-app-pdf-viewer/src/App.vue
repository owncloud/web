<template>
  <object class="pdf-viewer oc-width-1-1 oc-height-1-1" :data="url" :type="objectType" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
    }
  },
  setup() {
    const isSafari =
      navigator.userAgent?.includes('Safari') && !navigator.userAgent?.includes('Chrome')
    const objectType = isSafari ? undefined : 'application/pdf'

    return {
      objectType
    }
  }
})
</script>

<style scoped>
.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
