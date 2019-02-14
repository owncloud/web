<template>
  <div>
      <oc-list v-if="selectedFiles.length === 1" :data="versions">
        <template slot="items" slot-scope="props">
          <v-list-tile avatar ripple>
            <v-list-tile-content>
              <v-list-tile-title>{{ props.item.fileInfo['{DAV:}getlastmodified'] | formDateFromNow }}</v-list-tile-title>
              <v-list-tile-sub-title class="text--primary">{{ props.item.fileInfo['{DAV:}getcontentlength'] | fileSize }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-list-tile-action-text><v-btn @click="revertVersion(props.item, restorePath(props.item))" icon><v-icon color="primary">swap_vertical_circle</v-icon></v-btn></v-list-tile-action-text>
              <v-btn @click="downloadVersion(props.item)" icon><v-icon color="primary">cloud_download</v-icon></v-btn>
            </v-list-tile-action>
          </v-list-tile>
        </template>
      </oc-list>
      <div v-else>
        <span class="text--center">Please choose only a single File</span>
      </div>
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
    currentFile () {
      return this.selectedFiles[0]
    }
  },
  methods: {
    restorePath (file) {
      let filename = this.currentFile.path.split('.', 1)[0]
      let split = this.currentFile.path.split('.')
      let extension = split[split.length -1]
      return `${filename}_v${this.currentVersionId(file)}.${extension}`
    },
    currentVersionId (file) {
      console.log(file.name.split('/').reverse()[0])
      return file.name.split('/').reverse()[0]
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
      console.log(file)
      fetch(url, { headers })
        .then(response => response.blob())
        .then(blobby => {
          let objectUrl = window.URL.createObjectURL(blobby)

          anchor.href = objectUrl
          anchor.download = file.name
          anchor.click()

          window.URL.revokeObjectURL(objectUrl)
        })
      this.$client.fileVersions.getFileVersionContents(this.currentFile, this.currentVersionId(file)).then((res) => {
        console.log(res)
      })
    }
  }
}
</script>
