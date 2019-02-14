<template>
  <div>
      <oc-list v-if="selectedFiles.length === 1" :data="versions">
        <template slot="items" slot-scope="props">
            <v-list-tile avatar ripple>
              <v-list-tile-content>
                <v-list-tile-title>{{ props.item.fileInfo['{DAV:}getlastmodified'] | formDateFromNow }}</v-list-tile-title>
                <v-list-tile-sub-title class="text--primary">
                  {{ props.item.fileInfo['{DAV:}getcontentlength'] | fileSize }}
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-list-tile-action-text><v-btn @click="revertVersion(props.item, restorePath(props.item))" icon><v-icon color="primary">swap_vertical_circle</v-icon></v-btn></v-list-tile-action-text>
                <v-btn @click="downloadVersion(props.item)" icon><v-icon color="primary">cloud_download</v-icon></v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </template>
      </oc-list>
      <div v-else>
        <span class="text--center" v-translate>Please choose only a single File</span>
      </div>
      <v-list-tile v-show="!hasVersion">
        <v-list-tile-content>
          <v-list-tile-title v-translate>No Versions available for this file</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
  </div>
</template>
<script>
import OcList from 'oc_components/OcList.vue'
import Mixins from '../mixins.js'
import { mapGetters } from 'vuex'

export default {
  components: {
    OcList
  },
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
      console.log(this.versions.length > 0)
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
        this.versions = res
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
