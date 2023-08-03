<template>
  <ViewerApp
    id="pdf-viewer"
    v-slot="{ url }: { url: string }"
    application-id="pdf-viewer"
    :url-for-resource-options="{
      disposition: 'inline'
    }"
  >
    <object class="pdf-viewer oc-width-1-1 oc-height-1-1" :data="url" type="application/pdf" />
  </ViewerApp>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ViewerApp from 'web-pkg/src/components/AppTemplates/ViewerApp.vue'

export default defineComponent({
  name: 'PDFViewer',
  components: {
    ViewerApp
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
