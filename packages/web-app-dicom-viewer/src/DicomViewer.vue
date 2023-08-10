<template>
  <!-- check ouf if "application/dcm" is also needed in the type definition below -->
  <object
    class="dicom-viewer oc-width-1-1 oc-height-1-1"
    :data="url"
    type="application/octet-stream"
  >
    <!-- check ouf if the classes of the div below are still accurate/needed -->
    <div
      id="dicom-viewer"
      class="oc-height-1-1 oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium"
    >
      <!-- div element for dicom viewport -->
      <div id="dicom-canvas" class="dicom-canvas"></div>
    </div>
  </object>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    url: {
      type: String,
      required: true
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
