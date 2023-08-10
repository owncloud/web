<template>
  <object
    class="dicom-viewer oc-width-1-1 oc-height-1-1"
    :data="url"
    type="application/octet-stream"
  />
</template>
<!-- check ouf if "application/dcm" is also needed here -->

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
.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.dicom-viewer {
  border: 10px solid blue; // none
  height: calc(100% - 52px);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.dicom-canvas {
  border: 10px solid yellow; //none
  width: 2000px; // 100%;
  height: 500px; // 100%;
}
</style>
