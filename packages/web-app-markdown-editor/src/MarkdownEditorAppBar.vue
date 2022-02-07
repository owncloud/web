<template>
  <div id="markdown-editor-app-bar" class="oc-app-bar">
    <oc-grid flex gutter="small">
      <div class="oc-width-auto">
        <oc-button id="markdown-editor-controls-save" :disabled="!isDirty" @click="$emit('save')">
          <oc-icon name="save" />
        </oc-button>
        <oc-spinner v-if="isLoading" :aria-label="$gettext('Loading editor content')" />
      </div>
      <div class="oc-width-expand oc-text-center">
        <span id="markdown-editor-file-path">{{ activeFilePath }}</span>
      </div>
      <div class="oc-width-auto oc-text-right">
        <oc-button id="markdown-editor-controls-close" @click="$emit('closeApp')">
          <oc-icon name="close" />
        </oc-button>
      </div>
    </oc-grid>
  </div>
</template>
<script>
export default {
  props: {
    currentFileContext: {
      type: Object,
      required: true
    },
    isDirty: {
      type: Boolean,
      required: true
    },
    isLoading: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    activeFilePath() {
      let path = this.currentFileContext.path

      if (path.startsWith('/files/') || path.startsWith('/spaces/')) {
        path = path.split('/').splice(3).join('/')
      }

      return path.replace(/^(\/|\\)+/, '')
    }
  }
}
</script>
