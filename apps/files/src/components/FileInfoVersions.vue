<template>
  <div>
      <oc-list v-if="selectedFiles.length === 1" :data="computedVersions">
        <template slot="items" slot-scope="props">
          <v-list-tile avatar ripple>
            <v-list-tile-content>
              <v-list-tile-title>{{ props.item.timestamp | formDateFromNow }}</v-list-tile-title>
              <v-list-tile-sub-title class="text--primary">{{ props.item.name }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-list-tile-action-text><v-btn @click="revertVersion(item)" icon><v-icon color="primary">swap_vertical_circle</v-icon></v-btn></v-list-tile-action-text>
              <v-btn @click="downloadVersion(item)" icon><v-icon color="primary">cloud_download</v-icon></v-btn>
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
import { map } from 'lodash'

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
    computedVersions () {
      return map(this.versions, (f) => {
        return {
          timestamp: f.fileInfo['{DAV:}getlastmodified'],
          name: f.name,
          type: f.type
        }
      })
    },
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
    revertVersion (file) {
      this.$client.fileVersions.revertVersion(file.id).then((res) => {
        console.log(res)
      })
    },
    downloadVersion (file) {
      this.$client.fileVersions.getFileContents(file.id).then((res) => {
        console.log(res)
      })
    }
  }
}
</script>
