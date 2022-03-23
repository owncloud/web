<template>
  <main>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <object
      v-else
      class="pdf-viewer oc-width-1-1 oc-height-1-1"
      :data="blobUrl"
      type="application/pdf"
    />
  </main>
</template>
<script>
import { mapGetters } from 'vuex'
import { useAppDefaults } from 'web-pkg/src/composables'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'

export default {
  name: 'PDFViewer',
  components: {
    ErrorScreen,
    LoadingScreen
  },
  setup() {
    return {
      ...useAppDefaults({
        applicationName: 'pdf-viewer'
      })
    }
  },
  data: () => ({
    loading: true,
    loadingError: false,
    filePath: '',
    blobUrl: ''
  }),
  computed: {
    ...mapGetters(['getToken'])
  },
  created() {
    this.loadPdf(this.currentFileContext)
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
}
</style>
