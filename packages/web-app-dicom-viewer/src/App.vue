<template>
  <div class="dicom-viewer oc-width-1-1 oc-height-1-1 oc-flex">
    <div
      v-show="displayDicomViewerMain"
      id="dicom-viewer-main"
      class="oc-position-relative oc-flex oc-flex-center oc-flex-middle oc-flex-around oc-p-s"
      :class="isShowMetadataActivated ? 'oc-width-2-3' : 'oc-width-1-1'"
    >
      <!-- div element for dicom viewport -->
      <div id="dicom-canvas" class="dicom-canvas oc-position-relative">
        <!-- vip meta data -->
        <div
          v-if="isVipMetadataFetched"
          id="dicom-viewer-vip-metadata"
          class="oc-position-absolute"
        >
          <div class="oc-pr-s oc-font-semibold">
            <span>{{
              dicomMetadata.vipInformation.patientName || 'patient name not defined'
            }}</span>
            <span>
              (*{{
                formatDate(dicomMetadata.vipInformation.patientBirthdate, true) ||
                'birthdate not defined'
              }})</span
            >
          </div>
          <div class="oc-pr-s oc-font-semibold">
            <span>{{
              dicomMetadata.vipInformation.institutionName || 'institution name not defined'
            }}</span
            >,
            <span>{{
              formatDateAndTime(
                dicomMetadata.vipInformation.instanceCreationDate,
                dicomMetadata.vipInformation.instanceCreationTime
              ) || 'instance creation date and time not defined'
            }}</span>
          </div>
        </div>
      </div>
      <!-- toggle for metadata sidebar -->
      <div id="dicom-viewer-toggle-metadata-sidebar" class="oc-flex oc-position-absolute">
        <oc-button
          id="toggle-metadata-sidebar"
          v-oc-tooltip="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          class="preview-controls-show-metadata oc-m-s oc-p-xs"
          appearance="raw"
          variation="brand"
          :aria-label="
            isShowMetadataActivated ? imageHideMetadataDescription : imageShowMetadataDescription
          "
          @click="toggleShowMetadata"
        >
          <oc-icon
            :fill-type="isShowMetadataActivated ? 'fill' : 'line'"
            name="side-bar-right"
            variation="inherit"
          />
        </oc-button>
      </div>
      <dicom-controls
        :files="dicomFiles"
        :active-index="0"
        :is-folder-loading="false"
        :current-image-rotation="currentImageRotation"
        :current-image-zoom="currentImageZoom"
        :is-show-metadata-activated="isShowMetadataActivated"
        @set-zoom="setZoom"
        @set-rotation="setRotation"
        @set-horizontal-flip="setHorizontalFlip"
        @set-vertical-flip="setVerticalFlip"
        @toggle-inversion="toggleInversion"
        @reset-viewport="resetViewport"
        @toggle-show-metadata="toggleShowMetadata"
        @toggle-previous="prev"
        @toggle-next="next"
      />
    </div>

    <metadata-sidebar
      v-show="isShowMetadataActivated"
      :exampleInformation="exampleInformation"
      :patientInformation="patientInformation"
      :studyInformation="studyInformation"
      :seriesInformation="seriesInformation"
      :dicom-metadata="dicomMetadata"
      :is-metadata-extracted="isMetadataExtracted"
      :is-small-screen="isSmallScreen"
      @close-metadata-sidebar="toggleShowMetadata"
    />
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

import { init as csToolsInit } from '@cornerstonejs/tools'

import { RenderingEngine, Types, Enums, metaData } from '@cornerstonejs/core'

// vue imports
import { defineComponent, computed, ref, unref } from 'vue'
import type { PropType } from 'vue'
import { useGettext } from 'vue3-gettext'

// other imports
import { Resource } from 'web-client/src'
//import { useDownloadFile } from 'web-pkg/src/composables/download/useDownloadFile'
import DicomControls from './components/DicomControls.vue'
import MetadataSidebar from './components/MetadataSidebar.vue'
import uids from './helper/uids'
import { formatDateFromISO } from 'web-pkg/src/helpers'
import { DateTime } from 'luxon'
import upperFirst from 'lodash-es/upperFirst'

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
    DicomControls,
    MetadataSidebar
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
    },
    exampleInformation: {
      type: Array
    },
    patientInformation: {
      type: Array
    },
    studyInformation: {
      type: Array
    },
    seriesInformation: {
      type: Array
    }
  },
  setup(props) {
    const { $gettext } = useGettext()

    return {
      // dicom metadata
      dicomMetadata: {
        vipInformation: {
          patientName: '',
          patientBirthdate: '',
          institutionName: '',
          instanceCreationDate: '',
          instanceCreationTime: ''
        }
      },
      exampleInformation: {
        transferSyntax: '',
        SOP_ClassUID: '',
        SOP_InstanceUID: '',
        rows: '',
        columns: '',
        spacing: '',
        direction: '',
        origin: '',
        modality: '',
        pixelRepresentation: '',
        bitsAllocated: '',
        bitsStored: '',
        highBit: '',
        photometricInterpretation: '',
        windowWidth: '',
        windowCenter: ''
      },
      patientInformation: {
        patientName: '',
        patientID: '',
        patientBirthday: '',
        patientSex: '',
        patientWeight: ''
      },
      studyInformation: {
        studyDescription: '',
        protocolName: '',
        accessionNumber: '',
        studyID: '',
        studyDate: '',
        studyTime: ''
      },
      seriesInformation: {
        seriesDescription: '',
        seriesNumber: '',
        modality: '',
        bodyPart: '',
        seriesDate: '',
        seriesTime: ''
      },
      instanceInformation: {},
      imageInformation: {},
      equipmentInformation: {},
      scanningInformation: {},
      uidsInformation: {},
      otherInformation: {},
      patientInfo: {
        patientName: '',
        patientBirthdate: '',
        institutionName: '',
        instanceCreationDate: '',
        instanceCreationTime: ''
      },

      imageShowMetadataDescription: $gettext('Show DICOM metadata'),
      imageHideMetadataDescription: $gettext('Hide DICOM metadata')
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
      isMetadataExtracted: false,
      element: null,
      renderingEngine: null,
      viewport: null,
      viewportCameraParallelScale: 137.3853139193763, // TODO: initialize this automatically to the correct value and adjust it when size of the viewport changes
      dicomFile: null,
      dicomFileName: null,
      dicomUrl: null,
      imageData: null,
      metaDataElement: null,
      metaDataItems: null,
      toolInfoElement: null,
      currentImageZoom: 1,
      currentImageRotation: 0,
      isVipMetadataFetched: false,
      isShowMetadataActivated: false,
      isSmallScreen: false, //TODO: implement a method that sets this to true if screensize / browser size is too small to display the main part of dicom viewer together with metadata sidebar
      dicomFiles: [this.resource]
    }
  },
  computed: {
    displayDicomViewerMain() {
      if (this.isSmallScreen && this.isShowMetadataActivated) {
        return false
      }
      return true
    },
    instanceCreationDateTimeFormatedDate() {
      // transforming date and time into a string that is valid for formatDateFromHTTP ('YYYY-MM-DDTHH:MM:SS')
      if (
        this.dicomMetadata.vipInformation.instanceCreationDate != undefined &&
        this.dicomMetadata.vipInformation.instanceCreationTime != undefined &&
        this.dicomMetadata.vipInformation.instanceCreationDate.length >= 8 &&
        this.dicomMetadata.vipInformation.instanceCreationTime.length >= 6
      ) {
        let dateString =
          this.dicomMetadata.vipInformation.instanceCreationDate.substring(0, 4) +
          '-' +
          this.dicomMetadata.vipInformation.instanceCreationDate.substring(4, 6) +
          '-' +
          this.dicomMetadata.vipInformation.instanceCreationDate.substring(6, 8) +
          'T' +
          this.dicomMetadata.vipInformation.instanceCreationTime.substring(0, 2) +
          ':' +
          this.dicomMetadata.vipInformation.instanceCreationTime.substring(2, 4) +
          ':' +
          this.dicomMetadata.vipInformation.instanceCreationTime.substring(4, 8)

        let formatedDate = formatDateFromISO(
          DateTime.fromISO(dateString),
          this.$language.current,
          DateTime.DATETIME_MED
        )

        return upperFirst(formatedDate)
      } else {
        console.log('invalid date and/or time input')
        return 'instance creation date and time undefined'
      }
    }
  },
  watch: {},

  // --------------------------
  // vue js lifecylce functions
  // --------------------------

  // "created" runs before DOM is rendered, data and events are already accessible
  async created() {
    console.log('lifecycle @ created')

    // get resource, ensure resource url is not empty!
    if (this.url != null && this.url != undefined && this.url != '') {
      if (this.resource != (null || undefined)) {
        this.dicomFileName = this.resource.name
      }
      this.dicomUrl = await this.addWadouriPrefix(this.url)
    }

    // get vip metadata
    // maybe also prefetch other metadata?
    const dicomMetadataInformation = await this.fetchMetadataInformation(
      await this.addWadouriPrefix(this.url)
    )
    this.dicomMetadata.vipInformation.patientName = dicomMetadataInformation[0]
    this.dicomMetadata.vipInformation.patientBirthdate = dicomMetadataInformation[1]
    this.dicomMetadata.vipInformation.institutionName = dicomMetadataInformation[2]
    this.dicomMetadata.vipInformation.instanceCreationDate = dicomMetadataInformation[3]
    this.dicomMetadata.vipInformation.instanceCreationTime = dicomMetadataInformation[4]
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
    // initialize value for viewport camera parallel scale
    // this.viewportCameraParallelScale = this.viewport.getCamera().parallelScale
    // this could also be calculated by getting ratio between width of the resource and viewport
    // needs to get updated if viewport size changes

    // set reference to HTML element for metadata
    // metadata root element
    this.metaDataElement = document.getElementById('dicom-metadata') as HTMLDivElement
    // child elements
    this.metaDataItems = document.getElementsByClassName(
      'dicom-metadata-item'
    ) as HTMLCollectionOf<HTMLDivElement>

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

      // set stack on the viewport (currently only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image (updates every viewport in the rendering engine)
      this.viewport.render()
      this.isDicomFileRendered = true

      // get metadata
      this.imageData = this.viewport.getImageData()

      // setting metadata
      this.extractMetadataFromViewport(dicomResourceUrl)
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
    this.isMetadataExtracted = false
    this.isVipMetadataFetched = false
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
    extractMetadataFromViewport(imageId: String) {
      // get metadata from viewport
      this.imageData = this.viewport.getImageData() // returns IImageData object, see https://www.cornerstonejs.org/api/core/namespace/Types#IImageData

      if (imageId != (null || undefined) && typeof imageId == 'string') {
        console.log('extracting metadata from viewport for image id: ' + imageId)
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

        // adding values to corresponding variable
        this.exampleInformation.transferSyntax = transferSyntax.transferSyntaxUID
        this.exampleInformation.SOP_ClassUID =
          sopCommonModule.sopClassUID + ' [' + uids[sopCommonModule.sopClassUID] + ']' // adding description of the SOP module
        this.exampleInformation.SOP_InstanceUID = sopCommonModule.sopInstanceUID
        this.exampleInformation.rows = this.imageData.dimensions[0]
        this.exampleInformation.columns = this.imageData.dimensions[1]
        this.exampleInformation.spacing = this.imageData.spacing.join('\\')
        this.exampleInformation.direction = this.imageData.direction
          .map((x) => Math.round(x * 100) / 100)
          .join(',')
        this.exampleInformation.origin = this.imageData.origin
          .map((x) => Math.round(x * 100) / 100)
          .join(',')
        this.exampleInformation.modality = this.imageData.metadata.Modality
        this.exampleInformation.pixelRepresentation = pixelRepresentation
        this.exampleInformation.bitsAllocated = bitsAllocated
        this.exampleInformation.bitsStored = bitsStored
        this.exampleInformation.highBit = highBit
        this.exampleInformation.photometricInterpretation = photometricInterpretation
        if (voiLutModuleLocal.windowWidth != (null || undefined)) {
          this.exampleInformation.windowWidth = voiLutModuleLocal.windowWidth.toString()
        }
        if (voiLutModuleLocal.windowCenter != (null || undefined)) {
          this.exampleInformation.windowCenter = voiLutModuleLocal.windowCenter.toString()
        }
        this.isMetadataExtracted = true
        console.log('metadata from viewport extracted')
      } else {
        console.log('no image meta data available available for extraction from viewport')
      }
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
      this.extractMetadataFromViewport(imageId)
    },
    readMyFile(f: File) {
      let reader = new FileReader()
      reader.readAsText(f, 'UTF-8')
      reader.onloadend = function () {
        let result = reader.result as String
        console.log('reading file lenght: ' + result.length)
      }
    },
    // functions for styling data
    formatDateAndTime(date: string, time: string) {
      // transforming date and time into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
      if (date != undefined && time != undefined && date.length >= 8 && time.length >= 6) {
        let tempDateTimeString =
          date.substring(0, 4) +
          '-' +
          date.substring(4, 6) +
          '-' +
          date.substring(6, 8) +
          'T' +
          time.substring(0, 2) +
          ':' +
          time.substring(2, 4) +
          ':' +
          time.substring(4, 6)

        let formatedDate = formatDateFromISO(
          DateTime.fromISO(tempDateTimeString),
          this.$language.current,
          DateTime.DATETIME_MED
        )

        return upperFirst(formatedDate)
      }
    },
    formatDate(date: string, isShort: boolean) {
      // transforming date into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
      // isShort determins output format (DateTime.DATE_MED or DateTime.DATE_SHORT), see https://moment.github.io/luxon/api-docs/index.html
      if (date != undefined && date.length >= 8) {
        let tempDateTimeString =
          date.substring(0, 4) +
          '-' +
          date.substring(4, 6) +
          '-' +
          date.substring(6, 8) +
          'T00:00:00'

        let formatedDate = formatDateFromISO(
          DateTime.fromISO(tempDateTimeString),
          this.$language.current,
          isShort ? DateTime.DATE_SHORT : DateTime.DATE_MED
        )

        return upperFirst(formatedDate)
      }
    },
    formatLabel(label: string) {
      // formatting camelcase labels into easily readible labels by adding a gap befor each upper case letter
      // there is no space added if there are multiple upper case letters in a row (e.g. ID)
      // in cases where such an abbreviation is followed by another word and underline should be added in the variable name, e.g. "SOP_InstanceUID" becomes "SOP Instance UID"

      const result = label.replace(/([A-Z]+)/g, ' $1').replace('_', '')

      // optionally make first letter of each word lower?
      // return upperFirst(result.toLowerCase())

      return upperFirst(result)
    },
    // functions relating to dicom controls
    prev() {
      console.log('prev clicked')
      // TODO: still needs to be implemented, similar to prev & next in preview app
    },
    next() {
      console.log('next clicked')
      // TODO: still needs to be implemented, similar to prev & next in preview app
    },
    setZoom(newZoomFactor) {
      console.log('zoom clicked')
      this.currentImageZoom = newZoomFactor
      console.log('new zoom factor: ' + this.currentImageZoom)
      const camera = this.viewport.getCamera()

      const newCamera = {
        parallelScale: this.viewportCameraParallelScale / this.currentImageZoom,
        position: camera.position,
        focalPoint: camera.focalPoint
      }

      this.viewport.setCamera(newCamera)
      this.viewport.render()
    },
    setRotation(newRotation) {
      console.log('rotate image clicked')
      this.currentImageRotation = newRotation
      const { rotation } = this.viewport.getProperties()
      this.viewport.setProperties({ rotation: this.currentImageRotation })
      this.viewport.render()
    },
    setHorizontalFlip() {
      console.log('flip horizontal clicked')
      const { flipHorizontal } = this.viewport.getCamera()
      this.viewport.setCamera({ flipHorizontal: !flipHorizontal })
      this.viewport.render()
    },
    setVerticalFlip() {
      console.log('flip vertical clicked')
      const { flipVertical } = this.viewport.getCamera()
      this.viewport.setCamera({ flipVertical: !flipVertical })
      this.viewport.render()
    },
    toggleInversion() {
      console.log('invert clicked')
      const { invert } = this.viewport.getProperties()
      this.viewport.setProperties({ invert: !invert })
      this.viewport.render()
    },
    resetViewport() {
      console.log('reset clicked')
      this.currentImageZoom = 1
      this.currentImageRotation = 0
      this.viewport.resetCamera()
      this.viewport.resetProperties()
      this.viewport.render()

      // for testing only
      const camera = this.viewport.getCamera()
      console.log('camera scale after reset: ' + camera.parallelScale)
    },
    toggleShowMetadata() {
      console.log('toggle show metadata clicked')
      this.isShowMetadataActivated = !this.isShowMetadataActivated
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
  //height: 100%; //calc(100% - 52px);
}

.dicom-canvas {
  border: none;
  width: 600px; // 100%;
  height: 600px; // 100%;
}

.dicom-metadata {
  border: none;
  width: 500px;
  height: auto; //100%;
  padding: 20px;
  margin-left: 20px;
  //display: block;
}

.dicom-metadata-item {
  display: none;
}

#dicom-viewer-toggle-metadata-sidebar {
  //justify-content: right;
  top: 0;
  right: 0;
}

#toggle-metadata-sidebar {
  vertical-align: middle;
  border: 3px solid transparent;
  &:hover {
    background-color: var(--oc-color-background-hover);
    border-radius: 3px;
  }
}

#dicom-viewer-vip-metadata {
  color: rgb(255, 117, 102);
  text-shadow: 0px 0px 3px rgba(0, 0, 0, 0.3);
  z-index: 2;
  margin: 10px;
}

/*
.header__title {
  border-bottom: 1px solid var(--oc-color-border);
}
*/

.dicom-metadata-section-title {
  //margin: 4px 0px 8px 0px;
  margin-bottom: 0px;
  padding-top: 16px !important;
  border-top: 1px solid var(--oc-color-border);
}

.details-table {
  tr {
    height: 1rem; // reducing hight, originally 1.5rem
  }

  border-bottom: 1px solid var(--oc-color-border);
}
</style>
