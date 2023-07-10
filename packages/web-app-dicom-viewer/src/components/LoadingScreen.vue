<template>
  <div class="oc-position-center oc-text-center">
    <oc-spinner size="xlarge" />
    <p v-translate class="oc-invisible">Loading DICOM file</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoadingScreen'
})
</script>
