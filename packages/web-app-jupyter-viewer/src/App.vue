<template>
  <div class="oc-jupyter-viewer oc-width-1-1 oc-height-1-1">
    <div class="notebook-container" v-html="content"></div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted } from 'vue'
import Prism from 'prismjs'
import nb from 'notebookjs'
import 'prismjs/themes/prism.css'

export default defineComponent({
  name: 'JuypterViewer',
  props: {
    currentContent: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const highlighter = (code, lang) => {
      if (typeof lang === 'undefined') lang = 'markup'

      console.log(code, lang, Prism.languages[lang])
      return Prism.languages[lang] ? Prism.highlight(code, Prism.languages[lang]) : code
    }

    nb.highlighter = function (text, pre, code, lang) {
      var language = lang || 'text'
      pre.className = 'language-' + language
      if (typeof code != 'undefined') {
        code.className = 'language-' + language
      }
      return highlighter(text, language)
    }

    const content = computed(() => nb.parse(JSON.parse(props.currentContent)).render().outerHTML)

    onMounted(() => {
      Prism.highlightAll()
    })

    return {
      content
    }
  }
})
</script>

<style lang="scss" scoped>
.oc-jupyter-viewer {
  overflow-y: scroll;

  .notebook-container {
    padding: 3rem 2rem;
  }
}
</style>
