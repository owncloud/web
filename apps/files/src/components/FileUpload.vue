<template>
  <v-list-tile @click="triggerUpload">
    <v-list-tile-action>
      <v-icon>cloud_upload</v-icon>
    </v-list-tile-action>
    <v-list-tile-title v-translate>Upload</v-list-tile-title>
    <input id="fileUploadInput" type="file" name="file" @change="onChangeInputFile" :multiple="false" :disabled="uploading" ref="input" />
  </v-list-tile>
</template>

<script>
import FileUpload from '../FileUpload.js'

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
  data () {
    return {
      progress: 0
    }
  },
  computed: {
    uploading () {
      return this.progress > 0
    },
    progressStyle () {
      return {
        width: `${this.progress}%`,
        display: this.uploading ? 'block' : 'none'
      }
    }
  },
  methods: {
    triggerUpload () {
      this.$refs.input.click()
    },
    onChangeInputFile (e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) return

      this.upload(files[0])
    },

    upload (file) {
      this.progress = 0.1
      let fileUpload = new FileUpload(this.url, this.headers, this.onProgress, this.requestType)
      fileUpload
        .upload(file, this.additionalData)
        .then(e => {
          this.$emit('success', e, file)
          this.progress = 0
          this.cleanInput()
        })
        .catch(e => {
          this.$emit('error', e)
          this.progress = 0
          this.cleanInput()
        })
    },

    cleanInput () {
      let input = this.$refs.input
      if (input) {
        input.value = ''
      }
    },

    onProgress (e) {
      this.progress = parseInt(e.loaded * 100 / e.total)
      this.$emit('progress', this.progress)
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
