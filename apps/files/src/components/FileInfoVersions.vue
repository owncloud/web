<template>
    <div>
        <oc-table middle divider v-if="selectedFiles.length === 1">
            <oc-table-group>
                <oc-table-row v-for="(item, index) in versions" :key="index" class="file-row">
                    <oc-table-cell>
                        <oc-table-cell class="uk-text-meta uk-text-nowrap">
                            {{ formDateFromNow(item.fileInfo['{DAV:}getlastmodified']) }}
                        </oc-table-cell>
                        <oc-table-cell class="uk-text-meta uk-text-nowrap">
                            {{  item.fileInfo['{DAV:}getcontentlength'] | fileSize }}
                        </oc-table-cell>
                    </oc-table-cell>
                    <oc-table-cell>
                        <div class="uk-button-group uk-margin-small-right">
                            <oc-button @click="revertVersion(item)" icon="restore"></oc-button>
                            <oc-button @click="downloadVersion(item)" icon="cloud_download"></oc-button>
                        </div>
                    </oc-table-cell>
                </oc-table-row>
            </oc-table-group>
        </oc-table>
        <div v-else>
            <span v-translate>Please choose only a single File</span>
        </div>
        <div v-show="!hasVersion && selectedFiles.length === 1">
          <span v-translate>No Versions available for this file</span>
        </div>
    </div></template>
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
    currentVersionId (file) {
      let etag = file.name.split('/')
      return etag[etag.length - 1]
    },
    getFileVersions () {
      this.$client.fileVersions.listVersions(this.currentFile.id).then((res) => {
        if (res) this.versions = res
      })
    },
    revertVersion (file) {
      this.$client.fileVersions.restoreFileVersion(this.currentFile.id, this.currentVersionId(file), this.currentFile.path).then(() => {
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
