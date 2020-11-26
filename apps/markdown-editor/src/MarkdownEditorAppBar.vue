<template>
  <div id="markdown-editor-app-bar" class="oc-app-bar">
    <oc-grid flex gutter="small">
      <div class="uk-width-auto">
        <oc-button :disabled="!isTouched" @click="saveContent">
          <oc-icon name="save" aria-hidden="true" />
        </oc-button>
        <oc-spinner v-if="isLoading" :aria-label="$gettext('Loading editor content')" />
      </div>
      <div class="uk-width-expand uk-text-center">
        <span>{{ activeFilePath }}</span>
      </div>
      <div class="uk-width-auto uk-text-right">
        <oc-button @click="closeApp">
          <oc-icon name="close" aria-hidden="true" />
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['isTouched', 'isLoading']),
    activeFilePath() {
      return this.activeFile.path.replace(/^(\/|\\)+/, '')
    }
  },
  methods: {
    ...mapActions('MarkdownEditor', ['saveFile']),
    saveContent() {
      this.saveFile({
        client: this.$client
      })
    },
    closeApp() {
      this.$router.push({
        path: '/files'
      })
    }
  }
}
</script>
