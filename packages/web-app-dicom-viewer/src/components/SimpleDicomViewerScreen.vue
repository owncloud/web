<template>
  <!--
  // more css classes from preview app
  :class="{ lightbox: isFullScreenModeActivated }
  -->
  <form ref="form" style="margin-bottom: 20px">
    <p>file upload (for testing only)</p>
    <input
      id="select-dicom-file"
      type="file"
      @change="uploadDicomFile"
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
import { defineComponent, ref } from 'vue'
import type { PropType } from 'vue'
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

import { Resource } from 'web-client/src'

// declaring some const & references
const { ViewportType } = Enums
//let viewport

const {
  PanTool,
  WindowLevelTool,
  StackScrollMouseWheelTool,
  ZoomTool,
  ToolGroupManager,
  Enums: csToolsEnums
} = cornerstoneTools

//const { MouseBindings } = csToolsEnums

const toolGroupId = 'dicomToolGroup'

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

/*
cornerstoneDICOMImageLoader.configure({
  decodeConfig: {
    convertFloatPixelDataToInt: false
  }
  /*
  // from https://github.com/OHIF/Viewers/pull/3339/files
  ,
  beforeSend: function(xhr) {
      const headers = userAuthenticationService.getAuthorizationHeader()
      const xhrRequestHeaders = {
        Accept: appConfig.omitQuotationForMultipartRequest
          ? 'multipart/related; type=application/octet-stream'
          : 'multipart/related; type="application/octet-stream"',
        // 'multipart/related; type="image/x-jls", multipart/related; type="image/jls"; transfer-syntax="1.2.840.10008.1.2.4.80", multipart/related; type="image/x-jls", multipart/related; type="application/octet-stream"; transfer-syntax=*',
      }
      if (headers && headers.Authorization) {
        xhrRequestHeaders.Authorization = headers.Authorization;
      }
      return xhrRequestHeaders;
    },
    errorInterceptor: error => {
      errorHandler.getHTTPErrorHandler(error);
    },
    */
/*
})
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
    dummydata: {
      type: String
    },
    resource: {
      type: Object as PropType<Resource>,
      default: null
    },
    counter: {
      // for testing only
      type: Number,
      default: 0
    },
    dicomImagePath: {
      // static path to dicom image placeholder, for testing only
      type: String,
      default: 'https://jankaritech.ocloud.de/index.php/s/aUgMrN6SRIvFGWw'
    },
    dicomFile: {
      // static path to dicom image placeholder, for testing only
      type: File,
      default: '../MRBRAIN.dcm'
    },
    dicomURL: {
      type: String,
      default:
        'https://raw.githubusercontent.com/cornerstonejs/cornerstone3D/main/packages/dicomImageLoader/testImages/CTImage.dcm_JPEGLSLosslessTransferSyntax_1.2.840.10008.1.2.4.80.dcm'
      // valid url for dcm file, see also https://www.cornerstonejs.org/live-examples/dicomimageloaderwadouri
      // IMPORTANT: prefix the url with 'wadouri:' so cornerstone can find the image loader
    },
    dicomURLprefix: {
      type: String,
      default: 'wadouri:'
    }
  },
  data: () => ({
    // from example code
    /*
    baseUrl: '',
    exampleStudyImageIds: '',
    isShow: true,
    */
    // from PDF viewer

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
    console.log('simple DICOM viewer screen "mounted" hook called')
    console.log('cornerstone init status: ' + this.isCornerstoneInitialized)

    // for testing only
    if (this.resource != null) {
      console.log('test data: ' + this.resource.name)
    } else {
      console.log('no resource test data available')
    }

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
      console.log('cornerstone not initialised, trigger initialisation')
      await this.initCornerstoneCore()
      // method above changes value of isCornerstoneInitialized...
      // TODO: consider if that shoud only be change when both init methods have passed sucessfully

      //this.initCornerstoneTools()
      // TODO: fix "error initalizing cornerstone tools TypeError: Cannot read properties of undefined (reading 'removeEventListener')" triggered by init cornerstone tools method
      // it seems like first tools should be added to a toolgroup and then the whole tool group is activated
      // see https://www.cornerstonejs.org/api/tools/function/init
    }

    /*
    // trying to replicate solution from dicomImageLoaderwADOURI example
    await this.runDicomViewer()

    const url = this.addWadouriPrefix(this.dicomURL)
    await this.downloadAndDisplayDicomFile(url)
    */

    // HIDE FOR TESTING (delete this line)
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

    /*
    // get file through file upload
    document.getElementById('select-dicom-file').addEventListener('change', function (e: any) {
      // Add the file to the cornerstoneFileImageLoader and get unique
      // number for that file
      const file = e.target.files[0]
      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(file)
      imageIds[0] = imageId
      console.log('image id: ' + imageId)
      //loadAndViewImage(imageId)3
    })

    const imageId = imageIds[0]

    */

    // HIDE FOR TESTING (delete this line)
    //const imageIds = [] //as string[]

    /*
    let imageBlob
    imageBlob = await this.getImage(this.dicomImagePath)
    console.log('image blob? ' + imageBlob + ' / ' + typeof imageBlob)
    let fr = new FileReader()
    fr.readAsDataURL(imageBlob)
    fr.onloadend = function () {
      console.log('reading file: ' + fr.result)
    }
    */

    const url = this.addWadouriPrefix(this.dicomImagePath) //dicomURL
    const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(url) // this.dicomFile
    console.log('image id / path: ' + imageId)

    /*
    let fr = new FileReader()
    fr.readAsDataURL(imageId)
    fr.onloadend = function () {
      console.log('reading image file: ' + fr.result)
    }
    */

    //const imageId = cornerstoneDICOMImageLoader.dicomweb.fileManager.add('../MRBRAIN.dcm')

    // fetch metadata
    /*
    try {
      await cornerstoneDICOMImageLoader.wadouri.loadImage(imageId).promise
      //await cornerstoneDICOMImageLoader.dicomweb.loadImage(imageId).promise
    } catch (e) {
      console.error('Error fetching DICOM meta data', e)
      console.log('Error fetching DICOM meta data')
    } finally {
      // is finally needed needed?
      console.log('fetched DICOM meta data for ' + imageId.name)
    }
    */

    console.log('cornerstone imageID: ' + imageId)
    //imageIds[0] = imageId

    // create a stack viewport
    const { ViewportType } = Enums

    const viewportId = 'CT_STACK' // additional types of viewports see: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/

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

    // get stack viewport that was created
    //const viewport = renderingEngine.getViewport('Types.IStackViewport') as cornerstone.StackViewport
    // const viewportx = renderingEngine.getViewport(ViewportType.STACK) as cornerstone.StackViewport
    // console.log('viewportx type: ' + typeof viewportx) // undefined
    // alternative syntax from cornerstone 3D demo
    const viewport = <Types.IStackViewport>renderingEngine.getViewport(viewportId)
    console.log('viewport type: ' + typeof viewport) // object

    // define a stack containing a single image
    //const dicomStack = [imageIds[0]]
    const dicomStack = [imageId]
    console.log('number of items in stack: ' + dicomStack.length)

    // set stack on the viewport (only one image in the stack)

    /*
    try {
      await viewport.setStack(dicomStack, 0) // 0 referrs to the first item in the stack
    } catch (e) {
      console.error('Error setting DICOM stack to viewport', e)
      console.log('Error setting DICOM stack to viewport')
    } finally {
      // is finally needed needed?
      // console.log('DICOM stack set to viewport ' + viewport.id)
      // this is logged even if there is an error
    }
    */

    // check if viewport is active
    console.log('is viewport enabled? ' + !viewport.isDisabled)

    /*
    // alternative
    // set stack on the viewport with multiple imageIds
    await viewport.setStack(
      imageIds, // all image Ids
      1 // frame that should get displayed
    )
    */

    // set the VOI of the stack? --> from cornerstone 3D example, check if this is needed
    /*
    const windowWidth = 400
    const windowCenter = 40
    const lower = windowCenter - windowWidth / 2.0
    const upper = windowCenter + windowWidth / 2.0

    const ctVoiRange = { lower, upper }
    viewport.setProperties({ voiRange: ctVoiRange })
    */

    // HIDE FOR TESTING (delete this line)
    // render the image
    // updates every viewport in the rendering engine
    viewport.render()

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
        console.error('Error initalizing cornerstone core (renderer?)', e)
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
    uploadDicomFile(event) {
      // process your files, read as DataUrl or upload...
      const dicomFile = event.target.files[0] as File
      const dicomFileInnerText = event.target.files[0].innerText

      // for testing only
      console.log('file uploaded: ' + dicomFile)
      console.log('file type: ' + typeof (dicomFile as File))
      console.log('file name: ' + typeof dicomFile.name)

      console.log('file inner text: ' + dicomFileInnerText)
      console.log('file inner text type: ' + typeof dicomFileInnerText)

      this.displayDicomFile(dicomFile)
    },
    addWadouriPrefix(path: String) {
      console.log('wadouri prefix added: ' + this.dicomURLprefix + path)
      return this.dicomURLprefix + path
    },
    async fetchMetadata(imageId) {
      try {
        await cornerstoneDICOMImageLoader.wadouri.loadImage(imageId).promise
      } catch (e) {
        console.error('Error fetching DICOM meta data', e)
        console.log('Error fetching DICOM meta data')
      } finally {
        // is finally needed needed?
        console.log('fetched DICOM meta data for ' + imageId.name)
      }

      console.log('cornerstone imageID: ' + imageId)
    },
    async runDicomViewer() {
      console.log('running dicom viewer')

      // set reference to HTML element for viewport
      const element = document.getElementById('dicom-canvas') as HTMLDivElement

      // instantiate/register rendering engine
      const renderingEngineId = 'dicomRenderingEngine'
      const renderingEngine = new RenderingEngine(renderingEngineId)
      console.log('render engine instantiated, id: ' + renderingEngineId)

      // create a stack viewport
      const viewportId = 'CT_STACK' // additional types of viewports: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/

      console.log('get render engine id: ' + renderingEngine.id)
      console.log('element for render engine: ' + typeof element + ' / ' + element.id)

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

      // according to the documentation (https://www.cornerstonejs.org/docs/migrationguides/#enabledelement)
      // the following elements get enabled:
      // ELEMENT_ENABLED { element, viewportId, renderingEngineId }
      console.log('element (& viewport id & rendering engine id) enabled')

      // get stack viewport that was created
      //const viewport = renderingEngine.getViewport('Types.IStackViewport') as cornerstone.StackViewport
      //const viewport = renderingEngine.getViewport(ViewportType.STACK) as cornerstone.StackViewport
      // alternative syntax from cornerstone 3D demo
      const viewport = <Types.IStackViewport>renderingEngine.getViewport(viewportId)

      // TOOL GROUP?!?
    },
    async downloadAndDisplayDicomFile(imageUrl) {
      console.log('starting downlaod and display dicom file: ' + imageUrl)

      /*
      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(imageUrl)
      console.log('added file with image id: ' + imageId)
      console.log('file type: ' + typeof imageId) // string
      console.log('image id: ' + typeof imageId.id)
      console.log('image name: ' + typeof imageId.name)
      */

      // get start date
      const start = new Date().getTime()
      console.log('start time: ' + start)

      //viewport.setStack([imageUrl])
      //viewport.render()

      /*
      viewport.setStack([imageUrl]).then(() => {
        // Set the VOI of the stack
        // viewport.setProperties({ voiRange: ctVoiRange });
        // Render the image
        viewport.render()
      })
      */

      //this.runDicomViewer()
    },
    // from https://github.com/onurzorluer/react-image-file-resizer/issues/64
    async getImage(path) {
      const response = await fetch(path)
      const blob = await response.blob()
      return blob
    },
    async displayDicomFile(f: File) {
      console.log('display dicom file function called for file: ' + f + ' / ' + typeof f)
      let reader = new FileReader()
      reader.readAsDataURL(f)
      reader.onloadend = function () {
        console.log('reading file: ' + reader.result)
      }

      //const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(f)
      const imageId = cornerstoneDICOMImageLoader.wadouri.fileManager.add(f)
      console.log('added file with image id: ' + imageId)
      console.log('file type: ' + typeof imageId) // string
      console.log('image id: ' + typeof imageId.id)
      console.log('image name: ' + typeof imageId.name)

      // check if this is needed
      /*
      const fileRequest = cornerstoneDICOMImageLoader.wadouri.loadFileRequest(imageId)
      console.log('file request: ' + fileRequest)
      console.log('file request type: ' + typeof fileRequest) // promise
      console.log('file request name: ' + typeof fileRequest.name)
      */

      // set reference to HTML element for viewport
      const element = document.getElementById('dicom-canvas') as HTMLDivElement

      // instantiate/register rendering engine
      const renderingEngineId = 'dicomRenderingEngine'
      const renderingEngine = new RenderingEngine(renderingEngineId)
      console.log('render engine instantiated')

      // fetch metadata
      try {
        await cornerstoneDICOMImageLoader.wadouri.loadImage(imageId).promise
        //await cornerstoneDICOMImageLoader.wadors.loadImage(imageId).promise
      } catch (e) {
        console.error('Error fetching DICOM meta data', e)
      } finally {
        // is finally needed needed?
        console.log('fetched DICOM meta data for ' + imageId.name)
      }

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

      // enable element
      renderingEngine.enableElement(viewportInput)

      // according to the documentation (https://www.cornerstonejs.org/docs/migrationguides/#enabledelement)
      // the following elements get enabled:
      // ELEMENT_ENABLED { element, viewportId, renderingEngineId }
      console.log('element (& viewport id & rendering engine id) enabled')

      // get stack viewport that was created
      //const viewport = renderingEngine.getViewport('Types.IStackViewport') as cornerstone.StackViewport
      //const viewport = renderingEngine.getViewport(ViewportType.STACK) as cornerstone.StackViewport
      // alternative syntax from cornerstone 3D demo
      const viewport = <Types.IStackViewport>renderingEngine.getViewport(viewportId)

      // define a stack containing a single image
      //const dicomStack = ['wadouri:' + imageId] // check if 'wadouri:' is needed
      const dicomStack = ['wadors:' + imageId] // check if 'wadouri:' is needed

      // set stack on the viewport (only one image in the stack)
      await viewport.setStack(dicomStack).then(() => {
        // error: cannot read properties

        // render the image
        // updates every viewport in the rendering engine
        //renderingEngine.render()
        viewport.render()

        //const image = viewport.getImageData
        //const image2 = viewport.getCornerstoneImage
      })
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
  width: 2000px; // 100%;
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
