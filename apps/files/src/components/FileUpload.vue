<template>
  <li @click="triggerUpload">
    <oc-icon name="cloud_upload"></oc-icon>
    <span v-translate>Upload</span>
    <input id="fileUploadInput" type="file" name="file" @change="onChangeInputFile" multiple ref="input" />
  </li>
</template>

<script>
import FileUpload from '../FileUpload.js'
import { mapActions, mapGetters } from 'vuex'
import { find } from 'lodash'

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
    }
  },
  computed: {
    ...mapGetters('Files', ['inProgress', 'files'])
  },
  methods: {
    ...mapActions('Files', ['addFileToProgress']),
    ...mapActions(['showNotification']),
    triggerUpload () {
      this.$refs.input.click()
    },
    onChangeInputFile (e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      for (let file of files) {
        let exists = find(this.files, ['name', file.name])
        if (!exists) {
          this.upload(file)
        } else {
          this.showNotification({
            title: this.$gettextInterpolate('Upload for %{file} failed - File already exists', { file: file.name }),
            type: 'error'
          })
        }
      }
    },

    upload (file) {
      this.addFileToProgress(file)
      let fileUpload = new FileUpload(file, this.url, this.headers, this.onProgress, this.requestType)
      fileUpload
        .upload(this.additionalData)
        .then(e => {
          this.$emit('success', e, file)
          this.cleanInput()
        })
        .catch(e => {
          this.$emit('error', e)
          this.cleanInput()
        })
    },

    cleanInput () {
      let input = this.$refs.input
      if (input) {
        input.value = ''
      }
    },

    onProgress (e, file) {
      let progress = parseInt(e.loaded * 100 / e.total)
      this.$emit('progress', {
        fileName: file.name,
        progress
      })
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
