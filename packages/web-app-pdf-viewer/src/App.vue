<template>
  <main>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <div class="oc-flex oc-p-s pdf-viewer-tool-bar">
        <oc-spinner v-if="loadResourceTask.isRunning" />
        <oc-resource v-else :resource="resource" />
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
import { ref } from '@vue/composition-api'
import { clientService } from 'web-pkg/src/services'
import { useTask } from 'vue-concurrency'

export default {
  name: 'PDFViewer',
  components: {
    ErrorScreen,
    LoadingScreen
  },
  setup() {
    const resource = ref([])
    const sdk = clientService.owncloudSdk

    const loadResourceTask = useTask(function* (signal, ref) {
      const response = yield sdk.files.fileInfo(ref.currentFileContext.path)
      resource.value = buildResource(response)
    })

    return {
      loadResourceTask,
      resource,
      ...useAppDefaults({
        applicationId: 'pdf-viewer'
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
  async mounted() {
    await this.loadResourceTask.perform(this)
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
