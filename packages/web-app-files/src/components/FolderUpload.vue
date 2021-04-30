<template>
  <div>
    <oc-button class="uk-width-1-1" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-icon name="cloud_upload" />
      <span id="files-folder-upload-button" v-translate>Upload Folder</span>
    </oc-button>
    <input
      id="folderUploadInput"
      ref="input"
      type="file"
      name="folder"
      aria-labelledby="files-folder-upload-button"
      webkitdirectory
      mozdirectory
      allowdirs
      tabindex="-1"
      @change="$_ocUpload_addDirectoryToQue"
    />
  </div>
</template>

<script>
import Mixins from '../mixins'

export default {
  mixins: [Mixins],
  props: {
    rootPath: { type: String, required: true },
    path: { type: String, required: true },
    headers: {
      type: Object,
      default: () => {
        return {}
      }
    },
    additionalData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    requestType: { type: String, default: 'PUT' }
  },
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
