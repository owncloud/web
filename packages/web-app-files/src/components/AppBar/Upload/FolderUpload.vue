<template>
  <div>
    <oc-button class="oc-width-1-1" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-resource-icon :resource="{ isFolder: true, extension: '' }" size="medium" />
      <span id="files-folder-upload-button" v-translate>Folder</span>
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
      @change="$_ocUpload_addDirectoryToQueue"
    />
  </div>
</template>

<script>
import Mixins from '../../../mixins'

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
