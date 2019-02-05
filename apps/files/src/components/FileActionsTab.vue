<template>
  <v-bottom-sheet :value="sheet"
  @update:returnValue="closeTab">
    <v-list>
      <v-subheader>Open {{ file.name }} in </v-subheader>
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
    </v-list>
  </v-bottom-sheet>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'fileactionsTab',
  props: ['sheet', 'file'],
  methods: {
    openFileAction (appId) {
      this.$emit('open', appId)
      // TODO path to state
      this.$router.push({
        name: appId
      })
    },
    closeTab () {
      this.$emit('close')
    }
  },
  computed: mapGetters(['extensions'])
}
</script>
