<template>
  <!--
  // more css classes from preview app
  :class="{ lightbox: isFullScreenModeActivated }
  -->
  <div
    id="dicom-viewer"
    class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium dicom-viewer"
  >
    <div ref="canvas" class="dicom-canvas"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ref } from 'vue'
import { RenderingEngine, Types, Enums, metaData } from '@cornerstonejs/core'
//import uids from '../helpers/uids'

// import cornerstone packages
import Hammer from 'hammerjs'
import dicomParser from 'dicom-parser'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'

// specify external dependencies
cornerstoneTools.external.Hammer = Hammer
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser

// init providers?

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
  startWebWorkersOnDemand: true
}
cornerstoneDICOMImageLoader.webWorkerManager.initialize(config)

//alternative Cornerstone DICOM Image Loader init from example
/*
let maxWebWorkers = 1

if (navigator.hardwareConcurrency) {
  maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7)
}

var config = {
  maxWebWorkers,
  startWebWorkersOnDemand: false,
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false,
      strict: false,
    },
  },
}

cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
*/

// init volume loader?

// cornerstone render init & tools init? --> see cornerstone 3D demo

cornerstone.registerImageLoader('http', cornerstoneDICOMImageLoader.loadImage)
cornerstone.registerImageLoader('https', cornerstoneDICOMImageLoader.loadImage)

/*
// TODO: get image ids and metadata into RAM --> see cornerstone 3D demo
const imageIds = []
const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add('../MRBRAIN.dcm')

// fetch metadata
// await cornerstoneDICOMImageLoader.wadouri.loadImage(imageId).promise;

console.log('cornerstone imageID' + imageId)
imageIds[0] = imageId
console.log('cornerstone imageID' + imageIds[0])
*/

/*
// init tools
const csTools = cornerstoneTools.init()


// instantiate rendering engine
const renderingEngineId = 'dicomRenderingEngine'
const renderingEngine = new RenderingEngine(renderingEngineId)
*/

/*
// create a stack viewport
const { ViewportType } = Enums
const element = document.createElement('div') // TODO: set reference to the canvas element

const viewportId = 'CT_STACK' // additional types of viewports: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/
const viewportInput = {
  viewportId,
  type: ViewportType.STACK,
  element,
  defaultOptions: {
    background: <Types.Point3>[0.2, 0, 0.2]
  }
}

renderingEngine.enableElement(viewportInput)

// get stack viewport that was created
const viewport = <Types.IStackViewport>renderingEngine.getViewport(viewportId)

// define a stack containing a single image
const stack = [imageIds[0]]

// set stack on the viewport
// TODO: put everything into a async function
// await viewport.setStack(stack)

// set the VOI of the stack
// viewport.setProperties({ voiRange: ctVoiRange })

// render the image
viewport.render()
*/

export default defineComponent({
  name: 'SimpleDicomViewerScreen'
  /*,
  setup() {},

  data: () => ({
    // from example code
    baseUrl: '',
    exampleStudyImageIds: '',
    isInitLoad: true,
    isShow: true
  }),

  computed: {},
  watch: {},
  created() {},
  created() {
    cornerstoneTools.init({
      globalToolSyncEnabled: true
    })
  mounted() {
    let _self = this
    /*
    this.listenForWindowResize()
    */

  // enable canvas
  //let canvas = this.$refs.canvas
  /*
    cornerstone.enable(canvas)

    const imageIds = await createImageIdsAndCacheMetaData({
      StudyInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
      SeriesInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
      wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'
    })


    //this.show()
  },
  beforeUnmount() {},
  methods: {
    /*
    // window resize methods
    listenForWindowResize: function () {
      this.$nextTick(function () {
        window.addEventListener('resize', this.debounce(this.onWindowResize, 100))
      })
    },
    onWindowResize: function () {
      cornerstone.resize(this.$refs.canvas, true)
    },
    // utility methods
    debounce: function (func, wait, immediate) {
      var timeout
      return function () {
        var context = this
        var args = arguments
        var later = function () {
          timeout = null
          if (!immediate) func.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
      }
    }
    //show() {}
  }
  */
})

/*
data () {
    return {
      baseUrl: 'http://localhost:8080',
      // Pass in as a property, or use a computed property that looks at Vuex
      // Then... Watch for changes. On change, load the new series
      exampleStudyImageIds: [
        '/static/simple-study/1.2.276.0.74.3.1167540280.200511.112514.1.1.4.jpg',
        '/static/simple-study/1.2.276.0.74.3.1167540280.200511.112514.1.1.5.jpg',
        '/static/simple-study/1.2.276.0.74.3.1167540280.200511.112514.1.1.6.jpg',
        '/static/simple-study/1.2.276.0.74.3.1167540280.200511.112514.1.1.7.jpg',
        '/static/simple-study/1.2.276.0.74.3.1167540280.200511.112514.1.1.9.jpg',
        '/static/simple-study/1.2.276.0.74.3.1167540280.200511.112514.1.1.10.jpg'
      ],
      isInitLoad: true
    }
  },
  mounted () {
    let _self = this
    // this.listenForCornerstoneImageRendered()
    // this.listenForCornerstoneImageLoaded()
    this.listenForWindowResize()

    // Enable Canvas
    let canvas = this.$refs.canvas
    cornerstone.enable(canvas)

    // ImageId that matches our registered image loader's 'http:' prefix
    // The webImageLoader uses this to make an xhr request to fetch an image
    // Under the hood, it creates a cornerstone "Image" object needed for display
    const imageUrl = this.baseUrl + this.exampleStudyImageIds[0]
    cornerstone.loadImage(imageUrl).then(function (image) {
      // Display our loaded image on the target canvas
      cornerstone.displayImage(canvas, image)

      // TODO: It really should be possible to "turn on tools" before an image is loaded
      if (_self.isInitLoad) {
        _self.initCanvasTools()
      }
    })
  },
  beforeDestroy () {
    // Remove jQuery event listeners
    let canvas = this.$refs.canvas
    $(canvas).off()
  },
  methods: {
    initCanvasTools: function () {
      let _self = this
      let canvas = this.$refs.canvas

      this.isInitLoad = false

      // Find imageIds for canvasStack
      let allImageIds = []
      this.exampleStudyImageIds.forEach(function (imageId) {
        let imageUrl = _self.baseUrl + imageId
        allImageIds.push(imageUrl)
      })

      // Create canvasStack
      let canvasStack = {
        currentImageIdIndex: 0,
        imageIds: allImageIds
      }

      // Enable Inputs
      cornerstoneTools.mouseInput.enable(canvas)
      cornerstoneTools.mouseWheelInput.enable(canvas)
      cornerstoneTools.touchInput.enable(canvas)

      // Set the stack as tool state
      cornerstoneTools.addStackStateManager(canvas, ['stack'])
      cornerstoneTools.addToolState(canvas, 'stack', canvasStack)
      cornerstoneTools.stackScrollWheel.activate(canvas)  // Mouse wheel
      cornerstoneTools.scrollIndicator.enable(canvas) // Position indicator

      // Mouse
      cornerstoneTools.wwwc.activate(canvas, 1) // left click
      cornerstoneTools.pan.activate(canvas, 2) // middle click
      cornerstoneTools.zoom.activate(canvas, 4) // right click

      // Touch / Gesture
      cornerstoneTools.wwwcTouchDrag.activate(canvas) // - Drag
      cornerstoneTools.zoomTouchPinch.activate(canvas) // - Pinch
      cornerstoneTools.panMultiTouch.activate(canvas) // - Multi (x2)
    },
    /*
     * Window Resize
     *
    */

/*
    listenForWindowResize: function () {
      this.$nextTick(function () {
        window.addEventListener('resize', this.debounce(this.onWindowResize, 100))
      })
    },
    onWindowResize: function () {
      cornerstone.resize(this.$refs.canvas, true)
    },
    */

/*
 * Utility Methods
 *
 */
/*
    debounce: function (func, wait, immediate) {
      var timeout
      return function () {
        var context = this
        var args = arguments
        var later = function () {
          timeout = null
          if (!immediate) func.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
      }
    }
  }
  */

/*
// get metadata
const imageData = viewport.getImageData()

const { pixelRepresentation, bitsAllocated, bitsStored, highBit, photometricInterpretation } =
  metaData.get('imagePixelModule', imageId)
const voiLutModuleLocal = metaData.get('voiLutModule', imageId)
const sopCommonModule = metaData.get('sopCommonModule', imageId)
const transferSyntax = metaData.get('transferSyntax', imageId)

// extract data --> see DICOM P10 example (local/index.ts) & https://www.cornerstonejs.org/live-examples/local.html

//transfer syntax
//transferSyntax.transferSyntaxUID

//sop class uid
//sopCommonModule.sopClassUID
//uids[sopCommonModule.sopClassUID]

//sop instance uid
//sopCommonModule.sopInstanceUID

//rows
//imageData.dimensions[0]

//columns
//imageData.dimensions[1]

//spacing
//imageData.spacing.join('\\')

//direction
// imageData.direction.map((x) => Math.round(x * 100) / 100).join(',')

//origin
//imageData.origin.map((x) => Math.round(x * 100) / 100).join(',')

//modality
//imageData.metadata.Modality

//pixel representation
//pixelRepresentation

//bits allocated
//bitsAllocated

//bits stored
//bitsStored

//high bit
//highBit

//photometric interpretation
//photometricInterpretation

//window width
//voiLutModuleLocal.windowWidth

//window center
//voiLutModuleLocal.windowCenter
*/

/*
$(document).ready(function() {
        var imageId = 'example://1';
        var element = document.getElementById('dicomImage');
        cornerstone.enable(element);
        cornerstone.loadImage(imageId).then(function(image) {
            cornerstone.displayImage(element, image);
        });
    });
*/
</script>

<style lang="scss" scoped>
.dicom-viewer {
  border: 10px solid blue;
  height: calc(100% - 52px);
}

.dicom-canvas {
  border: 10px solid yellow;
  width: 500px; //100%;
  height: 500px; //100%;
}
</style>

<!--
<script lang="ts"></script>

export default {
  name: 'SimpleDicomViewerScreen'
  /*
  ,


    // Grab Tool Classes
    const WwwcTool = cornerstoneTools.WwwcTool
    const PanTool = cornerstoneTools.PanTool
    const PanMultiTouchTool = cornerstoneTools.PanMultiTouchTool
    const ZoomTool = cornerstoneTools.ZoomTool
    const ZoomTouchPinchTool = cornerstoneTools.ZoomTouchPinchTool
    const ZoomMouseWheelTool = cornerstoneTools.ZoomMouseWheelTool

    // Add them
    cornerstoneTools.addTool(PanTool)
    cornerstoneTools.addTool(ZoomTool)
    cornerstoneTools.addTool(WwwcTool)
    cornerstoneTools.addTool(PanMultiTouchTool)
    cornerstoneTools.addTool(ZoomTouchPinchTool)
    cornerstoneTools.addTool(ZoomMouseWheelTool)

    // Set tool modes
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 4 }) // Middle
    cornerstoneTools.setToolActive('Zoom', { mouseButtonMask: 2 }) // Right
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 }) // Left & Touch
    cornerstoneTools.setToolActive('PanMultiTouch', {})
    cornerstoneTools.setToolActive('ZoomMouseWheel', {})
    cornerstoneTools.setToolActive('ZoomTouchPinch', {})
  },
  mounted() {
    // Enable Canvas
    /*
    this.canvas = this.$refs.canvas
    cornerstone.enable(this.canvas, {
      renderer: 'webgl'
    })
    */
  // Load Image
  /*
    const codeSandboxProjectUrl = 'https://9z04x8ykjr.codesandbox.io'
    const imageId = `wadouri:${codeSandboxProjectUrl}/000000.dcm`
    cornerstone.loadImage(imageId).then((image) => {
      cornerstone.displayImage(this.canvas, image)
    })

  }
}
</script>
-->
