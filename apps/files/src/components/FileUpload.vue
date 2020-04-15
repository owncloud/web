<template>
  <oc-nav-item icon="file_upload" @click="triggerUpload">
    <span id="files-file-upload-button" v-translate>Upload File</span>
    <div slot="outer-content">
      <input
        id="fileUploadInput"
        ref="input"
        type="file"
        aria-labelledby="files-file-upload-button"
        name="file"
        multiple
        @change="$_ocUpload_addFileToQue"
      />
    </div>
  </oc-nav-item>
</template>

<script>
import Mixins from '../mixins'

export default {
  mixins: [Mixins],
  props: {
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
#fileUploadInput {
  position: absolute;
  left: -99999px;
}
</style>
