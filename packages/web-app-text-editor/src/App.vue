<template>
  <main id="text-editor" class="oc-height-1-1">
    <app-top-bar :resource="resource" @close="closeApp">
      <template #right>
        <oc-button
          v-if="!isLoading"
          id="text-editor-controls-save"
          :aria-label="$gettext('Save')"
          :disabled="isReadOnly || !isDirty"
          @click="save"
        >
          <oc-icon name="save" size="small" />
        </oc-button>
      </template>
    </app-top-bar>
    <div v-if="isLoading" class="oc-text-center">
      <oc-spinner :aria-label="$gettext('Loading editor content')" />
    </div>
    <div v-else-if="isError" class="oc-text-center">
      <div class="oc-position-center oc-text-center">
        <oc-icon size="xxlarge" name="error-warning" fill-type="line" />
      </div>
    </div>
    <div v-else class="oc-flex editor-wrapper-height oc-px-s oc-pt-rm oc-pb-s">
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
<script lang="ts">
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import { useTask } from 'vue-concurrency'
import { computed, defineComponent, onMounted, onBeforeUnmount, ref, unref, Ref, watch } from 'vue'
import { mapActions } from 'vuex'
import { DavPermission, DavProperty } from 'web-client/src/webdav/constants'
import { useAppDefaults, useStore } from 'web-pkg/src/composables'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import OpenFileBar from 'web-pkg/src/portals/OpenFileBar.vue'
import { Resource } from 'web-client'
import { isProjectSpaceResource } from 'web-client/src/helpers'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'TextEditor',
  components: {
    AppTopBar,
    OpenFileBar
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
        onConfirm: async () => {
          await this.save()
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
    const {
      applicationConfig,
      currentFileContext,
      getFileInfo,
      getFileContents,
      putFileContents,
      replaceInvalidFileRoute
    } = defaults
    const serverContent = ref()
    const currentContent = ref()
    const currentETag = ref()
    const isReadOnly = ref(true)
    const resource: Ref<Resource> = ref()
    const store = useStore()
    const { $gettext, interpolate: $gettextInterpolate } = useGettext()
    let autosaveIntervalId = null

    const errorPopup = (error) => {
      store.dispatch('showMessage', {
        title: $gettext('An error occurred'),
        desc: error,
        status: 'danger'
      })
    }

    const autosavePopup = () => {
      store.dispatch('showMessage', {
        title: $gettext('File autosaved')
      })
    }

    const loadFileTask = useTask(function* () {
      resource.value = yield getFileInfo(currentFileContext, {
        davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
      })
      replaceInvalidFileRoute(currentFileContext, unref(resource))
      isReadOnly.value = ![DavPermission.Updateable, DavPermission.FileUpdateable].some(
        (p) => (resource.value.permissions || '').indexOf(p) > -1
      )

      const fileContentsResponse = yield getFileContents(currentFileContext)
      serverContent.value = currentContent.value = fileContentsResponse.body
      currentETag.value = fileContentsResponse.headers['OC-ETag']
    }).restartable()

    const saveFileTask = useTask(function* () {
      const newContent = unref(currentContent)

      try {
        const putFileContentsResponse = yield putFileContents(currentFileContext, {
          content: newContent,
          previousEntityTag: unref(currentETag)
        })
        serverContent.value = newContent
        currentETag.value = putFileContentsResponse.etag
      } catch (e) {
        switch (e.statusCode) {
          case 412:
            errorPopup(
              $gettext(
                'This file was updated outside this window. Please refresh the page (all changes will be lost).'
              )
            )
            break
          case 500:
            errorPopup($gettext('Error when contacting the server'))
            break
          case 507:
            const space = store.getters['runtime/spaces/spaces'].find(
              (space) => space.id === unref(resource).storageId && isProjectSpaceResource(space)
            )
            if (space) {
              errorPopup(
                $gettextInterpolate(
                  $gettext('There is not enough quota on "%{spaceName}" to save this file'),
                  { spaceName: space.name }
                )
              )
              break
            }
            errorPopup($gettext('There is not enough quota to save this file'))
            break
          case 401:
            errorPopup($gettext("You're not authorized to save this file"))
            break
          default:
            errorPopup(e.message || e)
        }
      }
    }).restartable()

    watch(
      currentFileContext,
      () => {
        loadFileTask.perform()
      },
      { immediate: true }
    )

    const renderedMarkdown = computed(() => {
      return unref(currentContent) && showPreview
        ? sanitizeHtml(marked(unref(currentContent)))
        : null
    })

    const isDirty = computed(() => {
      return unref(serverContent) !== unref(currentContent)
    })

    const isError = computed(() => {
      return loadFileTask.isError
    })

    const isLoading = computed(() => {
      return loadFileTask.isRunning
    })

    const showPreview = computed(() => {
      return unref(fileExtension) === 'md' || !unref(config).showPreviewOnlyMd
    })

    const fileExtension = computed(() => {
      return unref(unref(currentFileContext).path).split('.').pop()
    })

    const config = computed(() => {
      const { showPreviewOnlyMd = true } = unref(applicationConfig)
      return { showPreviewOnlyMd }
    })

    onMounted(() => {
      // Enable ctrl/cmd + s
      document.addEventListener('keydown', handleSKey, false)
      // Ensure reload is not possible if there are changes
      window.addEventListener('beforeunload', handleUnload)

      const editorOptions = store.getters.configuration.options.editor
      if (editorOptions.autosaveEnabled) {
        autosaveIntervalId = setInterval(() => {
          if (isDirty.value) {
            save().then((r) => autosavePopup())
          }
        }, (editorOptions.autosaveInterval || 120) * 1000)
      }
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleUnload)
      document.removeEventListener('keydown', handleSKey, false)
      clearInterval(autosaveIntervalId)
    })

    const save = async function () {
      await saveFileTask.perform()
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
      isError,
      showPreview,
      isDirty,
      isReadOnly,
      currentContent,
      renderedMarkdown,
      config,
      resource,

      // methods
      save,
      handleSKey,
      handleUnload
    }
  },
  methods: {
    ...mapActions(['createModal', 'hideModal'])
  }
})
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
  height: calc(100% - 58px);
}
</style>
