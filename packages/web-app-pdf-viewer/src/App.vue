<template>
  <AppWrapper
    id="pdf-viewer"
    v-slot="{ url }: { url: string }"
    application-id="pdf-viewer"
    :url-for-resource-options="{
      disposition: 'inline'
    }"
  >
    <object class="pdf-viewer oc-width-1-1 oc-height-1-1" :data="url" type="application/pdf" />
  </AppWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppWrapper from 'web-pkg/src/components/AppTemplates/AppWrapper.vue'

export default defineComponent({
  name: 'PDFViewer',
  components: {
    AppWrapper
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
