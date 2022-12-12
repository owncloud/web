<template>
  <main>
    <app-top-bar :resource="file" @close="closeApp" />
    <div v-if="isLoading" class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading PDF document')" size="xlarge" />
    </div>
    <loading-error-message v-else-if="isLoadingError">
      {{ loadingErrorMessage }}
    </loading-error-message>
    <div v-else class="oc-height-1-1">
      <object class="pdf-viewer oc-width-1-1" :data="fileUrl" type="application/pdf" />
    </div>
  </main>
</template>

<script lang="ts">
import { useTask } from 'vue-concurrency'
import { computed, defineComponent, onBeforeUnmount, ref, Ref, unref, watch } from 'vue'
import { useAppDefaults, useTranslations } from 'web-pkg'
import { Resource } from 'web-client'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import LoadingErrorMessage from 'web-pkg/src/components/stateMessage/LoadingErrorMessage.vue'

export default defineComponent({
  name: 'PDFViewer',
  components: {
    AppTopBar,
    LoadingErrorMessage
  },
  setup() {
    const defaults = useAppDefaults({
      applicationId: 'pdf-viewer'
    })
    const {
      currentFileContext,
      getFileInfo,
      getUrlForResource,
      replaceInvalidFileRoute,
      revokeUrl
    } = defaults
    const { $gettext } = useTranslations()
    const file: Ref<Resource> = ref()
    const fileUrl: Ref<string> = ref('')

    const STATUS_PROCESSING = 'processing'
    const loadFileTask = useTask(function* () {
      const fileContext = unref(currentFileContext)
      file.value = yield getFileInfo(fileContext)
      if (unref(file).processing) {
        throw new Error(STATUS_PROCESSING)
      }
      replaceInvalidFileRoute(fileContext, unref(file))
      fileUrl.value = yield getUrlForResource(unref(fileContext.space), unref(file), {
        disposition: 'inline'
      })
    }).restartable()
    const unloadPdf = () => {
      revokeUrl(unref(fileUrl))
    }

    watch(
      currentFileContext,
      () => {
        unloadPdf()
        loadFileTask.perform()
      },
      { immediate: true }
    )
    onBeforeUnmount(unloadPdf)

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
      file,
      fileUrl,
      isLoading,
      isLoadingError,
      loadingErrorMessage
    }
  }
})
</script>

<style scoped>
.pdf-viewer {
  border: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
  height: calc(100% - 52px);
}
</style>
