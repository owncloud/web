<template>
  <main class="oc-height-1-1">
    <app-top-bar v-if="!loading && !loadingError" :resource="resource" @close="closeApp" />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <slot v-bind="slotAttrs" />
    </div>
  </main>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, onBeforeUnmount, ref, unref, watch } from 'vue'
import { useTask } from 'vue-concurrency'

import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from 'web-pkg/src/components/AppTemplates/PartialViews/ErrorScreen.vue'
import LoadingScreen from 'web-pkg/src/components/AppTemplates/PartialViews/LoadingScreen.vue'
import { UrlForResourceOptions, useAppDefaults } from 'web-pkg/src/composables'
import { Resource } from 'web-client'
import { DavProperty } from 'web-client/src/webdav/constants'

export default defineComponent({
  name: 'AppWrapper',
  components: {
    AppTopBar,
    ErrorScreen,
    LoadingScreen
  },
  props: {
    // TODO: Add app-top-bar-actions array prop and pass to AppTopBar
    applicationId: {
      type: String,
      required: true
    },
    urlForResourceOptions: {
      type: Object as PropType<UrlForResourceOptions>,
      default: () => {}
    }
  },
  setup(props) {
    const resource: Ref<Resource> = ref()
    const url = ref('')
    const loading = ref(true)
    const loadingError = ref(false)

    const { currentFileContext, getFileInfo, getUrlForResource, closeApp, revokeUrl } =
      useAppDefaults({
        applicationId: props.applicationId
      })

    const loadFileTask = useTask(function* () {
      resource.value = yield getFileInfo(currentFileContext, {
        davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
      }).catch(() => {
        loadingError.value = true
        loading.value = false
      })
    }).restartable()

    watch(
      currentFileContext,
      () => {
        loadFileTask.perform().then(async () => {
          const currentSpace = unref(unref(currentFileContext).space)

          url.value = await getUrlForResource(currentSpace, resource.value, {
            disposition: props.urlForResourceOptions.disposition
          })
          loading.value = false
        })
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      revokeUrl(url.value)
    })

    const slotAttrs = {
      url,
      resource,
      isDirty: false,
      isReadOnly: false,
      applicationConfig: {},
      currentContent: 'dies',
      serverContent: 'dies'
    }

    return {
      closeApp,
      loading,
      loadingError,
      resource,
      slotAttrs
    }
  }
})
</script>
