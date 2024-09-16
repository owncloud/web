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

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import {
  Modal,
  useClientService,
  useGetMatchingSpace,
  useMessages,
  useModals,
  useRouter,
  useThemeStore
} from '../../composables'
import { RouteLocationRaw } from 'vue-router'
import AppLoadingSpinner from '../AppLoadingSpinner.vue'
import { Resource } from '@ownclouders/web-client'
import { unref } from 'vue'
import { resolveFileNameDuplicate } from '../../helpers'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  name: 'SaveAsModal',
  components: { AppLoadingSpinner },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    parentFolderLink: { type: Object as PropType<RouteLocationRaw>, required: true },
    originalResource: { type: Object as PropType<Resource>, required: true },
    content: { type: String, required: true }
  },
  setup(props) {
    const iframeRef = ref<HTMLIFrameElement>()
    const isLoading = ref(true)
    const themeStore = useThemeStore()
    const { $gettext } = useGettext()
    const router = useRouter()
    const { webdav } = useClientService()
    const { removeModal } = useModals()
    const { showMessage, showErrorMessage } = useMessages()
    const { getMatchingSpace } = useGetMatchingSpace()
    const parentFolderRoute = router.resolve(props.parentFolderLink)

    const iframeTitle = themeStore.currentTheme.common?.name
    const iframeUrl = new URL(parentFolderRoute.href, window.location.origin)
    iframeUrl.searchParams.append('hide-logo', 'true')
    iframeUrl.searchParams.append('embed', 'true')
    iframeUrl.searchParams.append('embed-target', 'location')

    const onLoad = () => {
      isLoading.value = false
      unref(iframeRef).contentWindow.focus()
    }

    const onLocationPick = async ({ data }: MessageEvent) => {
      if (data.name !== 'owncloud-embed:select') {
        return
      }

      const destinationFolder: Resource = data.data[0]
      const space = getMatchingSpace(destinationFolder)

      let fileName = props.originalResource.name
      const { children: existingResources } = await webdav.listFiles(space, {
        fileId: destinationFolder.fileId
      })
      if (existingResources.find((resource) => resource.name === props.originalResource.name)) {
        fileName = resolveFileNameDuplicate(
          props.originalResource.name,
          props.originalResource.extension,
          existingResources
        )
      }

      try {
        await webdav.putFileContents(space, {
          fileName,
          parentFolderId: destinationFolder.id,
          content: props.content
        })
        showMessage({ title: $gettext('"%{fileName}" was saved successfully', { fileName }) })
      } catch (e) {
        console.error(e)
        showErrorMessage({
          title: $gettext('Unable to save "%{fileName}"', { fileName }),
          errors: [e]
        })
        console.error(e)
      }

      removeModal(props.modal.id)
    }

    const onCancel = ({ data }: MessageEvent) => {
      if (data.name !== 'owncloud-embed:cancel') {
        return
      }

      removeModal(props.modal.id)
    }

    onMounted(() => {
      window.addEventListener('message', onLocationPick)
      window.addEventListener('message', onCancel)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('message', onLocationPick)
      window.removeEventListener('message', onCancel)
    })

    return {
      isLoading,
      onLoad,
      iframeTitle,
      iframeSrc: iframeUrl.href,
      iframeRef,
      onLocationPick
    }
  }
})
</script>

<style lang="scss">
.save-as-modal {
  max-width: 80vw;
  border: none;
  overflow: hidden;

  .oc-modal-title {
    display: none;
  }

  .oc-modal-body {
    padding: 0;

    &-message {
      height: 60vh;
      margin: 0;
    }
  }
}
</style>
