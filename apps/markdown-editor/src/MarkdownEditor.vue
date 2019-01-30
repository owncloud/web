<template>
  <v-content>
    <v-layout column>
      <v-layout row align-self-center>
        <h1 class="mt-2">
          {{ activeFile.path }}
        </h1>
        <v-btn flat @click="saveContent(text)" :disabled="!isTouched">
          <v-icon large>save</v-icon>
        </v-btn>
        <v-btn flat @click="closeApp">
          <v-icon large>home</v-icon>
        </v-btn>
      </v-layout>
      <v-container align-content-center row>
        <v-layout row>
          <v-textarea
          name="input" box
          full-width :value="text"
          @input="onType" height="30vh">
          </v-textarea>
          <v-flex xs6>
            <div v-html="renderedMarkdown"></div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-layout>
  </v-content>
</template>
<script>
import marked from 'marked'
import { mapActions, mapGetters } from 'vuex'
// import { debounce } from 'lodash'

export default {
  name: 'MarkdownEditor',
  mounted () {
    this.openFile({
      client: this.$client,
      filePath: this.activeFile.path
    }).then((f) => (this.text = f))
    // this.$store.dispatch('openFile', {
    //   client: this.$client,
    //   filePath: this.activeFile.path
    // }).then((f) => (this.text = f))
  },
  data: () => ({
    text: '# is Loading...',
    isTouched: false
  }),
  computed: {
    ...mapGetters(['activeFile']),
    renderedMarkdown () {
      return marked(this.text)
    }
  },
  methods: {
    ...mapActions(['openFile']),
    saveContent (content) {
      this.$client.files.putFileContents(this.activeFile.path, content).then(() => { this.isTouched = false })
    },
    onType (e) {
      this.isTouched = true
      this.text = e
      // debounce(this.saveContent, 100)
    },
    closeApp () {
      this.$router.push({
        path: '/files/list/home'
      })
    }
  }
}
</script>
