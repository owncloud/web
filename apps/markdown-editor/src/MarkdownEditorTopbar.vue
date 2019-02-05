<template lang="html">
  <div class="grid-container">
    <div class="save">
      <v-btn flat @click="saveContent(currentContent)" :disabled="!isTouched">
        <v-icon large>save</v-icon>
      </v-btn>
    </div>
    <div class="title">
      <p>{{ activeFile.path.substr(1) }}</p>
    </div>
    <div class="quit">
      <v-btn flat @click="closeApp">
        <v-icon large>home</v-icon>
      </v-btn>
    </div>
  </div>
</template>
<script>
import marked from 'marked'
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['isTouched', 'currentContent'])
  },
  methods: {
    ...mapActions('MarkdownEditor', ['touched']),
    saveContent (content) {
      this.$client.files.putFileContents(this.activeFile.path, content).then(() => { this.touched(false) })
    },
    closeApp () {
      this.$router.push({
        path: '/files/list/home'
      })
    }
  }
}
</script>
<style scoped>
  .grid-container {
    width: 100%;
    background: #e3e3e3;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr;
    grid-template-areas: "save title quit";
  }

  .save {
    margin:auto;
    grid-area: save;
  }

  .title {
    text-align: center;
    margin-top: .5em;
    grid-area: title;
  }

  .quit {
    margin:auto;
    grid-area: quit;
  }
</style>
