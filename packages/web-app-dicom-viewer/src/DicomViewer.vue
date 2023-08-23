<template>
  <!-- check ouf if definition of type="application/octet-stream" plus "application/dcm" might be needed below -->
  <div class="dicom-viewer oc-width-1-1 oc-height-1-1">
    <!-- dicom file upload, for testing only -->
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
    <!-- check ouf if the classes of the div below are still accurate/needed/consistent with overall app design -->
    <div
      class="oc-height-1-1 oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium"
    >
      <!-- div element for dicom viewport -->
      <div id="dicom-canvas" class="dicom-canvas"></div>
      <!-- div element for displaying meta data -->
      <div id="dicom-metadata" class="dicom-metadata">
        <h2>metadata for current dicom image</h2>
        <div>
          <span>Filename:</span>
          <span id="filename"></span>
        </div>
        <div>
          <span>Transfer Syntax:</span>
          <span id="transfer-syntax"></span>
        </div>
        <div>
          <span>SOPClassUID:</span>
          <span id="sop-class-uid"></span>
        </div>
        <div>
          <span>SOPInstanceUID:</span>
          <span id="sop-instance-uid"></span>
        </div>
        <div>
          <span>Rows:</span>
          <span id="rows"></span>
        </div>
        <div>
          <span>Columns:</span>
          <span id="columns"></span>
        </div>
        <div>
          <span>Spacing:</span>
          <span id="spacing"></span>
        </div>
        <div>
          <span>Direction:</span>
          <span id="direction"></span>
        </div>
        <div>
          <span>Origin:</span>
          <span id="origin"></span>
        </div>
        <div>
          <span>Modality:</span>
          <span id="modality"></span>
        </div>
        <div>
          <span>Pixel Representation:</span>
          <span id="pixel-representation"></span>
        </div>
        <div>
          <span>Bits Allocated:</span>
          <span id="bits-allocated"></span>
        </div>
        <div>
          <span>Bits Stored:</span>
          <span id="bits-stored"></span>
        </div>
        <div>
          <span>High Bit:</span>
          <span id="high-bit"></span>
        </div>
        <div>
          <span>Photometric Interpretation:</span>
          <span id="photometric-interpretation"></span>
        </div>
        <div>
          <span>Window Width:</span>
          <span id="window-width"></span>
        </div>
        <div>
          <span>Window Center:</span>
          <span id="window-center"></span>
        </div>
      </div>
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

import { RenderingEngine, Types, Enums, metaData } from '@cornerstonejs/core'

// vue imports
import { defineComponent, unref } from 'vue'
import type { PropType } from 'vue'

// other imports
import { Resource } from 'web-client/src'
import { useDownloadFile } from 'web-pkg/src/composables/download/useDownloadFile'
import uids from './helper/uids'
// import fs from 'fs'
// import * as fs from 'fs/promises'
import * as fs from 'fs'

import path, { join } from 'path'

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
// from cornerstone 3d tutorial
let maxWebWorkers = 1

if (navigator.hardwareConcurrency) {
  maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7)
}

var config = {
  maxWebWorkers, //: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: false, // true,
  // the following config items are added from a sample - TODO: further look into the specifics of the configuration
  // webWorkerTaskPaths: [],
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: false, // true,
      strict: false // true
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
  setup() {
    return {
      ...useDownloadFile()
    }
  }, // maybe not needed with the streamlined version
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
      //required: true,
      default: null
    },
    downloadURL: {
      type: String
    },
    currentFile: {
      type: Object as PropType<File>
    }
  },
  data() {
    return {
      isCornerstoneInitialized: false,
      element: null,
      renderingEngine: null,
      viewport: null,
      dicomFile: null,
      imageData: null,
      imageName: null,
      countLoaded: 0
    }
  },
  watch: {}, // most likely not needed
  // --------------------------
  // vue js lifecylce functions
  // --------------------------
  // "created" runs before DOM is rendered, data and events are already accessible
  created() {
    console.log('vue lifecycle created called')
  }, // most likely not needed
  // "mounted" is called when component has been added to DOM
  beforeMount() {
    console.log('vue lifecycle before mount called')
  },
  async mounted() {
    console.log('vue lifecycle mounted called')
    // check if cornerstone core (TODO and tools) are initalized
    if (!this.isCornerstoneInitialized) {
      // initalize cornerstone core
      await this.initCornerstoneCore()
    }

    // set reference to HTML element for viewport
    this.element = document.getElementById('dicom-canvas') as HTMLDivElement

    // instantiate/register rendering engine
    this.renderingEngine = new RenderingEngine('dicomRenderingEngine')

    // create a stack viewport
    const { ViewportType } = Enums

    const viewportId = 'CT_STACK' // additional types of viewports see: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingengine/
    const element = this.element

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
    this.renderingEngine.enableElement(viewportInput)

    // get stack viewport that was created
    this.viewport = <Types.IStackViewport>this.renderingEngine.getViewport(viewportId)
  },
  // "beforeUpdate" is implementing any change in the component
  async beforeUpdate() {
    console.log('vue lifecycle before update called')

    this.countLoaded++
    console.log('before update called: ' + this.countLoaded)

    // check if cornerstone core (TODO and tools) are initalized
    if (!this.isCornerstoneInitialized) {
      // initalize cornerstone core
      console.log('init cornerstone core triggered at before update')
      await this.initCornerstoneCore()
    }

    // get resource
    // ensure resource url is not empty
    if (this.url != null && this.url != undefined && this.url != '') {
      // logging some data for testing purpose only
      console.log('current resource url: ' + this.url)

      if (this.currentContent != (null || undefined)) {
        console.log('current content lenght: ' + this.currentContent.length) // string
      }
      if (this.resource != (null || undefined)) {
        console.log('resource name: ' + this.resource.name)
        console.log('resource: ' + this.resource + ' / ' + typeof this.resource)
        console.log('resource mimetype: ' + this.resource.mimeType)
        console.log(
          'unref resource & type: ' + unref(this.resource) + ' / ' + typeof unref(this.resource)
        )
        this.imageName = this.resource.name
        console.log('webdav URL: ' + this.resource.webDavPath)
      }

      //let dicomImage = this.url.replace('blob', 'wadouri') // wadouri
      let dicomImage = 'wadouri:' + this.url // wadouri
      console.log('modified url (with wadouri): ' + dicomImage)

      /*
      // for testing only (separating credentails from dicom image url)
      const [url, credentials] = this.separateCredentialsFromUrl(dicomImage)
      console.log(url)
      console.log(credentials)
      */

      //this.dicomFile = this.createDicomFile()

      // for testing only
      //this.readMyFile(this.dicomFile)

      /*
      // currently loading only one resource at a time
      // file manager is only needed if resource is passed along as file
      const imageId = await cornerstoneDICOMImageLoader.wadouri.fileManager.add(this.dicomFile)
      console.log('added image id: ' + imageId)
      */

      /*
      // static url for testing purpose
      let imageId =
        'wadouri:https://raw.githubusercontent.com/cornerstonejs/cornerstone3D/main/packages/dicomImageLoader/testImages/CTImage.dcm_JPEGLSLosslessTransferSyntax_1.2.840.10008.1.2.4.80.dcm'
      */

      // define a stack containing a single image
      const dicomStack = [dicomImage]
      //const dicomStack = [imageId]

      //dicomImage imageId
      console.log('number of items in stack: ' + dicomStack.length)
      console.log('first stack item: ' + dicomStack[0])

      // preload imageIds meta data into memory
      // might only be needed if there is a stack of files
      // await this.prefetchMetadataInformation([imageId])

      // set stack on the viewport (only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image
      // updates every viewport in the rendering engine
      this.viewport.render()

      // get metadata
      this.imageData = this.viewport.getImageData()

      // setting metadata
      this.setMetadata(dicomImage) // (imageId)
    } else {
      console.log('no resource url available')
    }
  },
  // updated gets called anytime some change is made in the component
  updated() {
    console.log('vue lifecycle update called')
    // console.log('update')
    // this.viewport.resize()
  },
  // cleaning up component, leaving no variables or events that could cause memory leaks to app
  beforeUnmount() {
    console.log('vue lifecycle before unmount called')

    // clear meta data
    this.clearMetadata()

    this.renderingEngine.destroy()
  },
  unmounted() {
    console.log('vue lifecycle unmounted called')
    //this.renderingEngine.destroy()
  },
  methods: {
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
        this.isCornerstoneInitialized = true
      } catch (e) {
        console.error('Error initalizing cornerstone core', e)
      }
    },
    async prefetchMetadataInformation(imageIdsToPrefetch) {
      console.log('prefetching meta data information')
      for (let i = 0; i < imageIdsToPrefetch.length; i++) {
        await cornerstoneDICOMImageLoader.wadouri.loadImage(imageIdsToPrefetch[i]).promise
        console.log('data fetched for: ' + imageIdsToPrefetch[i])
      }
    },
    async createDicomFile() {
      // TODO check if already exist?
      // TODO delete content after unloading the package?

      console.log('creating dicom file')
      if (this.dicomFile != (null || undefined)) {
        console.log('file size before creation: ' + this.dicomFile.size)
      }

      // for testing only
      console.log('current file content: ' + this.currentContent)
      console.log('resource name: ' + this.resource.name)
      console.log('resource mime type: ' + this.resource.mimeType)

      this.dicomFile = await new File([this.currentContent], this.resource.name, {
        type:
          this.resource.mimeType != (null || undefined)
            ? this.resource.mimeType
            : 'application/dicom' // set default mime type, maybe application/octet-stream ?
      })

      console.log('file size after creation: ' + this.dicomFile.size)
    },
    // TODO: add type for image id
    // precondition: have image data
    setMetadata(imageId) {
      // get metadata from viewport
      this.imageData = this.viewport.getImageData()

      // filename - maybe not needed?
      document.getElementById('filename').innerHTML = this.imageName //this.resource.name

      if (imageId != (null || undefined) && typeof imageId == 'string') {
        const {
          pixelRepresentation,
          bitsAllocated,
          bitsStored,
          highBit,
          photometricInterpretation
        } = metaData.get('imagePixelModule', imageId)

        const voiLutModuleLocal = metaData.get('voiLutModule', imageId)
        const sopCommonModule = metaData.get('sopCommonModule', imageId)
        const transferSyntax = metaData.get('transferSyntax', imageId)

        //transfer syntax
        document.getElementById('transfer-syntax').innerHTML = transferSyntax.transferSyntaxUID

        //sop class uid
        document.getElementById('sop-class-uid').innerHTML =
          sopCommonModule.sopClassUID + ' [' + uids[sopCommonModule.sopClassUID] + ']'

        //sop instance uid
        document.getElementById('sop-instance-uid').innerHTML = sopCommonModule.sopInstanceUID

        //rows
        document.getElementById('rows').innerHTML = this.imageData.dimensions[0]

        //columns
        document.getElementById('columns').innerHTML = this.imageData.dimensions[1]

        //spacing
        document.getElementById('spacing').innerHTML = this.imageData.spacing.join('\\')

        //direction
        document.getElementById('direction').innerHTML = this.imageData.direction
          .map((x) => Math.round(x * 100) / 100)
          .join(',')

        //origin
        document.getElementById('origin').innerHTML = this.imageData.origin
          .map((x) => Math.round(x * 100) / 100)
          .join(',')

        //modality
        document.getElementById('modality').innerHTML = this.imageData.metadata.Modality

        //pixel representation
        document.getElementById('pixel-representation').innerHTML = pixelRepresentation

        //bits allocated
        document.getElementById('bits-allocated').innerHTML = bitsAllocated

        //bits stored
        document.getElementById('bits-stored').innerHTML = bitsStored

        //high bit
        document.getElementById('high-bit').innerHTML = highBit

        //photometric interpretation
        document.getElementById('photometric-interpretation').innerHTML = photometricInterpretation

        //window width
        document.getElementById('window-width').innerHTML = voiLutModuleLocal.windowWidth

        //window center
        document.getElementById('window-center').innerHTML = voiLutModuleLocal.windowCenter
      } else {
        console.log('no image meta data available')
      }
    },
    clearMetadata() {
      document.getElementById('filename').innerHTML = ''
      document.getElementById('transfer-syntax').innerHTML = ''
      document.getElementById('sop-class-uid').innerHTML = ''
      document.getElementById('sop-instance-uid').innerHTML = ''
      document.getElementById('rows').innerHTML = ''
      document.getElementById('columns').innerHTML = ''
      document.getElementById('spacing').innerHTML = ''
      document.getElementById('direction').innerHTML = ''
      document.getElementById('origin').innerHTML = ''
      document.getElementById('modality').innerHTML = ''
      document.getElementById('pixel-representation').innerHTML = ''
      document.getElementById('bits-allocated').innerHTML = ''
      document.getElementById('bits-stored').innerHTML = ''
      document.getElementById('high-bit').innerHTML = ''
      document.getElementById('photometric-interpretation').innerHTML = ''
      document.getElementById('window-width').innerHTML = ''
      document.getElementById('window-center').innerHTML = ''
    },
    separateCredentialsFromUrl(url: String) {
      const [urlWithoutCredentials, ...rest] = url.split('?')
      const credentials = rest.join('?')
      console.log('url without credentials: ' + urlWithoutCredentials)
      console.log('credentaials (remainder of url): ' + credentials)
      return [urlWithoutCredentials, credentials] as const
    },
    uploadDicomFile(event) {
      // get first file (upload should support only single file anyway)
      const dicomFile = event.target.files[0] as File

      // for testing only
      console.log('file uploaded: ' + dicomFile + ' / ' + typeof (dicomFile as File))
      console.log('file name: ' + dicomFile.name)
      console.log('file size: ' + dicomFile.size + ' bytes')
      console.log('file mime type: ' + dicomFile.type)

      this.displayDicomFile(dicomFile)
    },
    async displayDicomFile(f: File) {
      console.log('display dicom file function called for file: ' + f.name)
      this.imageName = f.name

      // for testing only
      this.readMyFile(f)

      const imageId = await cornerstoneDICOMImageLoader.wadouri.fileManager.add(f)
      console.log('added image id: ' + imageId)

      // define a stack containing a single image
      const dicomStack = [imageId]

      //dicomImage imageId
      console.log('number of items in stack: ' + dicomStack.length)
      console.log('first stack item: ' + dicomStack[0])

      // set stack on the viewport (only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image
      // updates every viewport in the rendering engine
      this.viewport.render()

      // setting metadata
      this.setMetadata(imageId)
    },
    readMyFile(f: File) {
      let reader = new FileReader()
      // reader.readAsDataURL(f)
      reader.readAsText(f, 'UTF-8') // creates the same output as current content
      //reader.readAsArrayBuffer(f)
      reader.onloadend = function () {
        let result = reader.result as String
        console.log('reading file lenght: ' + result.length)
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
  border: 10px solid blue; // none
  margin: 0;
  padding: 0;
  overflow: hidden;
  //height: 100%; //calc(100% - 52px);
}

.dicom-canvas {
  border: 10px solid yellow; //none
  width: 500px; // 100%;
  height: 500px; // 100%;
}

.dicom-metadata {
  border: 10px solid green; //none
  width: auto;
  height: 500px; // 100%;
}
</style>
