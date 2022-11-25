<template>
  <main>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <object class="pdf-viewer oc-width-1-1 oc-height-1-1" :data="url" type="application/pdf" />
    </div>
  </main>
</template>
<script lang="ts">
import { useAppDefaults } from 'web-pkg/src/composables'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import { defineComponent } from '@vue/runtime-core'

export default defineComponent({
  name: 'PDFViewer',
  components: {
    ErrorScreen,
    LoadingScreen,
    AppTopBar
  },
  setup() {
    return {
      ...useAppDefaults({
        applicationId: 'pdf-viewer'
      })
    }
  },
  data: () => ({
    loading: true,
    loadingError: false,
    filePath: '',
    url: '',
    resource: null
  }),
  watch: {
    currentFileContext: {
      handler: function () {
        this.unloadPdf()
        this.loadPdf(this.currentFileContext)
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.unloadPdf()
  },
  methods: {
    async loadPdf(fileContext) {
      try {
        this.loading = true
        this.resource = await this.getFileResource(fileContext.path)
        this.url = await this.getUrlForResource(this.resource, {
          disposition: 'inline'
        })
      } catch (e) {
        this.loadingError = true
        console.error('Error fetching pdf', e)
      } finally {
        this.loading = false
      }
    },
    unloadPdf() {
      this.revokeUrl(this.url)
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
