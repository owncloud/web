<template>
  <main>
    <app-top-bar :resource="resource" @close="closeApp" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <object class="pdf-viewer oc-width-1-1" :data="url" type="application/pdf" />
    </div>
  </main>
</template>
<script lang="ts">
import {
  useAppDefaults,
  useCapabilityCoreSupportUrlSigning,
  useClientService
} from 'web-pkg/src/composables'
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
    const isUrlSigningSupported = useCapabilityCoreSupportUrlSigning()
    const {
      webdav: { getFileUrl, revokeUrl }
    } = useClientService()

    return {
      ...useAppDefaults({
        applicationId: 'pdf-viewer'
      }),
      getFileUrl,
      revokeUrl,
      isUrlSigningSupported
    }
  },
  data: () => ({
    loading: true,
    loadingError: false,
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
        this.url = await this.getFileUrl(fileContext.space, this.resource, {
          disposition: 'inline',
          isUrlSigningEnabled: this.isUrlSigningSupported
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
  height: calc(100% - 52px);
}
</style>
