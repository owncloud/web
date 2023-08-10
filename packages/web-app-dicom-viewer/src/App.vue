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

    <div
      v-else
      id="dicom-viewer"
      class="oc-height-1-1 oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium dicom-viewer"
    >
      <div ref="canvas" id="dicom-canvas" class="dicom-canvas"></div>
    </div>
    <!--
      <SimpleDicomViewerScreen
        v-if="!isLoadingError"
        :resource="resource"
        @dicomResourceLoaded="dicomResourceLoaded($event)"
      />
      -->

    <!--
      <SimpleDicomViewerScreen v-bind:dummydata="dummydata" />
      <object class="dicom-viewer oc-width-1-1" :data="url" type="application/dicom" />
      -->
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

import type { PropType } from 'vue'
import { RenderingEngine, Types, Enums, metaData, init } from '@cornerstonejs/core'

// import cornerstone packages
import Hammer from 'hammerjs'
import dicomParser from 'dicom-parser'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'

// declaring some const & references
const { ViewportType } = Enums

// specify external dependencies
cornerstoneTools.external.Hammer = Hammer
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser

// configure cornerstone dicom image loader
const { preferSizeOverAccuracy, useNorm16Texture } = cornerstone.getConfiguration().rendering
cornerstoneDICOMImageLoader.configure({
  useWebWorkers: true,
  decodeConfig: {
    convertFloatPixelDataToInt: false,
    use16BitDataType: preferSizeOverAccuracy || useNorm16Texture
  }
})

// configure web worker framework
var config = {
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true,
  webWorkerTaskPaths: [], // this and the following config items are added from an sample
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: true,
      strict: true
    }
  }
}

// add try catch
try {
  cornerstoneDICOMImageLoader.webWorkerManager.initialize(config)
} catch (e) {
  console.error('Error initializing web worker manager', e)
  console.log('dicom image loader - web worker manager not initialized')
} finally {
  // is finally needed needed?
  console.log('dicom image loader - web worker manager initialized')
}

// register image loader
// "loadImage" is used for stack, "createAndCacheVolume" for volumes
// see also https://www.cornerstonejs.org/docs/tutorials/basic-volume
cornerstone.registerImageLoader('http', cornerstoneDICOMImageLoader.loadImage)
cornerstone.registerImageLoader('https', cornerstoneDICOMImageLoader.loadImage)

// -----------------------------
// export
// -----------------------------

export default defineComponent({
  name: 'DICOMViewer',
  components: {
    ErrorScreen,
    LoadingScreen,
    AppTopBar
    //SimpleDicomViewerScreen
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
      // variables for dicom
      isCornerstoneInitialized: false,
      isDicomFileLoaded: false, // same as isLoading?!?
      wadouriURLprefix: 'wadouri:',
      element: null,
      renderingEngineId: 'dicomRenderingEngine',
      imageId: '',
      // for testing only
      dummydata: 'test'
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
  created() {
    // console.log('simple DICOM viewer screen "created" hook called')
  },
  async mounted() {
    //console.log('simple DICOM viewer screen "mounted" hook called')
    console.log('cornerstone init status: ' + this.isCornerstoneInitialized)

    // check if cornerstone core and tools are initalized
    if (!this.isCornerstoneInitialized) {
      // initalize cornerstone core
      console.log('mounted: cornerstone not initialised, trigger initialisation')
      await this.initCornerstoneCore()
    }

    // set reference to HTML element for viewport
    this.element = document.getElementById('dicom-canvas') as HTMLDivElement

    /*
    // for testing only
    if (this.resource != null) {
      console.log('recource received: ' + this.resource.name)

      this.isDicomFileLoaded = true
    } else {
      console.log('no resource test data available')
    }
    */
  },
  computed: {
    pageTitle() {
      if (this.resource != null) {
        return this.$gettext('Preview for %{resourceName}', {
          resourceName: this.resource.name
        })
      } else {
        console.log('no resource loaded, thus no preview title available')
        return 'no preview title available'
      }
    }
  },
  beforeUnmount() {
    this.unloadDicom()
  },
  methods: {
    async loadDicom(fileContext) {
      /*
      // for testing only
      //console.log('print dummy data from app.vue ' + this.dummydata)
      if (this.resource != null) {
        console.log('print resource name from app.vue: ' + this.resource.name)
      } else {
        console.log('no resource test data available yet')
      }
      */

      try {
        this.isLoading = true
        const resource = (await this.getFileInfo(fileContext)) as Resource

        /*
        // for debugging only
        console.log('resource loaded: ' + resource.name)
        console.log('resource type: ' + resource.mimeType)

        // for testing only log some data of the current resource
        console.log('resource size: ' + resource.size)
        console.log('resource path: ' + resource.path)
        console.log('resource download url: ' + resource.downloadURL)
        console.log('resource is mounted: ' + resource.isMounted())
        console.log('resource owner: ' + resource.resourceOwner)
        console.log('resource owner display name: ' + resource.ownerDisplayName)
        console.log('resource tags: ')
        if (resource.tags.length < 1) {
          console.log('- no tags')
        } else {
          for (const tag in resource.tags) {
            console.log('- ' + (tag as String))
          }
        }
        */

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
        console.log('file url: ' + this.url) // format: blob:https://host.docker.internal:9201/8eb3e615-b8c5-45f1-9647-37f562c5a8ae
        //this.dicomResourceLoaded(resource) // only used to transfer data to child component
      } catch (e) {
        this.isLoadingError = true
        console.error('Error fetching DICOM file', e)
      } finally {
        this.isLoading = false
        console.log('dicom file successfully loaded: ' + this.resource.name)
        // display the dicom file
        this.displayDicom()
      }

      // it seems like this function gets called twice when loading a resource, check why
      // this is also the case for pdf viewer....
    },
    async displayDicom() {
      // check again if cornerstone core and tools are initalized
      if (!this.isCornerstoneInitialized) {
        // initalize cornerstone core
        console.log('display dicom function: cornerstone not initialised, trigger initialisation')
        await this.initCornerstoneCore()
      }

      // set reference to HTML element for viewport
      //const element = document.getElementById('dicom-canvas') as HTMLDivElement
      //console.log('getting ' + this.element + ' with ID: ' + this.element.id)

      // instantiate/register rendering engine
      //const renderingEngineId = 'dicomRenderingEngine'
      const renderingEngine = new RenderingEngine(this.renderingEngineId) // triggers error: @cornerstonejs/core is not initalized
      console.log('render engine instantiated')

      // ensure that dicom file is loaded before proceeding
      if (!this.isLoading) {
        console.log('this url: ' + this.url)
        const url = this.addWadouriPrefix(this.url) // this.resource.name
        console.log('url: ' + url)
        this.imageId = await cornerstoneDICOMImageLoader.wadouri.fileManager.add(url) // this.dicomFile
        console.log('image id / path: ' + this.imageId)
      } else {
        console.log('loading resource...')
      }

      // create a stack viewport
      const { ViewportType } = Enums

      const viewportId = 'CT_STACK' // additional types of viewports see: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/
      const element = this.element
      console.log('element id: ' + element.id)

      const viewportInput = {
        viewportId,
        type: ViewportType.STACK,
        element,
        defaultOptions: {
          background: <Types.Point3>[0.2, 0, 0.2]
          // more settings, TODO: check what other settings are needed
          // orientation: Enums.OrientationAxis.AXIAL,
        }
      }

      // enable element
      renderingEngine.enableElement(viewportInput)
      console.log('element (& viewport id & rendering engine id) enabled')

      // get stack viewport that was created
      //const viewport = renderingEngine.getViewport('Types.IStackViewport') as cornerstone.StackViewport
      // const viewportx = renderingEngine.getViewport(ViewportType.STACK) as cornerstone.StackViewport
      // console.log('viewportx type: ' + typeof viewportx) // undefined
      // alternative syntax from cornerstone 3D demo
      const viewport = <Types.IStackViewport>renderingEngine.getViewport(viewportId)
      //console.log('viewport type: ' + typeof viewport) // object

      // define a stack containing a single image
      const dicomStack = [this.imageId]
      console.log('number of items in stack: ' + dicomStack.length)

      // check if viewport is active
      //console.log('is viewport enabled? ' + !viewport.isDisabled)

      // render the image
      // updates every viewport in the rendering engine
      viewport.render()

      //viewport.resize()

      // -----------------------------
      // insert code above
      // -----------------------------
    },
    unloadDicom() {
      this.revokeUrl(this.url)
    },
    // only used if resource should get passed on to child component
    dicomResourceLoaded(r) {
      console.log('resource ready? ' + r != null)
      if (r != null) {
        console.log('resource loaded name ' + r.name)
      }
      this.resource = r
      // trigger here the display of the file!!!
    },
    triggerDicomFileDownload() {
      if (this.isLoading) {
        return
      }

      return this.downloadFile(this.resource)
    },
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
      } catch (e) {
        console.error('Error initalizing cornerstone core (renderer?)', e)
        console.log('error in initalizing cornerstone core') // for debugging purpose only, delete later
      } finally {
        this.isCornerstoneInitialized = true
        console.log('cornerstone core initalized')
      }
    },
    addWadouriPrefix(path: String) {
      console.log('wadouri prefix added: ' + this.wadouriURLprefix + path)
      return this.wadouriURLprefix + path
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-viewer {
  border: 10px solid blue;
  height: calc(100% - 52px);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.dicom-canvas {
  border: 10px solid yellow;
  width: 2000px; // 100%;
  height: 500px; // 100%;
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
