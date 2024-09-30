<template>
  <iframe
    v-if="appUrl && method === 'GET'"
    :src="appUrl"
    class="oc-width-1-1 oc-height-1-1"
    :title="iFrameTitle"
    allowfullscreen
  />
  <div v-if="appUrl && method === 'POST' && formParameters" class="oc-height-1-1 oc-width-1-1">
    <form :action="appUrl" target="app-iframe" method="post">
      <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
      <div v-for="(item, key, index) in formParameters" :key="index">
        <input :name="key" :value="item" type="hidden" />
      </div>
    </form>
    <iframe
      name="app-iframe"
      class="oc-width-1-1 oc-height-1-1"
      :title="iFrameTitle"
      allowfullscreen
    />
  </div>
</template>

<script lang="ts">
import { stringify } from 'qs'
import {
  PropType,
  computed,
  defineComponent,
  unref,
  nextTick,
  ref,
  watch,
  VNodeRef,
  onMounted
} from 'vue'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'

import { Resource, SpaceResource } from '@ownclouders/web-client'
import { urlJoin } from '@ownclouders/web-client'
import {
  isSameResource,
  useCapabilityStore,
  useConfigStore,
  useMessages,
  useRequest,
  useAppProviderService,
  useRoute,
  queryItemAsString,
  useRouteQuery
} from '@ownclouders/web-pkg'
import {
  isProjectSpaceResource,
  isPublicSpaceResource,
  isShareSpaceResource
} from '@ownclouders/web-client'

export default defineComponent({
  name: 'ExternalApp',
  props: {
    space: { type: Object as PropType<SpaceResource>, required: true },
    resource: { type: Object as PropType<Resource>, required: true },
    isReadOnly: { type: Boolean, required: true }
  },
  setup(props) {
    const language = useGettext()
    const { $gettext } = language
    const { showErrorMessage } = useMessages()
    const capabilityStore = useCapabilityStore()
    const configStore = useConfigStore()
    const route = useRoute()
    const appProviderService = useAppProviderService()
    const { makeRequest } = useRequest()

    const viewModeQuery = useRouteQuery('view_mode')
    const viewModeQueryValue = computed(() => {
      return queryItemAsString(unref(viewModeQuery))
    })

    const appName = computed(() => {
      const lowerCaseAppName = unref(route)
        .name.toString()
        .replace('external-', '')
        .replace('-apps', '')
      return appProviderService.appNames.find(
        (appName) => appName.toLowerCase() === lowerCaseAppName
      )
    })

    const appUrl = ref()
    const formParameters = ref({})
    const method = ref()
    const subm: VNodeRef = ref()

    const iFrameTitle = computed(() => {
      return $gettext('"%{appName}" app content area', {
        appName: unref(appName)
      })
    })

    const errorPopup = (error: string) => {
      showErrorMessage({
        title: $gettext('An error occurred'),
        desc: error,
        errors: [new Error(error)]
      })
    }

    const loadAppUrl = useTask(function* (signal, viewMode: string) {
      try {
        if (props.isReadOnly && viewMode === 'write') {
          showErrorMessage({ title: $gettext('Cannot open file in edit mode as it is read-only') })
          return
        }

        const fileId = props.resource.fileId
        const baseUrl = urlJoin(
          configStore.serverUrl,
          capabilityStore.filesAppProviders[0].open_url
        )

        const query = stringify({
          file_id: fileId,
          lang: language.current,
          ...(unref(appName) && { app_name: encodeURIComponent(unref(appName)) }),
          ...(viewMode && { view_mode: viewMode })
        })

        const url = `${baseUrl}?${query}`
        const response = yield makeRequest('POST', url, {
          validateStatus: () => true,
          signal
        })

        if (response.status !== 200) {
          switch (response.status) {
            case 425:
              errorPopup(
                $gettext(
                  'This file is currently being processed and is not yet available for use. Please try again shortly.'
                )
              )
              break
            default:
              errorPopup(response.data?.message)
          }

          throw new Error('Error fetching app information')
        }

        if (!response.data.app_url || !response.data.method) {
          throw new Error('Error in app server response')
        }

        appUrl.value = response.data.app_url
        method.value = response.data.method

        if (response.data.form_parameters) {
          formParameters.value = response.data.form_parameters
        }

        if (method.value === 'POST' && formParameters.value) {
          // eslint-disable-next-line vue/valid-next-tick
          yield nextTick()
          unref(subm).click()
        }
      } catch (e) {
        console.error('web-app-external error', e)
        throw e
      }
    }).restartable()

    const determineOpenAsPreview = (appName: string) => {
      const openAsPreview = configStore.options.editor.openAsPreview
      return (
        openAsPreview === true || (Array.isArray(openAsPreview) && openAsPreview.includes(appName))
      )
    }

    // switch to write mode when edit is clicked
    const catchClickMicrosoftEdit = (event: MessageEvent) => {
      try {
        if (JSON.parse(event.data)?.MessageId === 'UI_Edit') {
          loadAppUrl.perform('write')
        }
      } catch (e) {}
    }
    onMounted(() => {
      if (determineOpenAsPreview(unref(appName))) {
        window.addEventListener('message', catchClickMicrosoftEdit)
      } else {
        window.removeEventListener('message', catchClickMicrosoftEdit)
      }
    })

    watch(
      [props.resource],
      ([newResource], [oldResource]) => {
        if (isSameResource(newResource, oldResource)) {
          return
        }

        let viewMode = 'view'

        if (!props.isReadOnly) {
          viewMode = unref(viewModeQueryValue) || 'write'
        }

        if (
          determineOpenAsPreview(unref(appName)) &&
          (isShareSpaceResource(props.space) ||
            isPublicSpaceResource(props.space) ||
            isProjectSpaceResource(props.space))
        ) {
          viewMode = 'view'
        }
        loadAppUrl.perform(viewMode)
      },
      { immediate: true, deep: true }
    )

    return {
      appUrl,
      formParameters,
      iFrameTitle,
      method,
      subm
    }
  }
})
</script>
