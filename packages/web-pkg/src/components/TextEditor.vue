<template>
  <app-loading-spinner v-if="loading" />
  <div v-else id="text-editor-container" ref="toastUiEditorRef" :data-markdown-mode="isMarkdown" />
</template>

<script lang="ts">
import { computed, defineComponent, unref, PropType, ref, onMounted, nextTick } from 'vue'
import { Resource } from '@ownclouders/web-client'

import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

// @ts-ignore
import { Editor, EditorCore, EditorOptions } from '@toast-ui/editor'
import { useGettext } from 'vue3-gettext'
import { useThemeStore } from '../composables'
import { AppConfigObject } from '../apps'
import AppLoadingSpinner from './AppLoadingSpinner.vue'

export default defineComponent({
  name: 'TextEditor',
  components: { AppLoadingSpinner },
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
    const language = useGettext()
    const themeStore = useThemeStore()
    const toastUiEditorRef = ref<HTMLElement>()
    const loading = ref(true)

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

    const loadTranslations = () => {
      return Promise.all([
        import('@toast-ui/editor/dist/i18n/ar'),
        import('@toast-ui/editor/dist/i18n/cs-cz'),
        import('@toast-ui/editor/dist/i18n/de-de'),
        import('@toast-ui/editor/dist/i18n/en-us'),
        import('@toast-ui/editor/dist/i18n/es-es'),
        import('@toast-ui/editor/dist/i18n/fi-fi'),
        import('@toast-ui/editor/dist/i18n/fr-fr'),
        import('@toast-ui/editor/dist/i18n/gl-es'),
        import('@toast-ui/editor/dist/i18n/hr-hr'),
        import('@toast-ui/editor/dist/i18n/it-it'),
        import('@toast-ui/editor/dist/i18n/ja-jp'),
        import('@toast-ui/editor/dist/i18n/ko-kr'),
        import('@toast-ui/editor/dist/i18n/nb-no'),
        import('@toast-ui/editor/dist/i18n/nl-nl'),
        import('@toast-ui/editor/dist/i18n/pl-pl'),
        import('@toast-ui/editor/dist/i18n/ru-ru'),
        import('@toast-ui/editor/dist/i18n/sv-se'),
        import('@toast-ui/editor/dist/i18n/tr-tr'),
        import('@toast-ui/editor/dist/i18n/uk-ua'),
        import('@toast-ui/editor/dist/i18n/zh-cn'),
        import('@toast-ui/editor/dist/i18n/zh-tw')
      ])
    }

    const loadSyntaxHighlighting = async () => {
      const [plugin] = await Promise.all([
        import(
          `@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight-all.js`
        ),
        import(
          // @ts-ignore
          `@toast-ui/editor-plugin-code-syntax-highlight/dist/toastui-editor-plugin-code-syntax-highlight.css`
        ),
        // @ts-ignore
        import('prismjs/themes/prism.css')
      ])

      return plugin.default
    }

    onMounted(async () => {
      let codeSyntaxHighlight: unknown
      if (unref(isMarkdown)) {
        codeSyntaxHighlight = await loadSyntaxHighlighting()

        if (!props.isReadOnly) {
          await loadTranslations()
        }
      }

      loading.value = false
      await nextTick()

      let config: EditorOptions = {
        el: unref(toastUiEditorRef),
        usageStatistics: false, // sends hostname to google analytics DISABLE
        initialValue: props.currentContent,
        useCommandShortcut: false,
        hideModeSwitch: true,
        language: language.current,
        height: '100%',
        plugins: [...((codeSyntaxHighlight && [codeSyntaxHighlight]) || [])],
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
      isMarkdown,
      loading
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
