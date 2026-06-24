<template>
  <iframe
    v-if="appUrl && method === 'GET'"
    ref="appIframe"
    :src="appUrl"
    class="oc-width-1-1 oc-height-1-1"
    :title="iFrameTitle"
    allowfullscreen
    allow="camera; clipboard-read; clipboard-write"
    @load="onIframeLoad"
  />
  <div v-if="appUrl && method === 'POST' && formParameters" class="oc-height-1-1 oc-width-1-1">
    <form :action="appUrl" target="app-iframe" method="post">
      <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
      <div v-for="(item, key, index) in formParameters" :key="index">
        <input :name="key" :value="item" type="hidden" />
      </div>
    </form>
    <iframe
      ref="appIframe"
      name="app-iframe"
      :src="appUrl"
      class="oc-width-1-1 oc-height-1-1"
      :title="iFrameTitle"
      allowfullscreen
      allow="camera; clipboard-read; clipboard-write"
      @load="onIframeLoad"
    />
  </div>
</template>

<script lang="ts" setup>
import { stringify } from 'qs'
import {
  computed,
  inject,
  unref,
  nextTick,
  ref,
  watch,
  VNodeRef,
  onMounted,
  onBeforeUnmount,
  type Ref
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
  useModals,
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

type ExtendedNavigator = Navigator & {
  userAgentData?: {
    mobile: boolean
    platform: string
    brands: { brand: string; version: string }[]
  }
}

interface Props {
  space: SpaceResource
  resource: Resource
  isReadOnly: boolean
}
const props = defineProps<Props>()
const language = useGettext()
const { $gettext } = language
const { showErrorMessage } = useMessages()
const { dispatchModal } = useModals()
const capabilityStore = useCapabilityStore()
const configStore = useConfigStore()
const route = useRoute()
const appProviderService = useAppProviderService()
const { makeRequest } = useRequest()

const viewModeQuery = useRouteQuery('view_mode')
const isMobileWidth =
  inject<Ref<boolean>>('isMobileWidth') || (navigator as ExtendedNavigator).userAgentData?.mobile
const viewModeQueryValue = computed(() => {
  return queryItemAsString(unref(viewModeQuery))
})

const templateIdQuery = useRouteQuery('templateId')
const templateIdQueryValue = computed(() => {
  return queryItemAsString(unref(templateIdQuery))
})

const appName = computed(() => {
  const lowerCaseAppName = unref(route)
    .name.toString()
    .replace('external-', '')
    .replace('-apps', '')
  return appProviderService.appNames.find((appName) => appName.toLowerCase() === lowerCaseAppName)
})

const appUrl = ref()
const formParameters = ref({})
const method = ref()
const subm: VNodeRef = ref()
const appIframe = ref<HTMLIFrameElement>()

// Origin of the editor (e.g. the Collabora host) used as the target origin when
// posting messages into the iframe.
const appOrigin = computed(() => {
  try {
    return new URL(unref(appUrl)).origin
  } catch {
    return ''
  }
})

// Collabora exposes "Save As" (export to another format, saved back to storage
// via WOPI PutRelativeFile) as a host-delegated operation: it shows a grouped
// Save-As control and posts a `UI_SaveAs` message, expecting the host to reply
// with the target filename. Request that grouped control via `ui_defaults`.
// The parameter is Collabora-specific and ignored by other app providers.
const withSaveAsUiDefaults = (rawUrl: string) => {
  try {
    const url = new URL(rawUrl)
    if (!url.searchParams.has('ui_defaults')) {
      url.searchParams.set('ui_defaults', 'SaveAsMode=group')
    }
    return url.href
  } catch {
    return rawUrl
  }
}

// Post a WOPI postMessage into the editor iframe (messages are JSON strings).
const postToApp = (message: Record<string, unknown>) => {
  const target = unref(appIframe)?.contentWindow
  if (!target || !unref(appOrigin)) {
    return
  }
  target.postMessage(JSON.stringify({ ...message, SendTime: Date.now() }), unref(appOrigin))
}

// The editor only emits its rich postMessage API (UI_SaveAs, App_LoadingStatus,
// ...) once the host has announced itself with `Host_PostmessageReady`. Without
// this handshake "Save As" silently does nothing. Send it as soon as the iframe
// has loaded.
const onIframeLoad = () => {
  postToApp({ MessageId: 'Host_PostmessageReady', Values: {} })
}

// Handle the editor's "Save As" request: ask the user for the copy's name (the
// extension selects the export format) and reply with `Action_SaveAs`, which
// makes the editor render to that format and PutRelativeFile it into the space.
const onSaveAs = () => {
  dispatchModal({
    variation: 'passive',
    title: $gettext('Save a copy'),
    confirmText: $gettext('Save'),
    hasInput: true,
    inputValue: props.resource.name,
    inputLabel: $gettext('File name'),
    onConfirm: (filename: string) => {
      postToApp({ MessageId: 'Action_SaveAs', Values: { Filename: filename, Notify: true } })
    }
  })
}

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
    const baseUrl = urlJoin(configStore.serverUrl, capabilityStore.filesAppProviders[0].open_url)

    const query = stringify({
      file_id: fileId,
      lang: language.current,
      mobile: unref(isMobileWidth) ? 1 : 0,
      ...(unref(appName) && { app_name: encodeURIComponent(unref(appName)) }),
      ...(viewMode && { view_mode: viewMode }),
      ...(unref(templateIdQueryValue) && { template_id: unref(templateIdQueryValue) })
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

    appUrl.value = withSaveAsUiDefaults(response.data.app_url)
    method.value = response.data.method

    if (response.data.form_parameters) {
      formParameters.value = response.data.form_parameters
    }

    if (method.value === 'POST' && formParameters.value) {
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
  return openAsPreview === true || (Array.isArray(openAsPreview) && openAsPreview.includes(appName))
}

// Single handler for the editor's postMessage events. Only messages coming from
// the editor's own origin are accepted.
const onAppMessage = (event: MessageEvent) => {
  if (unref(appOrigin) && event.origin !== unref(appOrigin)) {
    return
  }
  let message: { MessageId?: string }
  try {
    message = JSON.parse(event.data)
  } catch {
    return
  }
  switch (message?.MessageId) {
    case 'UI_Edit':
      // switch to write mode when edit is clicked
      if (determineOpenAsPreview(unref(appName))) {
        loadAppUrl.perform('write')
      }
      break
    case 'UI_SaveAs':
      onSaveAs()
      break
  }
}
onMounted(() => {
  window.addEventListener('message', onAppMessage)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', onAppMessage)
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
</script>
