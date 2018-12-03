<template>
  <div class="file-upload">
    <div class="input-wrapper">
      <input id="file-upload-input" type="file" name="file" @change="onChangeInputFile" :multiple="false" :disabled="uploading" ref="input" />
      <label v-if="!uploading" for="file-upload-input">
      <v-icon large>cloud_upload</v-icon>
      </label>
      <v-progress-circular v-if="uploading" :value="progress">{{ progress }}</v-progress-circular>
    </div>
  </div>
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
  #file-upload-input {
    position: absolute;
    left: -99999px;
  }
</style>
