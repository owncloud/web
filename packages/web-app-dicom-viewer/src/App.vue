<template>
  <main>
    <!--
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    -->
    <app-top-bar :resource="resource" @close="closeApp" />

    <!-- note: preview app also lets user download file directly from this view -> see button nested in
    app-top-bar. is this feature also desired for dicom viewer?
    -->
    <loading-screen v-if="loading" />

    <!-- alternative implementaion of loading screen from preview app, integrated in this vue
    <div v-if="true" class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
    </div>

    -->
    <error-screen v-if="loadingError" />

    <div v-else class="oc-height-1-1">
      <SimpleDicomViewerScreen />
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
import SimpleDicomViewerScreen from './components/SimpleDicomViewerScreen.vue'
import { useAppDefaults } from 'web-pkg/src/composables'
import { defineComponent } from 'vue'

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
  computed: {
    pageTitle() {
      console.log('preview title rendered')
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
      try {
        this.loading = true
        // for debugging only
        console.log('try loading resource')

        const resource = await this.getFileInfo(fileContext)
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
        this.loadingError = true
        console.error('Error fetching DICOM file', e)
      } finally {
        this.loading = false
        // for testing only
        console.log('loading resource completed: ' + !this.loading)
        // it seems like this function gets called twice, check why
        // this is also the case for pdf viewer....
      }
    },
    unloadDicom() {
      this.revokeUrl(this.url)
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
