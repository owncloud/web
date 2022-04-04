<template>
  <div>
    <oc-button class="oc-width-1-1" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-resource-icon :resource="{ extension: '' }" />
      <span id="files-file-upload-button" v-translate>Files</span>
    </oc-button>
    <input
      id="fileUploadInput"
      ref="input"
      class="upload-input-target"
      type="file"
      aria-labelledby="files-file-upload-button"
      name="file"
      multiple
      tabindex="-1"
    />
  </div>
</template>

<script>
export default {
  methods: {
    triggerUpload() {
      this.$refs.input.click()
    }
  }
}
</script>

<style scoped="true">
#fileUploadInput {
  position: absolute;
  left: -99999px;
}
</style>
