<template>
  <!--
    // additional classes from preview app, check if they are needed oc-flex oc-flex-center
  oc-flex-middle oc-p-s oc-box-shadow-medium dicom-viewer" // more css classes from preview app
  :class="{ lightbox: isFullScreenModeActivated }

  <div class="oc-height-1-1 oc-position-center oc-text-center">
    <oc-spinner size="xlarge" />
    <p v-translate class="oc-invisible">Loading DICOM file</p>
  </div>
  -->
  <div
    class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium dicom-viewer"
  >
    <h1>DICOM will be displayed here</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SimpleDicomViewerScreen'
})
</script>

<style lang="scss" scoped>
.dicom-viewer {
  border: 10px solid blue;
  height: calc(100% - 52px);
}
</style>

<!--
<script lang="ts"></script>

// Packages
import Hammer from 'hammerjs'
import dicomParser from 'dicom-parser'
import * as cornerstone from 'cornerstone-core'
import * as cornerstoneMath from 'cornerstone-math'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as cornerstoneTools from '@cornerstonejs/tools'

// Externals
cornerstoneWADOImageLoader.external.cornerstone = cornerstone
cornerstoneWADOImageLoader.external.dicomParser = dicomParser
cornerstoneTools.external.cornerstoneMath = cornerstoneMath
cornerstoneTools.external.cornerstone = cornerstone
cornerstoneTools.external.Hammer = Hammer

// CodeSandbox live updates components in an odd way.
// We do this to protect ourselves from duplicate initializations
if (!cornerstoneWADOImageLoader.initialized) {
  // WadoImageLoader Registration/Config
  const config = {
    webWorkerPath: '/codecs/cornerstoneWADOImageLoaderWebWorker.js',
    taskConfiguration: {
      decodeTask: {
        codecsPath: '/codecs/cornerstoneWADOImageLoaderCodecs.js'
      }
    }
  }
  cornerstoneWADOImageLoader.webWorkerManager.initialize(config)
  cornerstoneWADOImageLoader.initialized = true
}
*/

export default {
  name: 'SimpleDicomViewerScreen'
  /*
  ,
  created() {
    cornerstoneTools.init({
      globalToolSyncEnabled: true
    })

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
