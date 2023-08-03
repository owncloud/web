<template>
  <main class="oc-height-1-1">
    <app-top-bar v-if="!loading && !loadingError" :resource="resource" @close="closeApp">
      {{ slotAttrs.isDirty }}
    </app-top-bar>
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" />
    <div v-else class="oc-height-1-1">
      <slot v-bind="slotAttrs" />
    </div>
  </main>
</template>

<script lang="ts">
import { PropType, Ref, defineComponent, onBeforeUnmount, ref, unref, watch, computed } from 'vue'
import { useTask } from 'vue-concurrency'

import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import ErrorScreen from 'web-pkg/src/components/AppTemplates/PartialViews/ErrorScreen.vue'
import LoadingScreen from 'web-pkg/src/components/AppTemplates/PartialViews/LoadingScreen.vue'
import { UrlForResourceOptions, useAppDefaults } from 'web-pkg/src/composables'
import { Resource } from 'web-client'
import { DavProperty } from 'web-client/src/webdav/constants'
import { AppConfigObject } from 'web-pkg/src/apps/types'

export interface AppWrapperSlotArgs {
  applicationConfig: AppConfigObject
  resource: Resource
  currentContent: Ref<string>
  isDirty: boolean
  isReadOnly: boolean
}

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
      default: () => {},
      required: false
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
      try {
        const tmpResource = yield getFileInfo(currentFileContext, {
          davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
        })
        const currentSpace = unref(unref(currentFileContext).space)
        const tmpUrl = yield getUrlForResource(
          currentSpace,
          tmpResource,
          props.urlForResourceOptions
        )

        // update both at once
        resource.value = tmpResource
        url.value = tmpUrl
        console.log('resource', resource.value.id, 'url', url.value)
      } catch (e) {
        console.error(e)
        loadingError.value = true
      } finally {
        loading.value = false
      }
    }).restartable()

    watch(
      currentFileContext,
      () => {
        loadFileTask.perform()
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      revokeUrl(url.value)
    })

    const serverContent = ref('dies')
    const currentContent = ref('dies')
    const isDirty = computed(() => {
      return unref(currentContent) !== unref(serverContent)
    })

    const slotAttrs = computed(() => ({
      url: unref(url),
      resource,
      isDirty,
      isReadOnly: false,
      applicationConfig: {},
      currentContent
    }))

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
