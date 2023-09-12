<template>
  <div class="oc-width-1-1 oc-height-1-1">
    <div v-if="resource" class="oc-height-1-1">
      <oc-textarea
        id="text-editor-input"
        :model-value="currentContent"
        name="input"
        full-width
        label=""
        class="oc-height-1-1"
        :rows="20"
        :disabled="isReadOnly"
        @update:model-value="$emit('update:currentContent', $event)"
      />
    </div>
    <div v-if="showPreview" class="">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div id="text-editor-preview" v-html="renderedMarkdown" />
    </div>
  </div>
</template>

<script lang="ts">
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { computed, defineComponent, unref, PropType } from 'vue'
import { Resource } from 'web-client/src/helpers/resource/types'
import { AppConfigObject } from 'web-pkg/src/apps/types'

export default defineComponent({
  name: 'TextEditor',
  props: {
    applicationConfig: { type: Object as PropType<AppConfigObject>, required: true },
    currentContent: {
      type: String,
      required: true
    },
    isReadOnly: { type: Boolean, required: false },
    resource: { type: Object as PropType<Resource>, required: true }
  },
  emits: ['update:currentContent'],
  setup(props) {
    const config = computed(() => {
      // TODO: Remove typecasting once vue-tsc has figured it out
      const { showPreviewOnlyMd = true } = props.applicationConfig as AppConfigObject
      return { showPreviewOnlyMd }
    })

    const showPreview = computed(() => {
      // FIXME: why is resource ever undefined/null?
      return props.resource?.extension === 'md' || !unref(config).showPreviewOnlyMd
    })

    const renderedMarkdown = computed(() => {
      return props.currentContent && unref(showPreview)
        ? sanitizeHtml(marked(props.currentContent))
        : null
    })

    return {
      showPreview,
      renderedMarkdown
    }
  }
})
</script>

<style lang="scss">
#text-editor-preview {
  max-height: 100%;
  overflow-y: auto;
}
#text-editor-input {
  resize: vertical;
}
</style>
