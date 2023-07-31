<template>
  <!--
  // more css classes from preview app
  :class="{ lightbox: isFullScreenModeActivated }
  -->
  <form ref="form" style="margin-bottom: 20px">
    <p>file upload</p>
    <input
      id="select-dicom-file"
      type="file"
      @change="displayDicomFile"
      multiple
      tabindex="-1"
      accept="application/dicom, application/octet-stream"
    />
  </form>
  <div
    id="dicom-viewer"
    class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium dicom-viewer"
  >
    <div ref="canvas" id="dicom-canvas" class="dicom-canvas"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { ref } from 'vue'
import { RenderingEngine, Types, Enums, metaData, init } from '@cornerstonejs/core'
// import { createImageIdsAndCacheMetaData } from '../helpers/createImageIdsAndCacheMetaData.js'
// import above breaks code because of issue with dicomweb-client
// https://github.com/ImagingDataCommons/dicomweb-client/blob/master/README.md
// https://dicomweb-client.readthedocs.io/en/latest/introduction.html

//import uids from '../helpers/uids.ts'

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

// alternative Cornerstone DICOM Image Loader init
// with more configurations from cornerstone3D example code
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

// register image loader
// "loadImage" is used for stack, "createAndCacheVolume" for volumes
// see also https://www.cornerstonejs.org/docs/tutorials/basic-volume
cornerstone.registerImageLoader('http', cornerstoneDICOMImageLoader.loadImage)
cornerstone.registerImageLoader('https', cornerstoneDICOMImageLoader.loadImage)

// init providers (for metadata handling?)
// --> according to documentation, image loader also registers metaDataProvider

// init (streaming) volume loader?!?

export default defineComponent({
  name: 'SimpleDicomViewerScreen',
  /*
  components: {}, // maybe not used for this component
  mixins: [componentMixin], // not used in this component
  */
  props: {
    //properties of this component
    counter: {
      // for testing only
      type: Number,
      default: 0
    },
    dicomImagePath: {
      // static path to dicom image placeholder, for testing only
      type: String,
      default: 'https://jankaritech.ocloud.de/index.php/s/aUgMrN6SRIvFGWw' //'../MRBRAIN.dcm'
    },
    dicomFile: {
      // static path to dicom image placeholder, for testing only
      type: File,
      default: '../MRBRAIN.dcm'
    }
  },
  data: () => ({
    // from example code
    baseUrl: '',
    exampleStudyImageIds: '',
    isShow: true,
    // from PDF viewer
    loading: true,
    loadingError: false,
    url: '',
    resource: null,
    // own variables
    isCornerstoneInitialized: false
  }),
  /*
  setup() {}, // maybe not needed in this component
  */
  computed: {
    // for testing only
    isEmpty() {
      return this.counter === 0
    }
  },
  watch: {
    // something like a listener, for testing only
    counter() {
      console.log('counter value changed')
    }
  },
  created() {
    // console.log('simple DICOM viewer screen "created" hook called')
  },
  async mounted() {
    // async because of await in image loader and other functions called

    // console.log('simple DICOM viewer screen "mounted" hook called')
    console.log('cornerstone init status: ' + this.isCornerstoneInitialized)

    /*
    let _self = this

    // this.listenForCornerstoneImageRendered()
    // this.listenForCornerstoneImageLoaded()
    this.listenForWindowResize()
    */

    // enable canvas
    //let canvas = this.$refs.canvas
    //cornerstone.enable(canvas)

    // check again if cornerstone core and tools are initalized
    if (!this.isCornerstoneInitialized) {
      // initalize cornerstone core
      await this.initCornerstoneCore()
      // method above changes value of isCornerstoneInitialized...
      // TODO: consider if that shoud only be change when both init methods have passed sucessfully

      //this.initCornerstoneTools()
      // TODO: fix "error initalizing cornerstone tools TypeError: Cannot read properties of undefined (reading 'removeEventListener')" triggered by init cornerstone tools method
      // it seems like first tools should be added to a toolgroup and then the whole tool group is activated
      // see https://www.cornerstonejs.org/api/tools/function/init
    }
    // set reference to HTML element for viewport
    const element = document.getElementById('dicom-canvas') as HTMLDivElement // set reference to the canvas element or parent div?!?
    console.log('getting ' + element + ' with ID: ' + element.id)

    // instantiate/register rendering engine
    const renderingEngineId = 'dicomRenderingEngine'
    const renderingEngine = new RenderingEngine(renderingEngineId) // triggers error: @cornerstonejs/core is not initalized
    console.log('render engine instantiated')

    /*
    // check if render engine is really instantiated
    const allRenderEngines = cornerstone.getRenderingEngines()
    console.log('number of currently registered rendering engines: ' + allRenderEngines.length)
    console.log('currently registered rendering engines: ' + allRenderEngines[0].id)
    */

    /*
    // ImageId that matches our registered image loader's 'http:' prefix
    // The webImageLoader uses this to make an xhr request to fetch an image
    // Under the hood, it creates a cornerstone "Image" object needed for display
    const imageUrl = this.baseUrl + this.exampleStudyImageIds[0]
    cornerstone.loadImage(dicomImagePath).then(function (image) {
      // Display our loaded image on the target canvas
      cornerstone.displayImage(canvas, image)
    })
    */

    // get image ids and metadata into RAM using helper script from cornerstone 3D demo
    /*
    // helper function doesn't work because of dicomweb-client import
    const imageIds = await createImageIdsAndCacheMetaData({
      StudyInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
      SeriesInstanceUID: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
      wadoRsRoot: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'
    })
    */

    const imageIds = [] //as string[]

    /*
    // get file through file upload
    document.getElementById('select-dicom-file').addEventListener('change', function (e: any) {
      // Add the file to the cornerstoneFileImageLoader and get unique
      // number for that file
      const file = e.target.files[0]
      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)
      imageIds[0] = imageId
      console.log('image id: ' + imageId)
      //loadAndViewImage(imageId)
    })

    const imageId = imageIds[0]

    */

    const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(
      'wadouri:' + this.dicomImagePath
    )
    console.log('image path: ' + this.dicomImagePath)
    console.log('image id: ' + imageId)

    //const imageId = cornerstoneDICOMImageLoader.dicomweb.fileManager.add('../MRBRAIN.dcm')

    // fetch metadata
    try {
      await cornerstoneDICOMImageLoader.wadouri.loadImage(imageIds[0]).promise
      //await cornerstoneDICOMImageLoader.dicomweb.loadImage(imageId).promise
    } catch (e) {
      console.error('Error fetching DICOM meta data', e)
    } finally {
      // is finally needed needed?
      console.log('fetched DICOM meta data for ' + imageId.name)
    }

    console.log('cornerstone imageID: ' + imageId)
    imageIds[0] = imageId
    console.log('cornerstone imageID: ' + imageIds[0])

    // create a stack viewport
    const { ViewportType } = Enums

    const viewportId = 'CT_STACK' // additional types of viewports: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/

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

    // API variant 1: set Viewports
    // takes array as input --> use brackets!!!
    // renderingEngine.setViewports([viewportInput])

    // API variant 2: enable Element
    renderingEngine.enableElement(viewportInput)

    // according to the documentation (https://www.cornerstonejs.org/docs/migrationguides/#enabledelement)
    // the following elements get enabled:
    // ELEMENT_ENABLED { element, viewportId, renderingEngineId }
    console.log('element (& viewport id & rendering engine id) enabled')

    //const viewport = renderingEngine.getViewport('Types.IStackViewport') as cornerstone.StackViewport
    const viewport = renderingEngine.getViewport(ViewportType.STACK) as cornerstone.StackViewport

    // define a stack containing a single image
    const dicomStack = [imageIds[0]]

    // set stack on the viewport (only one image in the stack)
    await viewport.setStack(dicomStack)
    // check if viewport is active
    //console.log('is viewport disabled? ' + viewport.isDisabled)

    /*
    // alternative
    // set stack on the viewport with multiple imageIds
    await viewport.setStack(
      imageIds, // all image Ids
      1 // frame that should get displayed
    )
    */

    // set the VOI of the stack?
    // --> from cornerstone 3D example, check if this is needed
    // viewport.setProperties({ voiRange: ctVoiRange })

    // render the image
    // updates every viewport in the rendering engine
    renderingEngine.render()

    /*
    // Update a single viewport
    const myViewport = myScene.getViewport(viewportId)
    // TODO: check reference for "myScene"
    myViewport.render()
    */

    // cornerstone tools
    // init cornerstone tools
    //_self.initCornerstoneTools()
    /*
    cornerstoneTools.init({
      globalToolSyncEnabled: true
    })
    */
  },
  beforeDestroy() {
    // Remove jQuery event listeners --> TODO check if this is needed
    let canvas = this.$refs.canvas
    //$(canvas).off()
  },
  /*
  beforeUnmount() {},
  */
  methods: {
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
      } catch (e) {
        console.error('Error initalizing cornerstone renderer', e)
        console.log('error in initalizing cornerstone core') // for debugging purpose only, delete later
      } finally {
        this.isCornerstoneInitialized = true
        console.log('cornerstone core initalized')
      }
    },
    async initCornerstoneTools() {
      try {
        // init cornerstone tools
        await cornerstoneTools.init({
          globalToolSyncEnabled: true
        })
      } catch (e) {
        console.error('Error initalizing cornerstone tools', e)
        console.log('error in initalizing cornerstone tools') // for debugging purpose only, delete later
      } finally {
        //TODO: check if finally is needed?
        // maybe implement a function that checks if both inits have been successful?
        console.log('cornerstone tools initalized')
      }
    },
    displayDicomFile(event) {
      // process your files, read as DataUrl or upload...
      console.log(event.target.files)
    },
    async fetchMetadata(imageId) {
      try {
        await cornerstoneDICOMImageLoader.wadouri.loadImage(imageId).promise
        //await cornerstoneDICOMImageLoader.dicomweb.loadImage(imageId).promise
      } catch (e) {
        console.error('Error fetching DICOM meta data', e)
      } finally {
        // is finally needed needed?
        console.log('fetched DICOM meta data for ' + imageId.name)
      }

      console.log('cornerstone imageID: ' + imageId)
    },
    loadImage(imageId) {
      // parse image id and return a usable URL
      const url = cornerstoneDICOMImageLoader.parseImageId(imageId)

      // create a new promise
      const promise = new Promise((resolve, reject) => {
        // make request for DICOM data inside promise constructor
        const oReq = new XMLHttpRequest()
        oReq.open('get', url, true)
        oReq.responseType = 'arraybuffer'
        oReq.onreadystatechange = function (oEvent) {
          if (oReq.readyState === 4) {
            if (oReq.status == 200) {
              // request succeeded, create image object
              const image = cornerstoneDICOMImageLoader.createImageObject(oReq.response)

              // return the image object by resolving the promise
              resolve(image)
            } else {
              // if error occurred, return an object containing the error by
              // rejecting the promise
              reject(new Error(oReq.statusText))
              console.log('error loading image: ' + oReq.statusText)
            }
          }
        }

        oReq.send()
      })

      // Return an object containing the Promise to cornerstone so it can setup callbacks to be
      // invoked asynchronously for the success/resolve and failure/reject scenarios.
      return {
        promise
      }
    }
    /*
    ,
    // window resize methods
    listenForWindowResize: function () {
      this.$nextTick(function () {
        window.addEventListener('resize', this.debounce(this.onWindowResize, 100))
      })
    },
    onWindowResize: function () {
      cornerstone.resize(this.$refs.canvas, true)
    }
    */
    /*,
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
    */
  }
})

/*
data () {
  },
  mounted () {
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
  width: 500px; // 100%;
  height: 500px; // 100%;
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
