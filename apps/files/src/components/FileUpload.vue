<template>
  <li @click="triggerUpload">
    <div class="uk-flex uk-flex-middle">
      <oc-icon name="cloud_upload" class="uk-margin-small-right"></oc-icon>
      <span v-translate>Upload</span>
    </div>
    <input id="fileUploadInput" type="file" name="file" @change="$_ocUpload_addToQue" multiple ref="input" />
  </li>
</template>

<script>
import Mixins from '../mixins'

export default {
  props: {
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
