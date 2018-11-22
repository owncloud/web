<template>
  <v-bottom-sheet :value="sheet"
  @update:returnValue="closeTab">
    <v-list>
      <v-subheader>Open {{ file.name }} in</v-subheader>

      <v-list-tile
        v-for="tile in tiles"
        :key="tile.id"
        @click=""
      >
        <v-list-tile-avatar>
          <v-avatar size="32px" tile>
            <img
              :src="`https://cdn.vuetifyjs.com/images/bottom-sheets/${tile.img}`"
              :alt="tile.title"
            >
          </v-avatar>
        </v-list-tile-avatar>
        <v-list-tile-title @click="">{{ tile.title }}</v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-bottom-sheet>
</template>
<script>
export default {
  name: 'fileactionsTab',
  props: ['sheet', 'file'],
  data: () => ({
      tiles: [
        { img: 'keep.png', title: 'DoWhatEverYouWant' , id: 0},
        { img: 'inbox.png', title: 'Download', id: 1},
        { img: 'messenger.png', title: 'Share', id: 2},
        { img: 'google.png', title: 'Delete', id: 3}
      ]
    }),
    methods: {
      closeTab () {
        console.log('closeTab')
        this.$emit('close')
      }
    }
}
</script>
