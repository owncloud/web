<template>
  <!-- check ouf if definition of type="application/octet-stream" plus "application/dcm" might be needed below -->
  <div class="dicom-viewer oc-width-1-1 oc-height-1-1">
    <!-- check ouf if the classes of the div below are still accurate/needed -->
    <div
      class="oc-height-1-1 oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium"
    >
      <!-- div element for dicom viewport -->
      <div id="dicom-canvas" class="dicom-canvas"></div>
    </div>
  </div>
</template>

<script lang="ts">
// import cornerstone packages
import Hammer from 'hammerjs'
import dicomParser from 'dicom-parser'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'

import { RenderingEngine, Types, Enums } from '@cornerstonejs/core'

// vue imports
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

// other imports
import { Resource } from 'web-client/src'
//import { any } from 'jest-mock-extended'

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
  // the following config items are added from a sample - TODO: further look into the specifics of the configuration
  webWorkerTaskPaths: [],
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: true,
      strict: true
    }
  }
}

try {
  cornerstoneDICOMImageLoader.webWorkerManager.initialize(config)
} catch (e) {
  console.error('Error initializing cornerstone web worker manager', e)
}

// register image loader
// "loadImage" is used for stack, "createAndCacheVolume" for volumes (not needed at this point, maybe later...)
// see also https://www.cornerstonejs.org/docs/tutorials/basic-volume
cornerstone.registerImageLoader('http', cornerstoneDICOMImageLoader.loadImage)
cornerstone.registerImageLoader('https', cornerstoneDICOMImageLoader.loadImage)

export default defineComponent({
  name: 'DicomViewer', // seems like this is not needed anymore for streamlined apps?!?
  components: {}, // only needed if there are child components
  setup() {}, // maybe not needed with the streamlined version
  props: {
    url: {
      type: String,
      required: true
    },
    currentContent: {
      type: String,
      required: true
    },
    resource: {
      type: Object as PropType<Resource>,
      default: null
    }
  },
  data() {
    return {
      isCornerstoneInitialized: false,
      element: null,
      viewport: null
    }
  },
  watch: {}, // most likely not needed
  // runs before DOM is rendered, data and events are already accessible
  created() {},
  // called when component has been added to DOM-
  async mounted() {
    console.log('cornerstone init status: ' + this.isCornerstoneInitialized)

    // check if cornerstone core and tools are initalized
    if (!this.isCornerstoneInitialized) {
      // initalize cornerstone core
      await this.initCornerstoneCore()
    }

    // set reference to HTML element for viewport
    this.element = document.getElementById('dicom-canvas') as HTMLDivElement
  },
  // implementing any change in the component
  async beforeUpdate() {
    // instantiate/register rendering engine
    const renderingEngine = new RenderingEngine('dicomRenderingEngine')
    // console.log('render engine instantiated')

    // logging some data
    console.log(
      'url length: ' +
        (this.url as String).length +
        ' / ' +
        typeof this.url + // string
        ' / this url: ' +
        this.url
    )
    console.log('current content: ' + this.currentContent + ' / ' + typeof this.currentContent) // string
    console.log('resource name: ' + this.resource.name)

    let dicomImage = this.url.replace('blob', 'wadouri')
    console.log('modified url: ' + dicomImage)

    // get resource
    // only needed if resource is passed along as file?
    let imageId = await cornerstoneDICOMImageLoader.wadouri.fileManager.add(this.currentContent)

    // create a stack viewport
    const { ViewportType } = Enums

    const viewportId = 'CT_STACK' // additional types of viewports see: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/
    const element = this.element
    // console.log('element id: ' + element.id)

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
    // console.log('element (& viewport id & rendering engine id) enabled')

    // get stack viewport that was created
    this.viewport = <Types.IStackViewport>renderingEngine.getViewport(viewportId)

    // define a stack containing a single image
    const dicomStack = [imageId] //dicomImage imageId
    console.log('number of items in stack: ' + dicomStack.length)
    console.log('first stack item: ' + dicomStack[0])

    // set stack on the viewport (only one image in the stack, therefore no frame # required)
    await this.viewport.setStack(dicomStack)

    // render the image
    // updates every viewport in the rendering engine
    //
    this.viewport.render()
  },
  // updated gets called anytime some change is made in the component
  updated() {
    // console.log('update')
    // this.viewport.resize()
  },
  // cleaning up component, leaving no variables or events that could cause memory leaks to app
  beforeUnmount() {},
  methods: {
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
      } catch (e) {
        console.error('Error initalizing cornerstone core', e)
      } finally {
        this.isCornerstoneInitialized = true
      }
    }
    /*
    ,
    async waitingForURL() {
      console.log('waiting for URL...')

      let i = 0
      let size = (this.url as String).length
      console.log('url length: ' + size)
      console.log('i: ' + i)
      while (i < 3) {
        this.$nextTick(() => {
          size = (this.url as String).length
          console.log('i: ' + i)
          console.log('url length: ' + size)
          console.log('url : ' + this.url)
          i++
        })
      }

      console.log('url length: ' + size)
    }
    */
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

#dicom-viewer {
  border: 10px solid blue; // none
  height: 100%; //calc(100% - 52px);
}

.dicom-canvas {
  border: 10px solid yellow; //none
  width: 500px; // 100%;
  height: 500px; // 100%;
}
</style>
