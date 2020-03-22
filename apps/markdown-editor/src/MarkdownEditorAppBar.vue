<template>
  <div id="markdown-editor-app-bar" class="oc-app-bar">
    <oc-grid flex gutter="small">
      <div class="uk-width-auto">
        <oc-button icon="save" :disabled="!isTouched" @click="saveContent"></oc-button>
        <oc-spinner v-if="isLoading"></oc-spinner>
      </div>
      <div class="uk-width-expand uk-text-center">
        <span>{{ activeFile.path.substr(1) }}</span>
      </div>
      <div class="uk-width-auto uk-text-right">
        <oc-button icon="close" @click="closeApp"></oc-button>
      </div>
    </oc-grid>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters(['activeFile']),
    ...mapGetters('MarkdownEditor', ['isTouched', 'isLoading'])
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
