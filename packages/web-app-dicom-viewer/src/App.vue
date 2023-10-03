<template>
  <div class="dicom-viewer oc-width-1-1 oc-height-1-1">
    <div class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s">
      <!-- toggle for displaying all meta data -->
      <div id="dicom-viewer-show-metadata" class="oc-flex-middle oc-flex oc-width-xlarge">
        <!-- TODO: implement click event of toggle properly -->
        <oc-button
          id="metadata-toggle-sidebar"
          oc-tooltip="show/hide DICOM metadata"
          class="preview-controls-show-metadata"
          appearance="raw"
          variation="brand"
          @click="$emit('toggleShowMetadata')"
        >
          <!-- TODO: implement proper toggle, check if fill or line version is needed -->
          <oc-icon
            :fill-type="isShowMetadataActivated ? 'fill' : 'line'"
            name="side-bar-right"
            variation="inherit"
          />
        </oc-button>
      </div>
    </div>
    <div class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s">
      <!-- div element for dicom viewport -->
      <div id="dicom-canvas" class="dicom-canvas oc-position-relative">
        <!-- vip meta data -->
        <!-- TODO: make sure that date and time is displayed in the format matching language settings -->
        <div
          v-if="isVipMetadataFetched"
          id="dicom-viewer-vip-metadata"
          class="oc-position-absolute"
        >
          <div class="oc-pr-s oc-font-semibold">
            <span>{{ imageData.patientName || 'patient name not defined' }}</span>
            <span> (*{{ imageData.patientBirthdate || 'birthdate not defined' }})</span>
          </div>
          <div class="oc-pr-s oc-font-semibold">
            <span>{{ imageData.institutionName || 'institution name not defined' }}</span
            >,
            <span
              >{{ imageData.instanceCreationDate || 'instance creation date' }}
              {{ imageData.instanceCreationTime || ' and time not defined' }}</span
            >
          </div>
        </div>
      </div>

      <!-- div element for displaying full meta data -->
      <div id="dicom-metadata" class="dicom-metadata">
        <h2>metadata for current dicom image</h2>
        <div class="dicom-metadata-item">
          <span>Filename:</span>
          <span id="filename"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Transfer Syntax:</span>
          <span id="transfer-syntax"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>SOPClassUID:</span>
          <span id="sop-class-uid"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>SOPInstanceUID:</span>
          <span id="sop-instance-uid"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Rows:</span>
          <span id="rows"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Columns:</span>
          <span id="columns"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Spacing:</span>
          <span id="spacing"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Direction:</span>
          <span id="direction"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Origin:</span>
          <span id="origin"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Modality:</span>
          <span id="modality"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Pixel Representation:</span>
          <span id="pixel-representation"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Bits Allocated:</span>
          <span id="bits-allocated"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Bits Stored:</span>
          <span id="bits-stored"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>High Bit:</span>
          <span id="high-bit"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Photometric Interpretation:</span>
          <span id="photometric-interpretation"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Window Width:</span>
          <span id="window-width"></span>
        </div>
        <div class="dicom-metadata-item">
          <span>Window Center:</span>
          <span id="window-center"></span>
        </div>
      </div>
    </div>
    <!-- temporary buttons for viewport manipulations -->
    <div class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s">
      <div id="tools"></div>
    </div>
  </div>
  <dicom-controls
    :files="dicomFiles"
    :active-index="0"
    :is-folder-loading="false"
    :current-image-rotation="currentImageRotation"
    :current-image-zoom="currentImageZoom"
    :current-vertical-flip="false"
    :current-horizontal-flip="false"
    :current-inversion="false"
    :is-show-metadata-activated="false"
    @set-rotation="currentImageRotation = $event"
    @set-zoom="currentImageZoom = $event"
    @set-vertical-flip="currentVerticalFlip = $event"
    @set-horizontal-flip="currentHorizontalFlip = $event"
    @set-inversion="currentInversion = $event"
    @toggle-show-metadata="showMetadata"
    @toggle-previous="prev"
    @toggle-next="next"
  />
</template>

<script lang="ts">
// import cornerstone packages
import Hammer from 'hammerjs'
import dicomParser from 'dicom-parser'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'

import { init as csToolsInit } from '@cornerstonejs/tools'

import { RenderingEngine, Types, Enums, metaData } from '@cornerstonejs/core'

// vue imports
import { defineComponent, computed, ref } from 'vue'
import type { PropType } from 'vue'

// other imports
import { Resource } from 'web-client/src'
//import { useDownloadFile } from 'web-pkg/src/composables/download/useDownloadFile'
import DicomControls from './components/DicomControls.vue'
import uids from './helper/uids'

// declaring some const & references
const { ViewportType, Events } = Enums

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
let maxWebWorkers = 1

if (navigator.hardwareConcurrency) {
  maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7)
}

var config = {
  maxWebWorkers,
  startWebWorkersOnDemand: true,
  // TODO: further look into the specifics of the configuration
  // webWorkerTaskPaths: [],
  taskConfiguration: {
    decodeTask: {
      initializeCodecsOnStartup: true,
      strict: false // true
    }
  }
}

/*
var config = {
  maxWebWorkers: navigator.hardwareConcurrency || 1,
  startWebWorkersOnDemand: true
}
*/

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
  //name: 'DicomViewer', // seems like this is not needed anymore for streamlined apps
  components: {
    DicomControls
  },
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
  setup(props) {
    return {
      imageData: {
        // dummy data for testing only
        patientName: 'Max Muster',
        patientBirthdate: '19800101',
        institutionName: 'LMU Klinikum',
        instanceCreationDate: '20230901',
        instanceCreationTime: '093801'
      }
      //props.patientName
      // TODO implement proper interface
      /*
      patientInformation: {},
      studyInformation: {},
      seriesInformation: {},
      instanceInformation: {},
      imageInformation: {},
      equipmentInformation: {},
      scanningInformation: {},
      uidsInformation: {},
      otherInformation: {}
      */
    }
    //const dicomFiles = <Resource[]>[this.resource]

    //const activeIndex = ref()

    /*
    return {
      ...useDownloadFile()
    }
    */
  },
  data() {
    return {
      isDicomFileRendered: false,
      isMetaDataSet: false,
      element: null,
      renderingEngine: null,
      viewport: null,
      dicomFile: null,
      dicomFileName: null,
      dicomUrl: null,
      imageData: null,
      dicomMetaData: null,
      metaDataElement: null,
      metaDataItems: null,
      toolInfoElement: null,
      currentImageZoom: 1,
      currentImageRotation: 0,
      currentVerticalFlip: false,
      currentHorizontalFlip: false,
      currentInversion: false,
      isShowMetadataActivated: false,
      isVipMetadataFetched: false,
      dicomFiles: [this.resource]
    }
  },
  watch: {},

  // --------------------------
  // vue js lifecylce functions
  // --------------------------

  // "created" runs before DOM is rendered, data and events are already accessible
  async created() {
    console.log('lifecycle @ created')
    //console.log('url: ' + this.url)
    //console.log('file name: ' + this.resource.name)

    // get resource, ensure resource url is not empty!
    if (this.url != null && this.url != undefined && this.url != '') {
      if (this.resource != (null || undefined)) {
        this.dicomFileName = this.resource.name
      }
      this.dicomUrl = await this.addWadouriPrefix(this.url)
    }

    // get vip metadata
    this.dicomMetaData = await this.fetchMetadataInformation(await this.addWadouriPrefix(this.url))
    // console.log('dicom meta data: ' + this.dicomMetaData)
    // console.log('patient name: ' + this.dicomMetaData[0])
    this.imageData.patientName = this.dicomMetaData[0]
    // console.log('patient birthdata: ' + this.dicomMetaData[1])
    this.imageData.patientBirthdate = this.dicomMetaData[1]
    // console.log('institution name: ' + this.dicomMetaData[2])
    this.imageData.institutionName = this.dicomMetaData[2]
    // console.log('instance creation date: ' + this.dicomMetaData[3])
    this.imageData.instanceCreationDate = this.dicomMetaData[3]
    // console.log('instance creation time: ' + this.dicomMetaData[4])
    this.imageData.instanceCreationTime = this.dicomMetaData[4]
    this.isVipMetadataFetched = true
  },
  // "beforeMount" is called right before the component is to be mounted
  beforeMount() {
    console.log('lifecycle @ beforeMount')
  },
  // "mounted" is called when component has been added to DOM
  async mounted() {
    console.log('lifecycle @ mounted')
    // check if cornerstone core (TODO and tools) are initalized
    if (!cornerstone.isCornerstoneInitialized()) {
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
        // more settings, TODO: check what other settings are needed/useful
        // orientation: Enums.OrientationAxis.AXIAL,
      }
    }

    // enable element
    this.renderingEngine.enableElement(viewportInput)

    // get stack viewport that was created
    this.viewport = <Types.IStackViewport>this.renderingEngine.getViewport(viewportId)

    // set reference to HTML element for metadata
    // metadata root element
    this.metaDataElement = document.getElementById('dicom-metadata') as HTMLDivElement
    // child elements
    this.metaDataItems = document.getElementsByClassName(
      'dicom-metadata-item'
    ) as HTMLCollectionOf<HTMLDivElement>

    // adding some buttons for image manipulation

    // zoom in
    this.addButton({
      id: 'zoom-in-tool',
      title: 'Zoom+',
      onClick: () => {
        const camera = this.viewport.getCamera()

        const newCamera = {
          parallelScale: camera.parallelScale * 0.8,
          position: camera.position,
          focalPoint: camera.focalPoint
        }

        this.viewport.setCamera(newCamera)
        this.viewport.render()
      }
    })

    // zoom out
    this.addButton({
      id: 'zoom-out-tool',
      title: 'Zoom-',
      onClick: () => {
        const camera = this.viewport.getCamera()

        const newCamera = {
          parallelScale: camera.parallelScale * 1.25,
          position: camera.position,
          focalPoint: camera.focalPoint
        }

        this.viewport.setCamera(newCamera)
        this.viewport.render()
      }
    })

    // rotate image anti clockwise
    this.addButton({
      id: 'backrotate-tool',
      title: 'Rotate -90',
      onClick: () => {
        const { rotation } = this.viewport.getProperties()
        this.viewport.setProperties({ rotation: rotation - 90 })
        this.viewport.render()
      }
    })

    // rotate image clockwise
    this.addButton({
      id: 'rotate-tool',
      title: 'Rotate +90',
      onClick: () => {
        const { rotation } = this.viewport.getProperties()
        this.viewport.setProperties({ rotation: rotation + 90 })
        this.viewport.render()
      }
    })

    // flip image horizontal
    this.addButton({
      id: 'flip-horizontal-tool',
      title: 'Flip H',
      onClick: () => {
        const { flipHorizontal } = this.viewport.getCamera()
        this.viewport.setCamera({ flipHorizontal: !flipHorizontal })
        this.viewport.render()
      }
    })

    // flip image vertical
    this.addButton({
      id: 'flip-vertical-tool',
      title: 'Flip V',
      onClick: () => {
        const { flipVertical } = this.viewport.getCamera()
        this.viewport.setCamera({ flipVertical: !flipVertical })
        this.viewport.render()
      }
    })

    // invert image
    this.addButton({
      id: 'invert-tool',
      title: 'Invert',
      onClick: () => {
        const { invert } = this.viewport.getProperties()
        this.viewport.setProperties({ invert: !invert })
        this.viewport.render()
      }
    })

    // reset image
    this.addButton({
      id: 'reset-tool',
      title: 'Reset',
      onClick: () => {
        // Resets the viewport's camera
        this.viewport.resetCamera()
        // Resets the viewport's properties
        this.viewport.resetProperties()
        this.viewport.render()
      }
    })

    // add resource to stack
    // ensure resource url is not empty!
    if (this.url != null && this.url != undefined && this.url != '') {
      if (this.resource != (null || undefined)) {
        this.dicomFileName = this.resource.name
      }

      let dicomResourceUrl = await this.addWadouriPrefix(this.url)
      /*
      // file manager is only needed if resource is passed along as file
      const imageId = await cornerstoneDICOMImageLoader.wadouri.fileManager.add(this.dicomFile)
      */

      // define a stack containing a single image
      const dicomStack = [dicomResourceUrl]

      // maybe preload meta data into memory?
      // might only be needed if there is a stack of files
      // await this.prefetchMetadataInformation(dicomStack)

      // set stack on the viewport (currently only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image (updates every viewport in the rendering engine)
      this.viewport.render()
      this.isDicomFileRendered = true

      // get metadata
      this.imageData = this.viewport.getImageData()

      // setting metadata
      this.setMetadata(dicomResourceUrl)
    } else {
      console.log('no valid dicom resource url: ' + this.url)
    }
  },
  // "beforeUpdate" is implementing any change in the component
  beforeUpdate() {
    console.log('lifecycle @ beforeUpdate')
  },
  // updated gets called anytime some change is made in the component
  updated() {
    console.log('lifecycle @ updated')
    // this.viewport.resize()
  },
  // cleaning up component, leaving no variables or events that could cause memory leaks to app
  beforeUnmount() {
    console.log('lifecycle @ beforeUnmount')
    this.renderingEngine.destroy()
    this.isDicomFileRendered = false
    this.isMetaDataSet = false
    this.isVipMetadataFetched = false
    this.updateDisplayOfMetaData()
    this.clearMetadata()
  },
  unmounted() {
    console.log('lifecycle @ unmounted')
  },
  methods: {
    async initCornerstoneCore() {
      try {
        await cornerstone.init()
      } catch (e) {
        console.error('Error initalizing cornerstone core', e)
      }
    },
    async initCornerstoneTools() {
      console.log('initializing cornerstone tools')
      try {
        await cornerstoneTools.init()
        console.log('cornerstone tools initalized')
      } catch (e) {
        console.error('Error initalizing cornerstone tools', e)
        console.log('error initalizing cornerstone tools')
      }
    },
    async fetchMetadataInformation(imageId) {
      console.log('fetch meta data information for: ' + imageId)

      let patientName = ''
      let patientBirthdate = ''
      let institutionName = ''
      let instanceCreationDate = ''
      let instanceCreationTime = ''

      await cornerstoneDICOMImageLoader.wadouri
        .loadImage(imageId)
        .promise.then(async function (dicomImage) {
          patientName = dicomImage.data.string('x00100010')
          patientBirthdate = dicomImage.data.string('x00100030')
          institutionName = dicomImage.data.string('x00080080')
          instanceCreationDate = dicomImage.data.string('x00080012')
          instanceCreationTime = dicomImage.data.string('x00080013')
        })

      /*
      console.log('patient name: ' + patientName)
      console.log('patient birthdate: ' + patientBirthdate)
      console.log('institution name: ' + institutionName)
      console.log('instance creation date: ' + instanceCreationDate)
      console.log('instance creation time: ' + instanceCreationTime)

      const vipMetadata = {
        'Patient Name': patientName,
        'Patient Birthdate': patientBirthdate,
        'Institution Name': institutionName,
        'Instance Creation Date': instanceCreationDate,
        'Instance Creation Time': instanceCreationTime
      }
      console.log(vipMetadata)
      return vipMetadata
      */

      return [
        patientName,
        patientBirthdate,
        institutionName,
        instanceCreationDate,
        instanceCreationTime
      ]
    },
    async createDicomFile() {
      // TODO check if already exist?
      // TODO delete content after unloading the package?

      console.log('creating dicom file')
      if (this.dicomFile != (null || undefined)) {
        console.log('file size before creation: ' + this.dicomFile.size)
        this.dicomFile = null
      }

      this.dicomFile = await new File([this.currentContent], this.resource.name, {
        type:
          this.resource.mimeType != (null || undefined)
            ? this.resource.mimeType
            : 'application/dicom' // set default mime type, maybe application/octet-stream ?
      })

      console.log('file size after creation: ' + this.dicomFile.size)
    },
    async addWadouriPrefix(url: String) {
      return 'wadouri:' + url
    },
    setMetadata(imageId: String) {
      // get metadata from viewport
      this.imageData = this.viewport.getImageData() // returns IImageData object, see https://www.cornerstonejs.org/api/core/namespace/Types#IImageData

      // filename (for testing only) - not needed since filename is displayed in the header of the app
      document.getElementById('filename').innerHTML = this.dicomFileName //this.resource.name

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

        // setting the data to UI elements
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

        this.isMetaDataSet = true
        this.updateDisplayOfMetaData()
      } else {
        console.log('no image meta data available')
      }
    },
    updateDisplayOfMetaData() {
      if (this.isMetaDataSet) {
        for (let i = 0; i < this.metaDataItems.length; i++) {
          this.metaDataItems[i].style.display = 'block'
        }
      } else {
        for (let i = 0; i < this.metaDataItems.length; i++) {
          this.metaDataItems[i].style.display = 'none'
        }
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
    // currently not used, maybe delete function
    setToolInfo() {
      // adding event listener
      this.element.addEventListener(Events.CAMERA_MODIFIED, (_) => {
        if (!this.viewport) {
          return
        }

        const { flipHorizontal, flipVertical } = this.viewport.getCamera()
        const { rotation, invert } = this.viewport.getProperties()

        document.getElementById('rotation').innerHTML = `${Math.round(rotation)}`
        document.getElementById('flip-horizontal').innerHTML = `${flipHorizontal}`
        document.getElementById('flip-vertical').innerHTML = `${flipVertical}`
        document.getElementById('zoom').innerHTML = `TODO`
        document.getElementById('inverted').innerHTML = `${invert}`
      })
    },
    separateCredentialsFromUrl(url: String) {
      const [urlWithoutCredentials, ...rest] = url.split('?')
      const credentials = rest.join('?')
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
      this.dicomFileName = f.name

      // for testing only
      // this.readMyFile(f)

      const imageId = await cornerstoneDICOMImageLoader.wadouri.fileManager.add(f)

      // define a stack containing a single image
      const dicomStack = [imageId]

      // set stack on the viewport (only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image
      this.viewport.render()

      // setting metadata
      this.setMetadata(imageId)
    },
    readMyFile(f: File) {
      let reader = new FileReader()
      reader.readAsText(f, 'UTF-8')
      reader.onloadend = function () {
        let result = reader.result as String
        console.log('reading file lenght: ' + result.length)
      }
    },
    // TODO: properly implement these functions
    next() {
      return
    },
    prev() {
      return
    },
    showMetadata() {
      // similar to "ToggleFullScreenMode" of preview app
      return
    },
    addButton({
      id,
      title,
      container,
      onClick
    }: {
      id?: string
      title: string
      container?: HTMLElement
      onClick: () => void
    }) {
      const button = document.createElement('button')

      button.id = id
      //button.className = 'dicom-manipulation-btn'

      button.style.padding = '12px'
      button.style.margin = '12px'

      button.innerHTML = title
      button.onclick = onClick

      container = container ?? document.getElementById('tools')
      container.append(button)
    }
  }
})
</script>

<style lang="scss" scoped>
.dicom-viewer {
  border: none; //10px solid blue;
  margin: 0;
  padding: 0;
  overflow: hidden;
  //height: 100%; //calc(100% - 52px);
}

.dicom-canvas {
  border: none;
  width: 600px; // 100%;
  height: 600px; // 100%;
}

.dicom-metadata {
  border: 10px solid green; //none
  width: 500px;
  height: auto; //100%;
  padding: 20px;
  margin-left: 20px;
  //display: block;
}

.dicom-metadata-item {
  display: none;
}

#dicom-viewer-show-metadata {
  justify-content: right;
}

#metadata-toggle-sidebar {
  vertical-align: middle;
  border: 3px solid transparent;
  &:hover {
    background-color: var(--oc-color-background-hover);
    border-radius: 3px;
  }
}

#dicom-viewer-vip-metadata {
  color: var(--oc-color-icon-image);
  z-index: 2;
  margin: 10px;
}
</style>
