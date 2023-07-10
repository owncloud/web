<template>
  <main>
    <app-top-bar :resource="resource" @close="closeApp" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <object class="dicom-viewer oc-width-1-1" :data="url" type="application/dcm" />
    </div>
  </main>
</template>
<script lang="ts">
import { useAppDefaults } from 'web-pkg/src/composables'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DICOMViewer',
  components: {
    ErrorScreen,
    LoadingScreen,
    AppTopBar
  },
  setup() {
    return {
      ...useAppDefaults({
        applicationId: 'dicom-viewer'
      })
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
        this.unloadDicom()
        this.loadDicom(this.currentFileContext)
      },
      immediate: true
    }
  },
  beforeUnmount() {
    this.unloadDicom()
  },
  methods: {
    async loadDicom(fileContext) {
      try {
        this.loading = true
        const resource = await this.getFileInfo(fileContext)

        if (resource.mimeType !== 'application/dcm') {
          return
        }

        this.resource = resource
        this.replaceInvalidFileRoute(this.currentFileContext, this.resource)
        this.url = await this.getUrlForResource(fileContext.space, this.resource, {
          disposition: 'inline'
        })
      } catch (e) {
        this.loadingError = true
        console.error('Error fetching DICOM file', e)
      } finally {
        this.loading = false
      }
    },
    unloadDicom() {
      this.revokeUrl(this.url)
    }
  }
})
</script>
<style scoped>
.dicom-viewer {
  border: 10px solid green;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: calc(100% - 52px);
}
</style>
