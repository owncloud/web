<template>
    <oc-nav-item v-if="checkIfBrowserSupportsFolderUpload" icon="cloud_upload" @click="triggerUpload">
        <span v-translate>Upload Folder</span>
        <div slot="outer-content">
            <input id="folderUploadInput" type="file" name="folder" @change="$_ocUpload_addDirectoryToQue" webkitdirectory mozdirectory allowdirs ref="input" />
        </div>
    </oc-nav-item>
</template>

<script>
import Mixins from '../mixins'
export default {
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
  mixins: [
    Mixins
  ],
  methods: {
    triggerUpload () {
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
