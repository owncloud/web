<template>
  <main class="oc-height-1-1">
    <app-top-bar
      v-if="!loadingError && !loading"
      :resource="resource"
      :main-actions="fileActions"
      @close="defaults.closeApp"
    />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-flex oc-px-s oc-pt-rm oc-pb-s oc-height-1-1">
      <slot :url="url" :resource="resource" :is-read-only="false" />
    </div>
  </main>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  unref,
  Ref,
  watch,
  PropType
} from 'vue'
import { useTask } from 'vue-concurrency'
import { onBeforeRouteLeave } from 'vue-router'
import { useGettext } from 'vue3-gettext'

import { AppDefaultsResult, useStore } from 'web-pkg/src/composables'
import { Action, ActionOptions } from 'web-pkg/src/composables/actions/types'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from 'web-pkg/src/components/AppTemplates/PartialViews/ErrorScreen.vue'
import LoadingScreen from 'web-pkg/src/components/AppTemplates/PartialViews/LoadingScreen.vue'

import { Resource } from 'web-client'
import { DavPermission, DavProperty } from 'web-client/src/webdav/constants'
import { isProjectSpaceResource } from 'web-client/src/helpers'

export default defineComponent({
  name: 'EditorApp',
  components: {
    AppTopBar,
    LoadingScreen,
    ErrorScreen
  },
  props: {
    // TODO: Add app-top-bar-actions array prop and pass to AppTopBar
    defaults: {
      type: Object as PropType<AppDefaultsResult>,
      default: () => {}
    },
    urlForResourceOptions: {
      type: Object,
      default: () => {}
    }
  },
  setup(props) {
    const store = useStore()
    const isAutoSaveEnabled = store.getters.configuration.options.editor.autosaveEnabled

    const resource: Ref<Resource> = ref()
    const url = ref('')
    const loading = ref(true)
    const loadingError = ref(false)

    const serverContent = ref()
    const currentContent = ref()
    const currentETag = ref()
    const isReadOnly = ref(true)

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
      resource.value = yield props.defaults
        .getFileInfo(props.defaults.currentFileContext, {
          davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
        })
        .catch(() => {
          loadingError.value = true
          loading.value = false
        })
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
      props.defaults.currentFileContext,
      () => {
        loadFileTask.perform().then(async () => {
          const currentSpace = unref(unref(props.defaults.currentFileContext).space)

          url.value = await props.defaults.getUrlForResource(currentSpace, resource.value, {
            disposition: 'inline'
          })
          loading.value = false
        })
      },
      { immediate: true }
    )

    const isDirty = computed(() => {
      return unref(serverContent) !== unref(currentContent)
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

    onBeforeRouteLeave(() => {
      if (isDirty.value) {
        const modal = {
          variation: 'danger',
          icon: 'warning',
          title: $gettext('Unsaved changes'),
          message: $gettext('Your changes were not saved. Do you want to save them?'),
          cancelText: $gettext("Don't Save"),
          confirmText: $gettext('Save'),
          onCancel: () => {
            store.dispatch('hideModal')
          },
          onConfirm: async () => {
            await save()
            store.dispatch('hideModal')
          }
        }

        store.dispatch('createModal', modal)
      }
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

    const fileActions: Action<ActionOptions>[] = [
      {
        name: 'save-file',
        disabledTooltip: () => '',
        isEnabled: () => true,
        isDisabled: () => isReadOnly.value || !isDirty.value,
        componentType: 'button',
        icon: 'save',
        id: 'text-editor-controls-save',
        label: () => 'Save',
        handler: () => {
          save()
        }
      }
    ]

    return {
      fileActions,

      // tasks
      loadFileTask,
      saveFileTask,

      // data
      loading,
      loadingError,
      url,
      resource,

      isDirty,
      isReadOnly,
      currentContent,

      // methods
      save,
      handleSKey,
      handleUnload
    }
  }
})
</script>
