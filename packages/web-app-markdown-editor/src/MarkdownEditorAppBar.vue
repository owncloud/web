<template>
  <div id="markdown-editor-app-bar" class="oc-app-bar">
    <oc-grid flex gutter="small">
      <div class="oc-width-auto">
        <oc-button id="markdown-editor-controls-save" :disabled="!isTouched" @click="saveContent">
          <oc-icon name="save" />
        </oc-button>
        <oc-spinner v-if="isLoading" :aria-label="$gettext('Loading editor content')" />
      </div>
      <div class="oc-width-expand oc-text-center">
        <span id="markdown-editor-file-path">{{ activeFilePath }}</span>
      </div>
      <div class="oc-width-auto oc-text-right">
        <oc-button id="markdown-editor-controls-close" @click="closeApp">
          <oc-icon name="close" />
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import { basename, dirname } from 'path'

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

    // copied from packages/web-app-media-viewer/src/mixins/loader.js
    // FIXME: where can/should we put this shared code?
    $_loader_navigateToContextRoute(contextRouteName, filePath) {
      this.$router.push({
        name: contextRouteName,
        params: {
          item: dirname(filePath) || '/'
        },
        query: {
          scrollTo: basename(filePath)
        }
      })
    },

    closeApp() {
      this.$_loader_navigateToContextRoute(
        this.$route.params.contextRouteName,
        this.$route.params.filePath
      )
    }
  }
}
</script>
