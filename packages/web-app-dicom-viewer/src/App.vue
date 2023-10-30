<template>
  <div class="dicom-viewer oc-width-1-1 oc-height-1-1 oc-flex">
    <div
      v-show="displayDicomViewerMain"
      id="dicom-viewer-main"
      class="oc-position-relative oc-flex oc-flex-center oc-flex-middle oc-flex-around oc-p-s"
      :class="isShowMetadataActivated ? 'oc-width-2-3' : 'oc-width-1-1'"
    >
      <div id="dicom-canvas" class="dicom-canvas oc-position-relative">
        <div
          v-if="isVipMetadataFetched"
          id="dicom-viewer-vip-metadata"
          class="oc-position-absolute"
        >
          <div class="oc-pr-s oc-font-semibold">
            <span>{{ vipInformation.patientName || 'patient name not defined' }}</span>
            <span>
              (*{{
                formatDate(vipInformation.patientBirthdate, true) || 'birthdate not defined'
              }})</span
            >
          </div>
          <div class="oc-pr-s oc-font-semibold">
            <span>{{ vipInformation.institutionName || 'institution name not defined' }}</span
            >,
            <span>{{
              formatDateAndTime(
                vipInformation.instanceCreationDate,
                vipInformation.instanceCreationTime
              ) || 'instance creation date and time not defined'
            }}</span>
          </div>
        </div>
      </div>
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
        :is-small-screen="isSmallScreen"
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
      :patientInformation="patientInformation"
      :studyInformation="studyInformation"
      :seriesInformation="seriesInformation"
      :instanceInformation="instanceInformation"
      :imageInformation="imageInformation"
      :equipmentInformation="equipmentInformation"
      :scanningInformation="scanningInformation"
      :uidsInformation="uidsInformation"
      :otherInformation="otherInformation"
      :is-metadata-extracted="isMetadataExtracted"
      :is-small-screen="isSmallScreen"
      @close-metadata-sidebar="toggleShowMetadata"
    />
  </div>
</template>

<script lang="ts">
// import cornerstone packages
import dicomParser from 'dicom-parser'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'

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
const shortDateTimeFormat = true
const longDateTimeFormat = false

// specify external dependencies
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
    patientInformation: {
      type: Array
    },
    studyInformation: {
      type: Array
    },
    seriesInformation: {
      type: Array
    },
    instanceInformation: {
      type: Array
    },
    imageInformation: {
      type: Array
    },
    equipmentInformation: {
      type: Array
    },
    scanningInformation: {
      type: Array
    },
    uidsInformation: {
      type: Array
    },
    otherInformation: {
      type: Array
    }
  },
  setup(props) {
    const { $gettext } = useGettext()

    return {
      // dicom metadata
      vipInformation: {
        patientName: '',
        patientBirthdate: '',
        institutionName: '',
        instanceCreationDate: '',
        instanceCreationTime: ''
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
      instanceInformation: {
        instanceNumber: '',
        acquisitionNumber: '',
        acquisitionDate: '',
        acquisitionTime: '',
        instanceCreationDate: '',
        instanceCreationTime: '',
        contentDate: '',
        contentTime: ''
      },
      imageInformation: {
        rowsX_Columns: '',
        photometricInterpretation: '',
        imageType: '',
        bitsAllocated: '',
        bitsStored: '',
        highBit: '',
        pixelRepresentation: '',
        rescaleSlope: '',
        rescaleIntercept: '',
        imagePositionPatient: '',
        imageOrientationPatient: '',
        patientPosition: '',
        pixelSpacing: '',
        samplesPerPixel: '',
        imageComments: ''
      },
      equipmentInformation: {
        manufacturer: '',
        model: '',
        stationName: '',
        AE_Title: '',
        institutionName: '',
        softwareVersion: '',
        implementationVersionName: ''
      },
      scanningInformation: {
        scanningSequence: '',
        sequenceVariant: '',
        scanOptions: '',
        sliceThickness: '',
        repetitionTime: '',
        echoTime: '',
        inversionTime: '',
        imagingFrequency: '',
        imagedNucleus: '',
        echoNumbers: '',
        magneticFieldStrength: '',
        spacingBetweenSlices: '',
        numberOfPhaseEncodingSteps: '',
        echoTrainLength: ''
      },
      uidsInformation: {
        studyUID: '',
        seriesUID: '',
        instanceUID: '',
        SOP_ClassUID: '',
        transferSyntaxUID: '',
        frameOfReferenceUID: ''
      },
      otherInformation: {
        specificCharacterSet: '',
        referringPhysicianName: '',
        MR_AcquisitionType: '',
        numberOfAverages: '',
        percentSampling: '',
        percentPhaseFieldOfView: '',
        lowRR_Value: '',
        highRR_Value: '',
        intervalsAcquired: '',
        intervalsRejected: '',
        heartRate: '',
        recieveCoilName: '',
        transmitCoilName: '',
        inPlanePhaseEncodingDirection: '',
        flipAngle: '',
        positionReferenceIndicator: '',
        windowCenter: '',
        windowWidth: ''
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
      viewportCameraParallelScale: 1,
      dicomFile: null,
      dicomFileName: null,
      dicomUrl: null,
      imageData: null,
      toolInfoElement: null,
      currentImageZoom: 1,
      currentImageRotation: 0,
      isVipMetadataFetched: false,
      isMetadataFetched: false,
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
    await this.fetchVipMetadataInformation(await this.addWadouriPrefix(this.url))

    // prefetch all other metadata (in separate function for performance reasons)
    await this.fetchMetadataInformation(await this.addWadouriPrefix(this.url))
  },
  // "beforeMount" is called right before the component is to be mounted
  beforeMount() {
    console.log('lifecycle @ beforeMount')
  },
  // "mounted" is called when component has been added to DOM
  async mounted() {
    console.log('lifecycle @ mounted')
    // check if cornerstone core is initalized
    if (!cornerstone.isCornerstoneInitialized()) {
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

    // add resource to stack
    // ensure resource url is not empty!
    if (this.url != null && this.url != undefined && this.url != '') {
      if (this.resource != (null || undefined)) {
        this.dicomFileName = this.resource.name
      }

      let dicomResourceUrl = await this.addWadouriPrefix(this.url)

      // define a stack containing a single image
      const dicomStack = [dicomResourceUrl]

      // set stack on the viewport (currently only one image in the stack, therefore no frame # required)
      await this.viewport.setStack(dicomStack)

      // render the image (updates every viewport in the rendering engine)
      this.viewport.render()
      this.isDicomFileRendered = true
      this.setViewportCameraParallelScaleFactor()

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
    // also check if it is needed to recalculate scalefactor
    // this.setViewportCameraParallelScaleFactor()
  },
  // cleaning up component, leaving no variables or events that could cause memory leaks to app
  beforeUnmount() {
    console.log('lifecycle @ beforeUnmount')
    this.renderingEngine.destroy()
    this.isDicomFileRendered = false
    this.isMetadataExtracted = false
    this.isVipMetadataFetched = false
    this.isMetadataFetched = false
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
    async addWadouriPrefix(url: String) {
      return 'wadouri:' + url
    },
    async fetchVipMetadataInformation(imageId) {
      console.log('fetch vip meta data information for: ' + imageId)

      let patientName, patientBirthdate, institutionName, instanceCreationDate, instanceCreationTime

      await cornerstoneDICOMImageLoader.wadouri
        .loadImage(imageId)
        .promise.then(async function (dicomImage) {
          patientName = dicomImage.data.string('x00100010')
          patientBirthdate = dicomImage.data.string('x00100030')
          institutionName = dicomImage.data.string('x00080080')
          instanceCreationDate = dicomImage.data.string('x00080012')
          instanceCreationTime = dicomImage.data.string('x00080013')
        })

      this.vipInformation.patientName = patientName
      this.vipInformation.patientBirthdate = patientBirthdate
      this.vipInformation.institutionName = institutionName
      this.vipInformation.instanceCreationDate = instanceCreationDate
      this.vipInformation.instanceCreationTime = instanceCreationTime

      this.isVipMetadataFetched = true
    },
    async fetchMetadataInformation(imageId) {
      console.log('fetch meta data information for: ' + imageId)

      //patientInformation
      let patientName, patientID, patientBirthday, patientSex, patientWeight

      //studyInformation
      let studyDescription, protocolName, accessionNumber, studyID, studyDate, studyTime

      // seriesInformation
      let seriesDescription, seriesNumber, modality, bodyPart, seriesDate, seriesTime

      // instanceInformation
      let instanceNumber,
        acquisitionNumber,
        acquisitionDate,
        acquisitionTime,
        instanceCreationDate,
        instanceCreationTime,
        contentDate,
        contentTime

      // imageInformation
      let photometricInterpretation,
        imageType,
        rescaleSlope,
        rescaleIntercept,
        imagePositionPatient,
        imageOrientationPatient,
        patientPosition,
        pixelSpacing,
        imageComments

      // equipmentInformation
      let manufacturer,
        model,
        stationName,
        AE_Title,
        institutionName,
        softwareVersion,
        implementationVersionName

      // scanningInformation
      let scanningSequence,
        sequenceVariant,
        scanOptions,
        sliceThickness,
        repetitionTime,
        echoTime,
        inversionTime,
        imagingFrequency,
        imagedNucleus,
        echoNumbers,
        magneticFieldStrength,
        spacingBetweenSlices,
        numberOfPhaseEncodingSteps,
        echoTrainLength

      // uidsInformation
      let studyUID, seriesUID, instanceUID, SOP_ClassUID, transferSyntaxUID, frameOfReferenceUID

      // otherInformation
      let specificCharacterSet,
        referringPhysicianName,
        MR_AcquisitionType,
        numberOfAverages,
        percentSampling,
        percentPhaseFieldOfView,
        lowRR_Value,
        highRR_Value,
        intervalsAcquired,
        intervalsRejected,
        heartRate,
        recieveCoilName,
        transmitCoilName,
        inPlanePhaseEncodingDirection,
        flipAngle,
        positionReferenceIndicator,
        windowCenter,
        windowWidth

      await cornerstoneDICOMImageLoader.wadouri
        .loadImage(imageId)
        .promise.then(async function (dicomImage) {
          patientID = dicomImage.data.string('x00100020')
          patientSex = dicomImage.data.string('x00100040')
          patientWeight = dicomImage.data.string('x00101030')

          studyDescription = dicomImage.data.string('x00081030')
          protocolName = dicomImage.data.string('x00181030')
          accessionNumber = dicomImage.data.string('x00080050')
          studyID = dicomImage.data.string('x00200010')
          studyDate = dicomImage.data.string('x00080020')
          studyTime = dicomImage.data.string('x00080030')

          seriesDescription = dicomImage.data.string('x0008103e')
          seriesNumber = dicomImage.data.string('x00200011')
          modality = dicomImage.data.string('x00080060')
          bodyPart = dicomImage.data.string('x00180015') //   Body Part Examined? or Body Part Thickness?
          seriesDate = dicomImage.data.string('x00080021')
          seriesTime = dicomImage.data.string('x00080031')

          instanceNumber = dicomImage.data.string('x00200013')
          acquisitionNumber = dicomImage.data.string('x00200012')
          acquisitionDate = dicomImage.data.string('x00080022')
          acquisitionTime = dicomImage.data.string('x0008002A')
          instanceCreationDate = dicomImage.data.string('x00080012')
          instanceCreationTime = dicomImage.data.string('x00080013')
          contentDate = dicomImage.data.string('x00080023')
          contentTime = dicomImage.data.string('x00080033')

          photometricInterpretation = dicomImage.data.string('x00280004')
          imageType = dicomImage.data.string('x00080008')
          rescaleSlope = dicomImage.data.string('x00281053')
          rescaleIntercept = dicomImage.data.string('x00281052')
          imagePositionPatient = dicomImage.data.string('x00200032')
          pixelSpacing = dicomImage.data.string('x00280030')
          imageComments = dicomImage.data.string('x00204000')
          imageOrientationPatient = dicomImage.data.string('x00200037')
          patientPosition = dicomImage.data.string('x00185100')

          manufacturer = dicomImage.data.string('x00080070')
          model = dicomImage.data.string('x00081090') // Manufacturer's Model Name
          stationName = dicomImage.data.string('x00081010')
          AE_Title = dicomImage.data.string('x') //Retrieve AE Title? or Station AE Title?
          institutionName = dicomImage.data.string('x00080080')
          softwareVersion = dicomImage.data.string('x00181020')
          implementationVersionName = dicomImage.data.string('x00020013')

          scanningSequence = dicomImage.data.string('x00180020')
          sequenceVariant = dicomImage.data.string('x00180021')
          scanOptions = dicomImage.data.string('x00180022')
          sliceThickness = dicomImage.data.string('x00180050')
          repetitionTime = dicomImage.data.string('x00180080')
          echoTime = dicomImage.data.string('x00180081')
          inversionTime = dicomImage.data.string('x00180082')
          imagingFrequency = dicomImage.data.string('x00180084')
          imagedNucleus = dicomImage.data.string('x00180085')
          echoNumbers = dicomImage.data.string('x00180086')
          magneticFieldStrength = dicomImage.data.string('x00180087')
          spacingBetweenSlices = dicomImage.data.string('x00180088')
          numberOfPhaseEncodingSteps = dicomImage.data.string('x00180089')
          echoTrainLength = dicomImage.data.string('x00180091')

          studyUID = dicomImage.data.string('x0020000d') // Study Instance UID	?
          seriesUID = dicomImage.data.string('x0020000e') //Series Instance UID	?
          instanceUID = dicomImage.data.string('x00080018') // SOP Instance UID	?
          SOP_ClassUID = dicomImage.data.string('x00080016')
          transferSyntaxUID = dicomImage.data.string('x00020010')
          frameOfReferenceUID = dicomImage.data.string('x00200052')

          specificCharacterSet = dicomImage.data.string('x00080005')
          referringPhysicianName = dicomImage.data.string('x00080090')
          MR_AcquisitionType = dicomImage.data.string('x00180023')
          numberOfAverages = dicomImage.data.string('x00180083')
          percentSampling = dicomImage.data.string('x00180093')
          percentPhaseFieldOfView = dicomImage.data.string('x00180094')
          lowRR_Value = dicomImage.data.string('x00181081')
          highRR_Value = dicomImage.data.string('x00181082')
          intervalsAcquired = dicomImage.data.string('x00181083')
          intervalsRejected = dicomImage.data.string('x00181084')
          heartRate = dicomImage.data.string('x00181088')
          recieveCoilName = dicomImage.data.string('x00181250')
          transmitCoilName = dicomImage.data.string('x00181251')
          inPlanePhaseEncodingDirection = dicomImage.data.string('x00181312')
          flipAngle = dicomImage.data.string('x00181314')
          positionReferenceIndicator = dicomImage.data.string('x00201040')
          windowCenter = dicomImage.data.string('x00281050')
          windowWidth = dicomImage.data.string('x00281051')
        })

      //patientInformation
      this.patientInformation.patientName = this.vipInformation.patientName
      this.patientInformation.patientID = patientID
      this.patientInformation.patientBirthday = this.formatDate(
        this.vipInformation.patientBirthdate,
        longDateTimeFormat
      )
      this.patientInformation.patientSex = patientSex
      this.patientInformation.patientWeight = patientWeight

      //studyInformation
      this.studyInformation.studyDescription = studyDescription
      this.studyInformation.protocolName = protocolName
      this.studyInformation.accessionNumber = accessionNumber
      this.studyInformation.studyID = studyID
      this.studyInformation.studyDate = this.formatDate(studyDate, longDateTimeFormat)
      this.studyInformation.studyTime = this.formatTime(studyTime, longDateTimeFormat)

      // seriesInformation
      this.seriesInformation.seriesDescription = seriesDescription
      this.seriesInformation.seriesNumber = seriesNumber
      this.seriesInformation.modality = modality
      this.seriesInformation.bodyPart = bodyPart //: Body Part Examined? or Body Part Thickness?
      this.seriesInformation.seriesDate = this.formatDate(seriesDate, longDateTimeFormat)
      this.seriesInformation.seriesTime = this.formatTime(seriesTime, longDateTimeFormat)

      // instanceInformation
      this.instanceInformation.instanceNumber = instanceNumber
      this.instanceInformation.acquisitionNumber = acquisitionNumber
      this.instanceInformation.acquisitionDate = this.formatDate(
        acquisitionDate,
        longDateTimeFormat
      )
      this.instanceInformation.acquisitionTime = this.formatTime(
        acquisitionTime,
        longDateTimeFormat
      )
      this.instanceInformation.instanceCreationDate = this.formatDate(
        instanceCreationDate,
        longDateTimeFormat
      )
      this.instanceInformation.instanceCreationTime = this.formatTime(
        instanceCreationTime,
        longDateTimeFormat
      )
      this.instanceInformation.contentDate = this.formatDate(contentDate, longDateTimeFormat)
      this.instanceInformation.contentTime = this.formatTime(contentTime, longDateTimeFormat)

      // imageInformation
      this.imageInformation.photometricInterpretation = photometricInterpretation
      this.imageInformation.imageType = imageType
      this.imageInformation.rescaleSlope = rescaleSlope
      this.imageInformation.rescaleIntercept = rescaleIntercept
      this.imageInformation.imagePositionPatient = imagePositionPatient
      this.imageInformation.imageOrientationPatient = imageOrientationPatient
      this.imageInformation.patientPosition = patientPosition
      this.imageInformation.pixelSpacing = pixelSpacing
      this.imageInformation.imageComments = imageComments

      // equipmentInformation
      this.equipmentInformation.manufacturer = manufacturer
      this.equipmentInformation.model = model
      this.equipmentInformation.stationName = stationName
      this.equipmentInformation.AE_Title = AE_Title
      this.equipmentInformation.institutionName = institutionName
      this.equipmentInformation.softwareVersion = softwareVersion
      this.equipmentInformation.implementationVersionName = implementationVersionName

      // scanningInformation
      this.scanningInformation.scanningSequence = scanningSequence
      this.scanningInformation.sequenceVariant = sequenceVariant
      this.scanningInformation.scanOptions = scanOptions
      this.scanningInformation.sliceThickness = sliceThickness
      this.scanningInformation.repetitionTime = repetitionTime
      this.scanningInformation.echoTime = echoTime
      this.scanningInformation.inversionTime = inversionTime
      this.scanningInformation.imagingFrequency = imagingFrequency
      this.scanningInformation.imagedNucleus = imagedNucleus
      this.scanningInformation.echoNumbers = echoNumbers
      this.scanningInformation.magneticFieldStrength = magneticFieldStrength
      this.scanningInformation.spacingBetweenSlices = spacingBetweenSlices
      this.scanningInformation.numberOfPhaseEncodingSteps = numberOfPhaseEncodingSteps
      this.scanningInformation.echoTrainLength = echoTrainLength

      // uidsInformation
      this.uidsInformation.studyUID = studyUID
      this.uidsInformation.seriesUID = seriesUID
      this.uidsInformation.instanceUID = instanceUID
      this.uidsInformation.SOP_ClassUID = SOP_ClassUID + ' [' + uids[SOP_ClassUID] + ']' // adding description of the SOP module
      this.uidsInformation.transferSyntaxUID = transferSyntaxUID
      this.uidsInformation.frameOfReferenceUID = frameOfReferenceUID

      // otherInformation
      this.otherInformation.specificCharacterSet = specificCharacterSet
      this.otherInformation.referringPhysicianName = referringPhysicianName
      this.otherInformation.MR_AcquisitionType = MR_AcquisitionType
      this.otherInformation.numberOfAverages = numberOfAverages
      this.otherInformation.percentSampling = percentSampling
      this.otherInformation.percentPhaseFieldOfView = percentPhaseFieldOfView
      this.otherInformation.lowRR_Value = lowRR_Value
      this.otherInformation.highRR_Value = highRR_Value
      this.otherInformation.intervalsAcquired = intervalsAcquired
      this.otherInformation.intervalsRejected = intervalsRejected
      this.otherInformation.heartRate = heartRate
      this.otherInformation.recieveCoilName = recieveCoilName
      this.otherInformation.transmitCoilName = transmitCoilName
      this.otherInformation.inPlanePhaseEncodingDirection = inPlanePhaseEncodingDirection
      this.otherInformation.flipAngle = flipAngle
      this.otherInformation.positionReferenceIndicator = positionReferenceIndicator
      this.otherInformation.windowCenter = windowCenter
      this.otherInformation.windowWidth = windowWidth

      this.isMetadataFetched = true
      // TODO: check that data only gets displayed after all metadata has been fetched
    },
    extractMetadataFromViewport(imageId: String) {
      // get metadata from viewport
      this.imageData = this.viewport.getImageData() // returns IImageData object, see https://www.cornerstonejs.org/api/core/namespace/Types#IImageData

      if (imageId != (null || undefined) && typeof imageId == 'string') {
        console.log('extracting metadata from viewport for image id: ' + imageId)
        const { pixelRepresentation, bitsAllocated, bitsStored, highBit, samplesPerPixel } =
          metaData.get('imagePixelModule', imageId)

        // adding values to corresponding variable
        this.imageInformation.rowsX_Columns =
          this.imageData.dimensions[0] + ' x ' + this.imageData.dimensions[1]
        /*
        this.exampleInformation.direction = this.imageData.direction
          .map((x) => Math.round(x * 100) / 100)
          .join(',')
          // same as Image Orientation Patient
        this.exampleInformation.origin = this.imageData.origin
          .map((x) => Math.round(x * 100) / 100)
          .join(',')
          // same as Image Position Patient
        */
        this.imageInformation.bitsAllocated = bitsAllocated
        this.imageInformation.bitsStored = bitsStored
        this.imageInformation.highBit = highBit
        this.imageInformation.pixelRepresentation = pixelRepresentation
        this.imageInformation.samplesPerPixel = samplesPerPixel

        this.isMetadataExtracted = true
        console.log('metadata from viewport extracted')
      } else {
        console.log('no image meta data available available for extraction from viewport')
      }
    },
    setViewportCameraParallelScaleFactor() {
      const camera = this.viewport.getCamera()
      this.viewportCameraParallelScale = camera.parallelScale
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

        let formattedDate = formatDateFromISO(
          DateTime.fromISO(tempDateTimeString),
          this.$language.current,
          isShort ? DateTime.DATE_SHORT : DateTime.DATE_MED
        )

        return upperFirst(formattedDate)
      }
    },
    formatTime(time: string, isSimple: boolean) {
      // transform time string retrieved from dicom metadata into a string that is valid for formatDateFromISO ('YYYY-MM-DDTHH:MM:SS')
      // description of input format see https://dicom.nema.org/dicom/2013/output/chtml/part05/sect_6.2.html, VR Name 'TM'
      // isSimple determins output format (DateTime.DATE_MED or DateTime.DATE_SHORT), see https://moment.github.io/luxon/api-docs/index.html
      if (time != undefined && time.length >= 4) {
        let tempDateTimeString =
          '1970-01-01T' +
          time.substring(0, 2) +
          ':' +
          time.substring(2, 4) +
          ':' +
          (time.length >= 6 ? time.substring(4, 6) : '00')

        let formattedTime = formatDateFromISO(
          DateTime.fromISO(tempDateTimeString),
          this.$language.current,
          isSimple ? DateTime.TIME_SIMPLE : DateTime.TIME_24_WITH_SECONDS
        )

        return upperFirst(formattedTime)
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
      this.currentImageZoom = newZoomFactor
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
      this.currentImageRotation = newRotation
      const { rotation } = this.viewport.getProperties()
      this.viewport.setProperties({ rotation: this.currentImageRotation })
      this.viewport.render()
    },
    setHorizontalFlip() {
      const { flipHorizontal } = this.viewport.getCamera()
      this.viewport.setCamera({ flipHorizontal: !flipHorizontal })
      this.viewport.render()
    },
    setVerticalFlip() {
      const { flipVertical } = this.viewport.getCamera()
      this.viewport.setCamera({ flipVertical: !flipVertical })
      this.viewport.render()
    },
    toggleInversion() {
      const { invert } = this.viewport.getProperties()
      this.viewport.setProperties({ invert: !invert })
      this.viewport.render()
    },
    resetViewport() {
      this.currentImageZoom = 1
      this.currentImageRotation = 0
      this.viewport.resetCamera()
      this.viewport.resetProperties()
      this.viewport.render()
    },
    toggleShowMetadata() {
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
}

.dicom-metadata-item {
  display: none;
}

#dicom-viewer-toggle-metadata-sidebar {
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

.dicom-metadata-section-title {
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
