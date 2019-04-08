<template lang="html">
  <div class="uk-flex">
    <div class="uk-container uk-width-1-2">
      <oc-textarea
      name="input"
      full-width :value="currentContent"
      @input="onType" class="uk-height-1-1" :rows="20">
      </oc-textarea>
    </div>
    <div class="uk-container uk-width-1-2">
      <div v-html="renderedMarkdown"></div>
    </div>
  </div>
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
    }
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
