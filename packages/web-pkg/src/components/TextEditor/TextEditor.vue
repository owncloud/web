<template>
  <div id="text-editor-container" class="oc-height-1-1">
    <md-preview
      v-if="isReadOnly"
      id="space-description-preview"
      :model-value="currentContent"
      :language="languages[language.current] || 'en-US'"
      :theme="theme"
      read-only
      :toolbars="[]"
      :sanitize="sanitize"
    />
    <md-editor
      v-else
      id="text-editor-component"
      :model-value="currentContent"
      :language="languages[language.current] || 'en-US'"
      :theme="theme"
      :preview="isMarkdown"
      :toolbars="isMarkdown ? undefined : []"
      :read-only="isReadOnly"
      :sanitize="sanitize"
      @on-change="(value) => $emit('update:currentContent', value)"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import dompurify from 'dompurify'

import { config, MdEditor, MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

import { languageUserDefined, languages } from './l18n'

import { useGettext } from 'vue3-gettext'
import { useThemeStore } from '../../composables'
import { AppConfigObject } from '../../apps'

interface TextEditorProps {
  applicationConfig?: AppConfigObject
  currentContent: string
  markdownMode?: boolean
  isReadOnly?: boolean
  resource?: Resource
}
interface TextEditorEmits {
  (e: 'update:currentContent', value: string): void
}
const {
  markdownMode = false,
  isReadOnly = false,
  applicationConfig,
  currentContent,
  resource
} = defineProps<TextEditorProps>()

defineEmits<TextEditorEmits>()
const language = useGettext()
const { currentTheme } = useThemeStore()

// Should not be a ref, otherwise functions like setMarkdown won't work
const editorConfig = computed(() => {
  const { showPreviewOnlyMd = true }: AppConfigObject = applicationConfig
  return { showPreviewOnlyMd }
})

const isMarkdown = computed(() => {
  return (
    markdownMode ||
    ['md', 'markdown'].includes(resource?.extension) ||
    !unref(editorConfig).showPreviewOnlyMd
  )
})

const theme = computed(() => (unref(currentTheme).isDark ? 'dark' : 'light'))

const sanitize = (html) => dompurify.sanitize(html)

config({
  editorConfig: {
    languageUserDefined
  }
})
</script>
<style lang="scss">
#text-editor-component {
  height: 100%;
}

.toastui-editor-tabs {
  // Fix tab with for long i18n text
  .tab-item {
    width: auto;
    padding-left: var(--oc-space-small);
    padding-right: var(--oc-space-small);
  }
}

#space-description-preview {
  background-color: transparent;
  width: max-content;

  .md-editor-preview-wrapper {
    padding: 0;
  }

  .md-editor-preview {
    color: var(--oc-color-text-default);
    font-size: var(--oc-text-default);
  }
}
</style>
