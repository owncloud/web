<template>
  <div>
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
                full-width :value="currentContent"
                @input="onType" class="uk-height-1-1" :rows="20">
        </oc-textarea>
      </div>
      <div class="uk-container uk-width-1-2">
        <div v-html="renderedMarkdown"></div>
      </div>
    </div>
  </div>
</template>
<script>
import marked from 'marked'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'MarkdownEditor',
  mounted () {
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
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['currentContent', 'lastError']),
    renderedMarkdown () {
      return this.currentContent ? marked(this.currentContent) : null
    }
  },
  methods: {
    ...mapActions('MarkdownEditor', ['updateText', 'loadFile', 'clearLastError']),
    onType (e) {
      this.updateText(e)
    }
  }
}
</script>
