<template>
  <div>
    <oc-button class="oc-width-1-1" justify-content="left" appearance="raw" @click="triggerUpload">
      <oc-resource-icon :resource="{ extension: '' }" size="medium" />
      <span id="files-file-upload-button" v-translate>Files</span>
    </oc-button>
    <input
      id="fileUploadInput"
      ref="input"
      type="file"
      aria-labelledby="files-file-upload-button"
      name="file"
      multiple
      tabindex="-1"
      @change="$_ocUpload_addFileToQueue"
    />
  </div>
</template>

<script>
import Mixins from '../../../mixins'
import { mapState } from 'vuex'

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
  computed: {
    ...mapState(['user'])
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
