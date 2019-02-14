<template>
  <div>
      <oc-list v-if="selectedFiles.length === 1" :data="versions">
        <template slot="items" slot-scope="props">
          <v-list-tile avatar ripple>
            <v-list-tile-content>
              <v-list-tile-title>{{ props.item.fileInfo['{DAV:}getlastmodified'] | formDateFromNow }}</v-list-tile-title>
              <v-list-tile-sub-title class="text--primary">{{ props.item.name }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-list-tile-action-text><v-btn @click="revertVersion(props.item)" icon><v-icon color="primary">swap_vertical_circle</v-icon></v-btn></v-list-tile-action-text>
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
      return this.selectedFiles[0].id
    }
  },
  methods: {
    getFileVersions () {
      this.$client.fileVersions.listVersions(this.currentFile).then((res) => {
        this.versions = res
      })
    },
    revertVersion (file, restorePath = '/') {
      this.$client.fileVersions.restoreFileVersion(this.currentFile, file.fileInfo['{DAV:}getetag'], restorePath).then((res) => {
        console.log(res)
      })
    },
    downloadVersion (file) {
      console.log(file)
      this.$client.fileVersions.getFileVersionContents(this.currentFile, file.fileInfo['{DAV:}getetag']).then((res) => {
        console.log(res)
      })
    }
  }
}
</script>
