<template>
  <main id="markdown-editor" class="oc-mx-s oc-my-s">
    <markdown-editor-app-bar
      :current-file-context="currentFileContext"
      :is-loading="isLoading"
      :is-dirty="isDirty"
      @closeApp="closeApp"
      @save="save"
    />
    <oc-notifications>
      <oc-notification-message
        v-if="lastError"
        :message="lastError"
        status="danger"
        @close="clearLastError"
      />
    </oc-notifications>
    <div class="oc-flex">
      <div class="oc-container oc-width-1-2">
        <oc-textarea
          id="markdown-editor-input"
          v-model="currentContent"
          name="input"
          full-width
          :label="$gettext('Editor')"
          class="oc-height-1-1"
          :rows="20"
        />
      </div>
      <div class="oc-container oc-width-1-2">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div id="markdown-editor-preview" v-html="renderedMarkdown" />
      </div>
    </div>
  </main>
</template>
<script>
import MarkdownEditorAppBar from './MarkdownEditorAppBar.vue'
import { useAppDefaults } from 'web-pkg/src/composables'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { useTask } from 'vue-concurrency'
import { computed, getCurrentInstance, onMounted, ref, unref } from '@vue/composition-api'

export default {
  name: 'MarkdownEditor',
  components: {
    MarkdownEditorAppBar
  },
  setup() {
    const serverContent = ref()
    const currentContent = ref()
    const currentETag = ref()

    const loadFileTask = useTask(function* (signal, that) {
      const filePath = unref(that.currentFileContext).path
      return yield that.getFileContents(filePath).then((response) => {
        serverContent.value = currentContent.value = response.body
        currentETag.value = response.headers.ETag
        return response
      })
    }).restartable()

    const saveFileTask = useTask(function* (signal, that) {
      const filePath = unref(that.currentFileContext).path
      const newContent = unref(currentContent)

      return yield that
        .putFileContents(filePath, newContent, {
          previousEntityTag: unref(currentETag)
        })
        .then(
          (response) => {
            serverContent.value = newContent
            // FIXME: above we need response.headers.ETag, here we need response ETag - feels inconsistent
            currentETag.value = response.ETag
          },
          (error) => {
            lastError.value = error.message
          }
        )
    }).restartable()

    const lastError = ref()
    const clearLastError = () => {
      lastError.value = null
    }

    const renderedMarkdown = computed(() => {
      return unref(currentContent) ? sanitizeHtml(marked(unref(currentContent))) : null
    })

    const isDirty = computed(() => {
      return unref(serverContent) !== unref(currentContent)
    })

    const isLoading = computed(() => {
      return loadFileTask.isRunning || saveFileTask.isRunning
    })

    onMounted(() => {
      loadFileTask.perform(getCurrentInstance().proxy)
    })

    const save = function () {
      saveFileTask.perform(this)
    }

    return {
      ...useAppDefaults({
        applicationName: 'markdown-editor'
      }),

      // tasks
      loadFileTask,
      saveFileTask,

      // data
      isLoading,
      isDirty,
      currentContent,
      lastError,
      renderedMarkdown,

      // methods
      clearLastError,
      save
    }
  }
}
</script>
<style lang="scss" scoped>
#markdown-editor-preview {
  max-height: 80vh;
  overflow-y: scroll;
}
</style>
