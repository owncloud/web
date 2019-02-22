<template>
  <v-bottom-sheet :value="sheet"
  @update:returnValue="closeTab">
    <v-list>
      <v-subheader>Open {{ file.name }} in </v-subheader>
      <div v-if="extensions">
        <v-list-tile
          v-for="tile in extensions"
          :key="tile.app"
          @click="openFileAction(tile.app)">
          <v-list-tile-avatar>
            <v-avatar size="32px" tile>
              <v-icon>
                {{tile.icon}}
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title >{{ tile.name }}</v-list-tile-title>
        </v-list-tile>
      </div>
      <div v-else>
        <v-list-tile
          @click="$eventBus.$emit('download-file', file)">
          <v-list-tile-avatar>
            <v-avatar size="32px" tile>
              <v-icon>
                cloud_download
              </v-icon>
            </v-avatar>
          </v-list-tile-avatar>
          <v-list-tile-title >Download File</v-list-tile-title>
        </v-list-tile>
      </div>
    </v-list>
  </v-bottom-sheet>
</template>
<script>
import { mapGetters } from 'vuex'
import Mixins from '../mixins'

export default {
  name: 'fileactionsTab',
  props: ['sheet', 'file'],
  mixins: [Mixins],
  methods: {
    openFileAction (appId) {
      this.$emit('open', appId)
      // TODO path to state
      this.$router.push({
        name: appId
      })
    },
    downloadFiles (file) {
      this.downloadFile(file)
    },
    closeTab () {
      this.$emit('close')
    }
  },
  computed: mapGetters(['extensions', 'getToken'])
}
</script>
