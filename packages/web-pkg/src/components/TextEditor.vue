<template>
  <div id="text-editor-container" ref="toastUiEditorRef" :data-markdown-mode="isMarkdown" />
</template>

<script lang="ts">
import { computed, defineComponent, unref, PropType, ref, onMounted } from 'vue'
import { Resource } from '@ownclouders/web-client/src/helpers/resource/types'

import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'
import '@toast-ui/editor/dist/i18n/cs-cz'
import '@toast-ui/editor/dist/i18n/de-de'
import '@toast-ui/editor/dist/i18n/es-es'
import '@toast-ui/editor/dist/i18n/fr-fr'
import '@toast-ui/editor/dist/i18n/it-it'
import '@toast-ui/editor/dist/i18n/nl-nl'
import '@toast-ui/editor/dist/i18n/ko-kr'
import '@toast-ui/editor/dist/i18n/sv-se'
import '@toast-ui/editor/dist/i18n/tr-tr'
import '@toast-ui/editor/dist/i18n/zh-cn'
import { Editor, EditorCore, EditorOptions } from '@toast-ui/editor'

import 'prismjs/themes/prism.css'
import '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css'
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js'

import { useGettext } from 'vue3-gettext'
import { useThemeStore } from '../composables'
import { AppConfigObject } from '../apps'

export default defineComponent({
  name: 'TextEditor',
  props: {
    applicationConfig: { type: Object as PropType<AppConfigObject>, required: true },
    currentContent: {
      type: String,
      required: true
    },
    isReadOnly: { type: Boolean, required: false, default: false },
    resource: { type: Object as PropType<Resource>, required: true }
  },
  emits: ['update:currentContent'],
  setup(props, { emit }) {
    const { current: currentLanguage } = useGettext()
    const themeStore = useThemeStore()
    const toastUiEditorRef = ref()
    // Should not be a ref, otherwise functions like setMarkdown won't work
    let toastUiEditor: EditorCore = null
    const config = computed(() => {
      // TODO: Remove typecasting once vue-tsc has figured it out
      const { showPreviewOnlyMd = true } = props.applicationConfig as AppConfigObject
      return { showPreviewOnlyMd }
    })

    const isMarkdown = computed(() => {
      return (
        ['md', 'markdown'].includes(props.resource?.extension) || !unref(config).showPreviewOnlyMd
      )
    })

    onMounted(() => {
      let config: EditorOptions = {
        el: unref(toastUiEditorRef),
        usageStatistics: false, // sends hostname to google analytics DISABLE
        initialValue: props.currentContent,
        useCommandShortcut: false,
        hideModeSwitch: true,
        language: currentLanguage,
        height: '100%',
        plugins: [codeSyntaxHighlight],
        viewer: props.isReadOnly,
        events: {
          change: () => {
            emit('update:currentContent', toastUiEditor.getMarkdown())
          }
        },
        ...(themeStore.currentTheme.isDark && { theme: 'dark' })
      }

      if (!unref(isMarkdown)) {
        config = {
          ...config,
          toolbarItems: [],
          initialEditType: 'wysiwyg'
        }
      }

      toastUiEditor = Editor.factory(config) as EditorCore
    })

    return {
      toastUiEditorRef,
      isMarkdown
    }
  }
})
</script>
<style lang="scss">
.toastui-editor-tabs {
  // Fix tab with for long i18n text
  .tab-item {
    width: auto;
    padding-left: var(--oc-space-small);
    padding-right: var(--oc-space-small);
  }
}
</style>
