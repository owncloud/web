/* from PDF viewer */
<template>
  <main>
    <app-top-bar :resource="resource" @close="closeApp" />
    <!-- note: preview app also lets user download file directly from this view -> see button nested in
    app-top-bar. is this feature also desired for dicom viewer? -->

    <loading-screen v-if="loading" />

    <!-- alternative implementaion of loading screen from preview app, integrated in this vue
    <div v-if="true" class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
    </div>
    -->

    <error-screen v-if="loadingError" />

    <!--
    <simple-dicom-viewer-screen />
    <SimpleDicomViewerScreen />
    -->
    <div v-else class="oc-height-1-1 dicom-viewer">
      <h1>DICOM file placeholder</h1>
      <!--
      <object class="dicom-viewer oc-width-1-1" :data="url" type="application/dicom" />
      -->
    </div>
  </main>
</template>

<script lang="ts">
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
//import SimpleDicomViewerScreen from './components/SimpleDicomViewerScreen.vue'
import { useAppDefaults } from 'web-pkg/src/composables'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DICOMViewer',
  components: {
    ErrorScreen,
    LoadingScreen,
    AppTopBar
  },
  setup() {
    /* no full screen handing so far, see preview app for reference of implementation */

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
  })
  /*
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

        if (resource.mimeType !== ('application/dicom' || 'application/octet-stream' || 'application/dicom+xml' || 'application/json')) {
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
  */
})
</script>
<style lang="scss" scoped>
.dicom-viewer {
  border: 10px solid green; // just for testing
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: calc(100% - 52px);
}

// from preview player as reference
.preview-player {
  overflow: auto;
  max-width: 90vw;
  height: 70vh;
  margin: 10px auto;
  object-fit: contain;

  img,
  video {
    max-width: 85vw;
    max-height: 65vh;
  }
}
</style>
