<template>
  <main class="oc-height-1-1">
    <app-top-bar v-if="!loading && !loadingError" :resource="resource" @close="defaults.closeApp" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <slot :url="url" />
    </div>
  </main>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useTask } from 'vue-concurrency'

import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from 'web-pkg/src/components/AppTemplates/PartialViews/ErrorScreen.vue'
import LoadingScreen from 'web-pkg/src/components/AppTemplates/PartialViews/LoadingScreen.vue'
import { AppDefaultsResult } from 'web-pkg/types'
import { Resource } from 'web-client'
import { DavProperty } from 'web-client/src/webdav/constants'

export default defineComponent({
  name: 'ViewerApp',
  components: {
    AppTopBar,
    ErrorScreen,
    LoadingScreen
  },
  props: {
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
    const resource: Ref<Resource> = ref()
    const url = ref('')
    const loading = ref(true)
    const loadingError = ref(false)

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

    onBeforeUnmount(() => {
      props.defaults.revokeUrl(url.value)
    })

    return {
      loading,
      loadingError,
      resource,
      url
    }
  }
})
</script>
