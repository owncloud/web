<template>
  <div class="html-editor oc-width-1-1 oc-height-1-1">
    <html-toolbar :view-mode="viewMode" @change-mode="viewMode = $event" />
    <div class="html-editor-body" :class="bodyClass">
      <div class="html-editor-body-editor">
        <html-editor-pane
          :model-value="currentContent"
          :is-read-only="isReadOnly"
          @update:model-value="onInput"
        />
      </div>
      <div class="html-editor-body-preview">
        <html-preview-pane :content="previewContent" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { AppConfigObject } from '@ownclouders/web-pkg'
import HtmlEditorPane from './components/HtmlEditorPane.vue'
import HtmlPreviewPane from './components/HtmlPreviewPane.vue'
import HtmlToolbar, { HtmlEditorViewMode } from './components/HtmlToolbar.vue'

interface Props {
  applicationConfig: AppConfigObject
  currentContent: string
  isReadOnly?: boolean
  resource: Resource
}
interface Emits {
  (e: 'update:currentContent', value: string): void
}
// `currentContent` and `update:currentContent` are the contract that turns on the
// AppWrapper's WebDAV load/save, dirty tracking, Ctrl+S and unsaved-changes guard
// (see DECISIONS.md D5/D6/D7). `applicationConfig` and `resource` are declared so
// the wrapper binds them as props rather than as fallthrough attributes.
const { currentContent, isReadOnly = false } = defineProps<Props>()
const emit = defineEmits<Emits>()

const viewMode = ref<HtmlEditorViewMode>('split')

const bodyClass = computed(() => ({
  'html-editor-body-split': viewMode.value === 'split',
  'html-editor-body-editor-only': viewMode.value === 'editor',
  'html-editor-body-preview-only': viewMode.value === 'preview'
}))

// The preview is debounced so typing in a large document does not reload the
// iframe on every keystroke. Both panes stay mounted across view-mode switches
// (CSS grid collapses the hidden column) so the editor keeps its cursor/undo.
const previewContent = ref(currentContent ?? '')
let previewTimer: ReturnType<typeof setTimeout> | undefined
const schedulePreview = (value: string) => {
  if (previewTimer) {
    clearTimeout(previewTimer)
  }
  previewTimer = setTimeout(() => {
    previewContent.value = value
  }, 250)
}

const onInput = (value: string) => {
  emit('update:currentContent', value)
}

// Drives the preview for both user edits (which round-trip back through the prop)
// and external content changes such as the initial WebDAV load.
watch(
  () => currentContent,
  (value) => {
    schedulePreview(value ?? '')
  }
)

onBeforeUnmount(() => {
  if (previewTimer) {
    clearTimeout(previewTimer)
  }
})
</script>

<style lang="scss" scoped>
.html-editor {
  display: flex;
  flex-direction: column;
}

.html-editor-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.html-editor-body-editor,
.html-editor-body-preview {
  min-width: 0;
  height: 100%;
  overflow: hidden;
}

.html-editor-body-preview {
  border-left: 1px solid var(--oc-color-border);
}

.html-editor-body-split {
  grid-template-columns: 1fr 1fr;
}

.html-editor-body-editor-only {
  grid-template-columns: 1fr 0;

  .html-editor-body-preview {
    border-left: none;
  }
}

.html-editor-body-preview-only {
  grid-template-columns: 0 1fr;

  .html-editor-body-preview {
    border-left: none;
  }
}
</style>
