<template>
  <div>
      <p>versions side bar </p>
  </div>
</template>
<script>
import Mixins from '../mixins.js'
import { mapGetters } from 'vuex'

export default {
  mixins: [ Mixins ],
  data: () => ({
    versions: []
  }),
  mounted () {
    this.getFileVersions()
  },
  computed: {
    ...mapGetters('Files', ['selectedFiles']),
    ...mapGetters(['getToken']),
    hasVersion () {
      return this.versions.length > 0
    },
    currentFile () {
      return this.selectedFiles[0]
    }
  },
  methods: {
    restorePath (file) {
      let extension = this.currentFile.extension
      let filename = this.currentFile.name.replace(`.${extension}`, '')
      return `${filename}_v${this.currentVersionId(file)}.${extension}`
    },
    currentVersionId (file) {
      let etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    getFileVersions () {
      this.$client.fileVersions.listVersions(this.currentFile.id).then((res) => {
        if (res) this.versions = res
      })
    },
    revertVersion (file, restorePath = '/') {
      this.$client.fileVersions.restoreFileVersion(this.currentFile.id, this.currentVersionId(file), restorePath).then(() => {
        this.$emit('reload')
      })
    },
    downloadVersion (file) {
      const version = this.currentVersionId(file)
      const url = this.$client.fileVersions.getFileVersionUrl(this.currentFile.id, version)
      let anchor = document.createElement('a')

      let headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      fetch(url, { headers })
        .then(response => response.blob())
        .then(blobby => {
          let objectUrl = window.URL.createObjectURL(blobby)

          anchor.href = objectUrl
          anchor.download = this.currentFile.name
          anchor.click()

          window.URL.revokeObjectURL(objectUrl)
        })
    }
  }
}
</script>
