<template>
  <div
    :class="showPreview ? '' : 'oc-text-editor--no-preview'"
    class="oc-text-editor oc-width-1-1 oc-height-1-1"
  >
    <oc-textarea
      id="text-editor-input"
      :model-value="currentContent"
      name="input"
      label=""
      class="oc-height-1-1"
      :rows="20"
      :disabled="isReadOnly"
      @update:model-value="$emit('update:currentContent', $event)"
    />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="showPreview" id="text-editor-preview" v-html="renderedMarkdown" />
  </div>
</template>

<script lang="ts">
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { computed, defineComponent, unref, PropType } from 'vue'
import { Resource } from 'web-client/src/helpers/resource/types'
import { AppConfigObject } from '@ownclouders/web-pkg'

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
.oc-text-editor {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr 1fr;

  @media (min-width: $oc-breakpoint-medium-default) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr;
  }

  &--no-preview {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  #text-editor-preview {
    max-height: 100%;
    overflow-y: auto;
    padding: var(--oc-space-xsmall) var(--oc-space-small);
    word-break: break-word;
  }

  #text-editor-input {
    resize: vertical;
  }
}
</style>
