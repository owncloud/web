<template lang="html">
  <v-content>
    <v-layout column>
      <v-container align-content-center row>
        <v-layout row>
          <v-textarea
          name="input" box
          full-width :value="currentContent"
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

export default {
  name: 'MarkdownEditor',
  mounted () {
    this.openFile({
      client: this.$client,
      filePath: this.activeFile.path
    }).then((f) => { this.updateText(f) })
  },
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['isTouched', 'currentContent']),
    renderedMarkdown () {
      return this.currentContent ? marked(this.currentContent) : null
    },
  },
  methods: {
    ...mapActions(['openFile']),
    ...mapActions('MarkdownEditor', ['touched', 'updateText']),
    onType (e) {
      if (!this.isTouched) this.touched(true)
      this.updateText(e)
    }
  }
}
</script>
