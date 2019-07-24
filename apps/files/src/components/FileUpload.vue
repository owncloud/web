<template>
  <oc-nav-item icon="file_upload" @click="triggerUpload">
    <span id="files-file-upload-button" v-translate>Upload File</span>
    <div slot="outer-content">
      <input id="fileUploadInput" type="file" name="file" @change="$_ocUpload_addFileToQue" multiple ref="input" />
    </div>
  </oc-nav-item>
</template>

<script>
import Mixins from '../mixins'

export default {
  props: {
    item: { type: String, required: true },
    url: { type: String, required: true },
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
  #fileUploadInput {
    position: absolute;
    left: -99999px;
  }
</style>
