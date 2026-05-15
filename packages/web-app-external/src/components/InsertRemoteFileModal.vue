<template>
  <div class="oc-height-1-1" tabindex="0">
    <app-loading-spinner v-if="isLoading" />
    <iframe
      v-show="!isLoading"
      ref="iframeRef"
      class="oc-width-1-1 oc-height-1-1"
      :title="iframeTitle"
      :src="iframeSrc"
      tabindex="0"
      @load="onLoad"
    ></iframe>
  </div>
</template>

<!--
  File picker modal for Collabora's remote insert features (UI_InsertGraphic / UI_InsertFile).
  Opens the oCIS file browser in embed mode, resolves the picked file to a download URL
  (with URL signing if available), and calls onSelect with { filename, url }.
  The caller sends the result back to the Collabora iframe as an Action_* postMessage.
-->
<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref, unref } from 'vue'
import {
  Modal,
  useClientService,
  useGetMatchingSpace,
  useMessages,
  useModals,
  useRouter,
  useThemeStore,
  useCapabilityStore,
  useUserStore,
  embedModeFilePickMessageData
} from '@ownclouders/web-pkg'
import { RouteLocationRaw } from 'vue-router'
import { AppLoadingSpinner } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

interface Props {
  modal: Modal
  parentFolderLink: RouteLocationRaw
  fileTypes?: string[]
  onSelect: (result: { filename: string; url: string }) => void
}
const { modal, parentFolderLink, fileTypes, onSelect } = defineProps<Props>()
const iframeRef = ref<HTMLIFrameElement>()
const isLoading = ref(true)
const router = useRouter()
const themeStore = useThemeStore()
const clientService = useClientService()
const capabilityStore = useCapabilityStore()
const userStore = useUserStore()
const { removeModal } = useModals()
const { showErrorMessage } = useMessages()
const { getMatchingSpace } = useGetMatchingSpace()
const { $gettext } = useGettext()

const parentFolderRoute = router.resolve(parentFolderLink)
const iframeTitle = themeStore.currentTheme.common?.name
const iframeUrl = new URL(parentFolderRoute.href, window.location.origin)
iframeUrl.searchParams.append('hide-logo', 'true')
iframeUrl.searchParams.append('embed', 'true')
iframeUrl.searchParams.append('embed-target', 'file')
iframeUrl.searchParams.append('embed-delegate-authentication', 'false')
if (fileTypes?.length) {
  iframeUrl.searchParams.append('embed-file-types', fileTypes.join(','))
}

const iframeSrc = iframeUrl.href

const onLoad = () => {
  isLoading.value = false
  unref(iframeRef).contentWindow.focus()
}

const onFilePick = async ({ data }: MessageEvent) => {
  if (data.name !== 'owncloud-embed:file-pick') {
    return
  }

  const { resource }: embedModeFilePickMessageData = data.data
  const space = getMatchingSpace(resource)

  try {
    // Resolve to a signed WebDAV URL so the Collabora server can download the file
    const url = await clientService.webdav.getFileUrl(space, resource, {
      isUrlSigningEnabled: capabilityStore.supportUrlSigning,
      username: userStore.user?.onPremisesSamAccountName
    })
    onSelect({ filename: resource.name, url })
  } catch (e) {
    console.error('Failed to resolve download URL for remote file insert', e)
    showErrorMessage({
      title: $gettext('Failed to get file URL'),
      errors: [e]
    })
  }

  removeModal(modal.id)
}

const onCancel = ({ data }: MessageEvent) => {
  if (data.name !== 'owncloud-embed:cancel') {
    return
  }

  removeModal(modal.id)
}

onMounted(() => {
  window.addEventListener('message', onFilePick)
  window.addEventListener('message', onCancel)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onFilePick)
  window.removeEventListener('message', onCancel)
})
</script>

<style lang="scss">
.oc-modal.insert-remote-file-modal {
  max-width: 80dvw;
  border: none;
  overflow: hidden;

  .oc-modal-title {
    display: none;
  }

  .oc-modal-body {
    padding: 0;

    &-message {
      height: 60dvh;
      margin: 0;
    }
  }
}
</style>
