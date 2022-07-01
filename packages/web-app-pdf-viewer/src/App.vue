<template>
  <main>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <div class="oc-flex oc-p-s pdf-viewer-tool-bar">
        <oc-resource :resource="resource" />
        <oc-button id="text-editor-controls-close" size="small" @click="closeApp">
          <oc-icon name="close" size="small" />
        </oc-button>
      </div>
      <object class="pdf-viewer oc-width-1-1" :data="blobUrl" type="application/pdf" />
    </div>
  </main>
</template>
<script>
import { mapGetters } from 'vuex'
import { useAppDefaults } from 'web-pkg/src/composables'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import { buildResource } from 'files/src/helpers/resources'

export default {
  name: 'PDFViewer',
  components: {
    ErrorScreen,
    LoadingScreen
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
    blobUrl: '',
    resource: {}
  }),
  computed: {
    ...mapGetters(['getToken'])
  },
  created() {
    this.loadPdf(this.currentFileContext)
  },
  async mounted() {
    const fileInfo = await this.getFileInfo(this.currentFileContext.path, {})
    this.resource = buildResource(fileInfo)
  },
  unmounted() {
    this.unloadPdf()
  },
  methods: {
    async loadPdf(fileContext) {
      try {
        this.loading = true
        const response = await this.getFileContents(fileContext.path, { responseType: 'blob' })
        this.blobUrl = URL.createObjectURL(response.body)
      } catch (e) {
        this.loadingError = true
        console.error('Error fetching pdf', e)
      } finally {
        this.loading = false
      }
    },
    unloadPdf() {
      URL.revokeObjectURL(this.blobUrl)
    }
  }
}
</script>
<style scoped>
.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: calc(100% - 50px);
}

.pdf-viewer-tool-bar {
  align-items: center;
  justify-content: space-between;
}
</style>
