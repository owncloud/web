<template>
  <div id="markdown-editor">
    <markdown-editor-app-bar />
    <oc-notifications>
      <oc-notification-message
        v-if="lastError"
        :message="lastError"
        status="danger"
        @close="clearLastError"
      />
    </oc-notifications>
    <div class="uk-flex">
      <div class="uk-container uk-width-1-2">
        <oc-textarea
          name="input"
          full-width
          :value="currentContent"
          class="uk-height-1-1"
          :rows="20"
          @input="onType"
        >
        </oc-textarea>
      </div>
      <div class="uk-container uk-width-1-2">
        <div v-html="renderedMarkdown"></div>
      </div>
    </div>
  </div>
</template>
<script>
import MarkdownEditorAppBar from './MarkdownEditorAppBar.vue'
import marked from 'marked'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'MarkdownEditor',
  components: {
    MarkdownEditorAppBar
  },
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['currentContent', 'lastError']),
    renderedMarkdown() {
      return this.currentContent ? marked(this.currentContent, { sanitize: true }) : null
    }
  },
  mounted() {
    if (this.activeFile.path === '') {
      this.$router.push({
        path: '/files'
      })
      return
    }
    this.loadFile({
      filePath: this.activeFile.path,
      client: this.$client
    })
  },
  methods: {
    ...mapActions('MarkdownEditor', ['updateText', 'loadFile', 'clearLastError']),
    onType(e) {
      this.updateText(e)
    }
  }
}
</script>
