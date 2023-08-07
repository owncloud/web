<template>
  <main>
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <app-top-bar :resource="resource" @close="closeApp">
      <!-- download button for direct download of files, analog to preview app -->
      <template #right>
        <oc-button
          v-if="!isLoadingError"
          class="preview-download"
          size="small"
          :aria-label="$gettext('Download currently viewed file')"
          @click="triggerDicomFileDownload"
        >
          <oc-icon size="small" name="file-download" />
        </oc-button>
      </template>
    </app-top-bar>

    <loading-screen v-if="isLoading" />

    <!-- alternative implementaion of loading screen from preview app, integrated in this vue
    <div v-if="true" class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
    </div>
    -->

    <error-screen v-if="isLoadingError" />

    <div v-else class="oc-height-1-1">
      <SimpleDicomViewerScreen v-if="!isLoadingError" :resource="resource" />

      <!--
      <SimpleDicomViewerScreen v-bind:dummydata="dummydata" />
      <object class="dicom-viewer oc-width-1-1" :data="url" type="application/dicom" />
      -->
    </div>
  </main>
</template>

<script lang="ts">
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from './components/ErrorScreen.vue'
import LoadingScreen from './components/LoadingScreen.vue'
import SimpleDicomViewerScreen from './components/SimpleDicomViewerScreen.vue'
import { useAppDefaults } from 'web-pkg/src/composables'
import { useDownloadFile } from 'web-pkg/src/composables/download/useDownloadFile'
import { defineComponent } from 'vue'
import { Resource } from 'web-client/src'

export default defineComponent({
  name: 'DICOMViewer',
  components: {
    ErrorScreen,
    LoadingScreen,
    AppTopBar,
    SimpleDicomViewerScreen
  },
  setup() {
    /* no full screen handing so far, see preview app for reference of implementation */
    return {
      ...useAppDefaults({
        applicationId: 'dicom-viewer'
      }),
      ...useDownloadFile()
    }
  },
  data() {
    return {
      isLoading: true,
      isLoadingError: false,
      url: '',
      resource: null,
      dummydata: 'test' // for testing only
    }
  },
  watch: {
    currentFileContext: {
      handler: function () {
        this.unloadDicom()
        this.loadDicom(this.currentFileContext)
      },
      immediate: true
    }
  },
  computed: {
    pageTitle() {
      return this.$gettext('Preview for %{resourceName}', {
        resourceName: this.resource.name
      })
    }
  },
  beforeUnmount() {
    this.unloadDicom()
  },
  methods: {
    async loadDicom(fileContext) {
      // for testing only
      //console.log('print dummy data from app.vue ' + this.dummydata)
      if (this.resource != null) {
        console.log('print resource name from app.vue: ' + this.resource.name)
      } else {
        console.log('no resource test data available yet')
      }

      try {
        this.isLoading = true
        const resource = (await this.getFileInfo(fileContext)) as Resource

        // for debugging only
        console.log('resource loaded: ' + resource.name)
        console.log('resource type: ' + resource.mimeType)

        if (
          resource.mimeType !==
          ('application/octet-stream' ||
            'application/dicom' ||
            'application/dicom+xml' ||
            'application/json')
        ) {
          console.log('no valid resource mime type')
          // it seems that if mime type is not the first one listed above, this clause fails
          return
        }

        this.resource = resource
        this.replaceInvalidFileRoute(this.currentFileContext, this.resource)
        this.url = await this.getUrlForResource(fileContext.space, this.resource, {
          disposition: 'inline'
        })
      } catch (e) {
        this.isLoadingError = true
        console.error('Error fetching DICOM file', e)
      } finally {
        this.isLoading = false
      }

      // it seems like this function gets called twice when loading a resource, check why
      // this is also the case for pdf viewer....
    },
    unloadDicom() {
      this.revokeUrl(this.url)
    },
    triggerDicomFileDownload() {
      if (this.isLoading) {
        return
      }

      return this.downloadFile(this.resource)
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
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
