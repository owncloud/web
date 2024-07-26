<template>
  <div class="oc-json-viewer oc-width-1-1 oc-height-1-1">
    <div
      ref="editorRef"
      class="oc-width-1-1 oc-height-1-1"
      :class="{ 'jse-theme-dark': darkTheme }"
    ></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, unref } from 'vue'
import { Resource } from '@ownclouders/web-client'
import { AppConfigObject, useMessages, useThemeStore } from '@ownclouders/web-pkg'
import { Content, JSONEditor, Mode } from 'vanilla-jsoneditor'
import { useGettext } from 'vue3-gettext'
import 'vanilla-jsoneditor/themes/jse-theme-dark.css'

export default defineComponent({
  props: {
    applicationConfig: { type: Object as PropType<AppConfigObject>, required: true },
    currentContent: {
      type: String,
      required: true
    },
    isReadOnly: { type: Boolean, required: false },
    resource: { type: Object as PropType<Resource>, required: true }
  },
  setup: (props) => {
    const editorRef = ref<HTMLElement>()
    const { $gettext } = useGettext()
    const { showErrorMessage } = useMessages()
    const themeStore = useThemeStore()
    const darkTheme = computed(() => {
      return themeStore.currentTheme.isDark
    })

    let content: Content = null
    try {
      content = {
        json: JSON.parse(props.currentContent),
        text: props.currentContent
      }
    } catch (e) {
      content = {
        json: undefined,
        text: props.currentContent
      }
      showErrorMessage({ title: $gettext('JSON not properly formatted') })
    }

    onMounted(async () => {
      const editor = new JSONEditor({
        target: unref(editorRef),
        props: {
          content,
          mode: Mode.tree,
          askToFormat: false,
          readOnly: true,
          navigationBar: false
        }
      })

      // expand all paths up to 2 levels
      await editor.expand((path) => path.length < 2)
    })

    return {
      editorRef,
      darkTheme
    }
  }
})
</script>
<style lang="scss">
.jse {
  &-menu {
    background-color: var(--oc-color-swatch-primary-gradient) !important;
  }

  &-error {
    display: none !important; // Hide, as we show our own error via showErrorMessage to keep it simple
  }

  &-menu {
    button:nth-of-type(1) {
      border-bottom-left-radius: 8px !important;
      border-top-left-radius: 8px !important;
    }
    button:nth-of-type(3) {
      border-bottom-right-radius: 8px !important;
      border-top-right-radius: 8px !important;
    }
  }
}
</style>
