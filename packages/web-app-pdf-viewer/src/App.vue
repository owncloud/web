<template>
  <main>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <app-top-bar :resource="resource" @close="closeApp" />
      <object class="pdf-viewer oc-width-1-1" :data="blobUrl" type="application/pdf" />
    </div>
  </main>
</template>
<script>
import { mapGetters } from 'vuex'
import { useAppDefaults } from 'web-pkg/src/composables'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import { buildResource } from 'files/src/helpers/resources'

export default {
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
    blobUrl: '',
    resource: {}
  }),
  computed: {
    ...mapGetters(['getToken'])
  },
  created() {
    this.loadPdf(this.currentFileContext)
  },
  beforeDestroy() {
    this.unloadPdf()
  },
  methods: {
    async loadPdf(fileContext) {
      try {
        this.loading = true
        const response = await this.getFileContents(fileContext.path, { responseType: 'blob' })
        this.blobUrl = URL.createObjectURL(response.body)
        const fileInfo = await this.getFileInfo(fileContext.path, {})
        this.resource = buildResource(fileInfo)
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
  height: calc(100% - 52px);
}
</style>
