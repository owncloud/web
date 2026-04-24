<template>
  <iframe
    v-if="appUrl && method === 'GET'"
    ref="appIframeRef"
    :src="appUrl"
    class="oc-width-1-1 oc-height-1-1"
    :title="iFrameTitle"
    allowfullscreen
    allow="camera; clipboard-read; clipboard-write"
  />
  <div v-if="appUrl && method === 'POST' && formParameters" class="oc-height-1-1 oc-width-1-1">
    <form :action="appUrl" target="app-iframe" method="post">
      <input ref="subm" type="submit" :value="formParameters" class="oc-hidden" />
      <div v-for="(item, key, index) in formParameters" :key="index">
        <input :name="key" :value="item" type="hidden" />
      </div>
    </form>
    <iframe
      ref="appIframeRef"
      name="app-iframe"
      :src="appUrl"
      class="oc-width-1-1 oc-height-1-1"
      :title="iFrameTitle"
      allowfullscreen
      allow="camera; clipboard-read; clipboard-write"
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
  useFolderLink,
  queryItemAsString,
  useRouteQuery
} from '@ownclouders/web-pkg'
import InsertRemoteFileModal from './components/InsertRemoteFileModal.vue'
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
const capabilityStore = useCapabilityStore()
const configStore = useConfigStore()
const route = useRoute()
const appProviderService = useAppProviderService()
const { makeRequest } = useRequest()
const { dispatchModal } = useModals()
const { getParentFolderLink } = useFolderLink()

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
const appIframeRef = ref<HTMLIFrameElement>()

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

    appUrl.value = response.data.app_url
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

const IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/svg+xml',
  'image/bmp',
  'image/webp'
]

const postMessageToApp = (messageId: string, values?: Record<string, unknown>) => {
  const iframe = unref(appIframeRef)
  if (!iframe?.contentWindow) {
    return
  }
  iframe.contentWindow.postMessage(JSON.stringify({ MessageId: messageId, Values: values }), '*')
}

const openInsertFileModal = ({
  title,
  fileTypes,
  responseMessageId
}: {
  title: string
  fileTypes?: string[]
  responseMessageId: string
}) => {
  const parentFolderLink = getParentFolderLink(props.resource)
  dispatchModal({
    elementClass: 'insert-remote-file-modal',
    title,
    customComponent: InsertRemoteFileModal,
    hideActions: true,
    customComponentAttrs: () => ({
      parentFolderLink,
      fileTypes,
      onSelect: ({ filename, url }: { filename: string; url: string }) => {
        postMessageToApp(responseMessageId, { filename, url })
      }
    }),
    focusTrapInitial: false
  })
}

const handleAppMessage = (event: MessageEvent) => {
  try {
    const msg = JSON.parse(event.data)
    if (!msg?.MessageId) {
      return
    }

    switch (msg.MessageId) {
      // Collabora requires this handshake before it accepts any Action_* messages.
      // Without it, all postMessages are rejected with "PostMessage ignored: not ready."
      case 'App_LoadingStatus':
        if (msg.Values?.Status === 'Document_Loaded') {
          postMessageToApp('Host_PostmessageReady')
        }
        break

      case 'UI_Edit':
        if (determineOpenAsPreview(unref(appName))) {
          loadAppUrl.perform('write')
        }
        break

      case 'UI_InsertGraphic':
        openInsertFileModal({
          title: $gettext('Insert image'),
          fileTypes: IMAGE_MIME_TYPES,
          responseMessageId: 'Action_InsertGraphic'
        })
        break

      case 'UI_InsertFile': {
        const callback = msg.Values?.callback
        const mimeTypeFilter = msg.Values?.mimeTypeFilter
        openInsertFileModal({
          title:
            callback === 'Action_CompareDocuments'
              ? $gettext('Compare document')
              : $gettext('Insert multimedia'),
          fileTypes: mimeTypeFilter,
          responseMessageId: callback
        })
        break
      }
    }
  } catch {}
}

onMounted(() => {
  window.addEventListener('message', handleAppMessage)
})
onBeforeUnmount(() => {
  window.removeEventListener('message', handleAppMessage)
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
