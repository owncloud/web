<template>
  <main ref="wrapperRef">
    <div v-if="isLoading" class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading media')" size="xlarge" />
    </div>
    <loading-error-message v-else-if="isLoadingError">
      {{ loadingErrorMessage }}
    </loading-error-message>
    <iframe
      v-else
      id="drawio-editor"
      ref="drawIoEditorRef"
      :src="iframeSource"
      :title="$gettext('Draw.io editor')"
    />
  </main>
</template>
<script lang="ts">
import { useTask } from 'vue-concurrency'
import qs from 'qs'
import { DateTime } from 'luxon'
import { DavPermission } from 'web-client/src/webdav/constants'
import { Resource, FileResource } from 'web-client/src/helpers'
import { useAppDefaults, useStore, useTranslations } from 'web-pkg'
import { computed, defineComponent, onMounted, ref, Ref, unref, watch } from 'vue'
import { basename } from 'path'
import LoadingErrorMessage from 'web-pkg/src/components/stateMessage/LoadingErrorMessage.vue'

export default defineComponent({
  name: 'DrawIoEditor',
  components: {
    LoadingErrorMessage
  },
  setup() {
    const store = useStore()
    const defaults = useAppDefaults({
      applicationId: 'draw-io'
    })
    const {
      applicationConfig,
      currentFileContext,
      getFileInfo,
      getFileContents,
      putFileContents,
      replaceInvalidFileRoute
    } = defaults
    const { $gettext, $gettextInterpolate } = useTranslations()
    const itemPath: Ref<string> = ref()
    const file: Ref<Resource> = ref()
    const isReadOnly: Ref<boolean> = ref(false)
    const currentETag: Ref<string> = ref('')
    const drawIoEditorRef = ref(null)
    const wrapperRef = ref(null)
    const loadedContent = ref('')
    onMounted(() => {
      console.log('wrapperRef', unref(wrapperRef))
    })

    const config = computed(() => {
      const {
        url = 'https://embed.diagrams.net',
        theme = 'minimal',
        autosave = false
      } = unref(applicationConfig)
      return { url, theme, autosave: autosave ? 1 : 0 }
    })
    const urlHost = computed(() => {
      const url = new URL(unref(config).url)
      const urlHost = `${url.protocol}//${url.hostname}`
      return url.port ? `${urlHost}:${url.port}` : urlHost
    })

    const STATUS_PROCESSING = 'processing'
    const loadFileTask = useTask(function* () {
      const fileContext = unref(currentFileContext)
      itemPath.value = unref(fileContext.item)

      file.value = yield getFileInfo(fileContext)
      if (unref(file).processing) {
        throw new Error(STATUS_PROCESSING)
      }
      replaceInvalidFileRoute(fileContext, unref(file))
      isReadOnly.value = ![DavPermission.Updateable, DavPermission.FileUpdateable].some(
        (p) => (unref(file).permissions || '').indexOf(p) > -1
      )

      const isVisio = unref(file).extension === 'vsdx'
      if (isVisio) {
        // FIXME: ideally we'd load the content, write into a .drawio file and
        // then redirect to the new fileContext (would fire the currentFileContext watcher).
        itemPath.value = `${unref(file).name}_${DateTime.local().toFormat(
          'YYYYMMDD[T]HHmmss'
        )}.drawio`
        yield store.dispatch('showMessage', {
          title: $gettext('Diagram imported'),
          desc: $gettextInterpolate(
            $gettext('The diagram will open as a new .drawio file: %{file}'),
            { file: basename(unref(itemPath)) },
            true
          )
        })

        const response = yield getFileContents(currentFileContext, {
          responseType: 'arrayBuffer'
        })
        // Ignoring the `currentETag` header on imports allows to create new files.
        // otherwise the ETag comparison fails with a 412 during the autosave/save event
        const blob = new Blob([response.body], { type: 'application/vnd.visio' })
        const reader = new FileReader()
        reader.onloadend = () => {
          currentETag.value = undefined
          loadedContent.value = `${reader.result}`
        }
        reader.readAsDataURL(blob)
      } else {
        const response = yield getFileContents(fileContext)
        currentETag.value = response.headers.ETag
        loadedContent.value = response.body
      }
    }).restartable()
    watch(
      currentFileContext,
      () => {
        loadFileTask.perform()
      },
      { immediate: true }
    )

    const initContent = () => {
      unref(drawIoEditorRef).contentWindow.postMessage(
        JSON.stringify({
          action: 'load',
          xml: unref(loadedContent),
          autosave: unref(config).autosave
        }),
        unref(urlHost)
      )
    }

    const saveContent = (payload, autosave = false) => {
      const announceStatusToIframe = (message: string) => {
        unref(drawIoEditorRef).contentWindow.postMessage(
          JSON.stringify({
            action: 'status',
            message,
            modified: false
          }),
          unref(urlHost)
        )
      }
      const errorPopup = (error) => {
        store.dispatch('showMessage', {
          title: $gettext('Saving the diagram failed'),
          desc: error,
          status: 'danger'
        })
      }
      const successPopup = (msg) => {
        store.dispatch('showMessage', {
          title: $gettext('The diagram was successfully saved'),
          desc: msg,
          status: 'success'
        })
      }

      putFileContents(
        { ...currentFileContext, item: itemPath },
        {
          content: payload.xml,
          previousEntityTag: unref(currentETag)
        }
      )
        .then((resp: FileResource) => {
          currentETag.value = resp.etag

          const message = $gettext('File saved!')
          autosave ? announceStatusToIframe(message) : successPopup(message)
        })
        .catch((error) => {
          let message = ''
          switch (error.statusCode) {
            case 401:
              message = $gettext("Saving error. You're not authorized to save this file")
              break
            case 412:
              message = $gettext(
                'This file was updated outside this window. Please refresh the page. All changes will be lost, so download a copy first.'
              )
              break
            case 500:
              message = $gettext("Couldn't save. Error when contacting the server")
              break
            default:
              message = error.message || error
          }
          autosave ? announceStatusToIframe(message) : errorPopup(message)
        })
    }

    const iframeSource = computed(() => {
      const query = qs.stringify({
        embed: 1,
        chrome: unref(isReadOnly) ? 0 : 1,
        picker: 0,
        stealth: 1,
        spin: 1,
        proto: 'json',
        ui: unref(config).theme
      })

      return `${unref(config).url}?${query}`
    })

    window.addEventListener('message', (event) => {
      if (event.data.length > 0) {
        if (event.origin !== unref(config).url) {
          return
        }
        const payload = JSON.parse(event.data)
        switch (payload.event) {
          case 'init':
            initContent()
            break
          case 'autosave':
          case 'save':
            saveContent(payload, payload.event === 'autosave')
            break
          case 'exit':
            window.close()
            break
        }
      }
    })

    const isLoading = computed(() => {
      return loadFileTask.isRunning || !loadFileTask.last
    })
    const isLoadingError = computed(() => {
      return loadFileTask.isError
    })
    const loadingErrorMessage = computed(() => {
      if (loadFileTask.last.error?.message === STATUS_PROCESSING) {
        return $gettext(
          'This file is currently being processed and is not yet available for use. Please try again shortly.'
        )
      }
      return $gettext('Failed to load file')
    })

    return {
      ...defaults,
      isLoading,
      isLoadingError,
      loadingErrorMessage,
      iframeSource
    }
  }
})
</script>
<style scoped>
#drawio-editor {
  width: 100%;
  height: 100%;
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
