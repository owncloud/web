<template>
  <object class="pdf-viewer oc-width-1-1 oc-height-1-1" :data="url" type="application/pdf" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
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
