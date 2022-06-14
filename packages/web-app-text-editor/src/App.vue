<template>
  <main id="text-editor" class="oc-px-l oc-py-m oc-height-1-1">
    <app-bar
      :current-file-context="currentFileContext"
      :is-loading="isLoading"
      :is-dirty="isDirty"
      :is-read-only="isReadOnly"
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
    <div class="oc-flex editor-wrapper-height">
      <div :class="showPreview ? 'oc-width-1-2' : 'oc-width-1-1'" class="oc-height-1-1">
        <oc-textarea
          id="text-editor-input"
          v-model="currentContent"
          name="input"
          full-width
          label=""
          class="oc-height-1-1"
          :rows="20"
          :disabled="isReadOnly"
        />
      </div>
      <div v-if="showPreview" class="oc-container oc-width-1-2">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div id="text-editor-preview" v-html="renderedMarkdown" />
      </div>
    </div>
  </main>
</template>
<script>
import AppBar from './AppBar.vue'
import { useAppDefaults } from 'web-pkg/src/composables'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { useTask } from 'vue-concurrency'
import { computed, onMounted, onBeforeUnmount, ref, unref } from '@vue/composition-api'
import { mapActions } from 'vuex'
import { DavPermission, DavProperty } from 'web-pkg/src/constants'

export default {
  name: 'TextEditor',
  components: {
    AppBar
  },
  beforeRouteLeave(_to, _from, next) {
    if (this.isDirty) {
      const modal = {
        variation: 'danger',
        icon: 'warning',
        title: this.$gettext('Unsaved changes'),
        message: this.$gettext('Your changes were not saved. Do you want to save them?'),
        cancelText: this.$gettext("Don't Save"),
        confirmText: this.$gettext('Save'),
        onCancel: () => {
          this.hideModal()
          next()
        },
        onConfirm: () => {
          this.save()
          this.hideModal()
          next()
        }
      }
      this.createModal(modal)
    } else {
      next()
    }
  },
  setup() {
    const defaults = useAppDefaults({
      applicationId: 'text-editor'
    })
    const { applicationConfig, currentFileContext } = defaults
    const serverContent = ref()
    const currentContent = ref()
    const currentETag = ref()
    const isReadOnly = ref(true)

    const loadFileTask = useTask(function* () {
      const filePath = unref(currentFileContext).path

      unref(defaults)
        .getFileInfo(filePath, [DavProperty.Permissions])
        .then((response) => {
          isReadOnly.value = ![DavPermission.Updateable, DavPermission.FileUpdateable].some(
            (p) => response.fileInfo[DavProperty.Permissions].indexOf(p) > -1
          )
        })

      return yield unref(defaults)
        .getFileContents(filePath)
        .then((response) => {
          serverContent.value = currentContent.value = response.body
          currentETag.value = response.headers['OC-ETag']
          return response
        })
    }).restartable()

    const saveFileTask = useTask(function* () {
      const filePath = unref(currentFileContext).path
      const newContent = unref(currentContent)

      return yield unref(defaults)
        .putFileContents(filePath, newContent, {
          previousEntityTag: unref(currentETag)
        })
        .then(
          (response) => {
            serverContent.value = newContent
            currentETag.value = response['OC-ETag']
          },
          (error) => {
            switch (error.statusCode) {
              case 412:
                lastError.value =
                  'This file was updated outside this window. Please refresh the page (all changes will be lost).'
                break
              case 500:
                lastError.value = 'Error when contacting the server'
                break
              case 401:
                lastError.value = "You're not authorized to save this file"
                break
              default:
                lastError.value = error.message || error
            }
          }
        )
    }).restartable()

    const lastError = ref()
    const clearLastError = () => {
      lastError.value = null
    }

    const renderedMarkdown = computed(() => {
      return unref(currentContent) && showPreview
        ? sanitizeHtml(marked(unref(currentContent)))
        : null
    })

    const isDirty = computed(() => {
      return unref(serverContent) !== unref(currentContent)
    })

    const isLoading = computed(() => {
      return loadFileTask.isRunning || saveFileTask.isRunning
    })

    const showPreview = computed(() => {
      return unref(fileExtension) === 'md' || !unref(config).showPreviewOnlyMd
    })

    const fileExtension = computed(() => {
      return unref(currentFileContext).path.split('.').pop()
    })

    const config = computed(() => {
      const { showPreviewOnlyMd = true } = unref(applicationConfig)
      return { showPreviewOnlyMd }
    })

    onMounted(() => {
      loadFileTask.perform()

      // Enable ctrl/cmd + s
      document.addEventListener('keydown', handleSKey, false)
      // Ensure reload is not possible if there are changes
      window.addEventListener('beforeunload', handleUnload)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleUnload)
      document.removeEventListener('keydown', handleSKey, false)
    })

    const save = function () {
      saveFileTask.perform()
    }

    const handleSKey = function (e) {
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyS') {
        e.preventDefault()
        save()
      }
    }

    const handleUnload = function (e) {
      if (unref(isDirty)) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    return {
      ...defaults,

      // tasks
      loadFileTask,
      saveFileTask,

      // data
      isLoading,
      showPreview,
      isDirty,
      isReadOnly,
      currentContent,
      lastError,
      renderedMarkdown,
      config,

      // methods
      clearLastError,
      save,
      handleSKey,
      handleUnload
    }
  },
  methods: {
    ...mapActions(['createModal', 'hideModal'])
  }
}
</script>
<style lang="scss">
#text-editor-preview {
  max-height: 80vh;
  overflow-y: scroll;
}
#text-editor-input {
  resize: vertical;
  height: 100%;
}
.editor-wrapper-height {
  height: calc(100% - 42px);
}
</style>
