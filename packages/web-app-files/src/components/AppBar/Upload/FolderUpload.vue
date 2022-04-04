<template>
  <div>
    <oc-button class="oc-width-1-1" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-resource-icon :resource="{ isFolder: true, extension: '' }" />
      <span id="files-folder-upload-button" v-translate>Folder</span>
    </oc-button>
    <input
      id="folderUploadInput"
      ref="input"
      class="upload-input-target"
      type="file"
      name="folder"
      aria-labelledby="files-folder-upload-button"
      webkitdirectory
      mozdirectory
      allowdirs
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
#folderUploadInput {
  position: absolute;
  left: -99999px;
}
</style>
