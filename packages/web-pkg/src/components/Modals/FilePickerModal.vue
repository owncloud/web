<template>
  <div class="oc-height-1-1" tabindex="0">
    <app-loading-spinner v-if="isLoading" />
    <iframe
      v-show="!isLoading"
      ref="iframeRef"
      class="oc-width-1-1 oc-height-1-1"
      :title="iframeTitle"
      :src="iframeSrc"
      @load="onLoad"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref } from 'vue'
import {
  EDITOR_MODE_EDIT,
  Modal,
  useGetMatchingSpace,
  useModals,
  useRouter,
  useThemeStore,
  useFileActions
} from '../../composables'
import { ApplicationInformation } from '../../apps'
import { RouteLocationRaw } from 'vue-router'
import AppLoadingSpinner from '../AppLoadingSpinner.vue'
import { isShareSpaceResource, Resource } from '@ownclouders/web-client'
import { unref } from 'vue'
import { HTMLIFrameElement } from 'happy-dom'

export default defineComponent({
  name: 'FilePickerModal',
  components: { AppLoadingSpinner },
  props: {
    modal: { type: Object as PropType<Modal>, required: true },
    app: { type: Object as PropType<ApplicationInformation>, required: true },
    parentFolderLink: { type: Object as PropType<RouteLocationRaw>, required: true }
  },
  setup(props) {
    const iframeRef = ref<HTMLIFrameElement>()
    const isLoading = ref(true)
    const router = useRouter()
    const { removeModal } = useModals()
    const { getMatchingSpace } = useGetMatchingSpace()
    const themeStore = useThemeStore()
    const { getEditorRouteOpts } = useFileActions()
    const parentFolderRoute = router.resolve(props.parentFolderLink)

    const availableFileTypes = (props.app as ApplicationInformation).extensions.map((e) =>
      e.extension ? e.extension : e.mimeType
    )

    const iframeTitle = themeStore.currentTheme.common?.name
    const iframeUrl = new URL(parentFolderRoute.href, window.location.origin)
    iframeUrl.searchParams.append('embed', 'true')
    iframeUrl.searchParams.append('embed-target', 'file')
    iframeUrl.searchParams.append('embed-file-types', availableFileTypes.join(','))

    const onLoad = () => {
      isLoading.value = false
      console.log(iframeRef)
      unref(iframeRef).contentWindow.focus()
    }

    const onFilePick = ({ data }: MessageEvent) => {
      if (data.name !== 'owncloud-embed:file-pick') {
        return
      }

      const resource: Resource = data.data
      const space = getMatchingSpace(resource)
      const remoteItemId = isShareSpaceResource(space) ? space.id : undefined

      const routeOpts = getEditorRouteOpts(
        unref(router.currentRoute).name,
        space,
        resource,
        EDITOR_MODE_EDIT,
        remoteItemId
      )
      const editorRoute = router.resolve(routeOpts)
      const editorRouteUrl = new URL(editorRoute.href, window.location.origin)

      removeModal(props.modal.id)
      window.open(editorRouteUrl.href, '_blank')
    }

    const onCancel = ({ data }: MessageEvent) => {
      if (data.name !== 'owncloud-embed:cancel') {
        return
      }

      removeModal(props.modal.id)
    }

    onMounted(() => {
      window.addEventListener('message', onFilePick)
      window.addEventListener('message', onCancel)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('message', onFilePick)
      window.removeEventListener('message', onCancel)
    })

    return {
      isLoading,
      onLoad,
      iframeTitle,
      iframeSrc: iframeUrl.href,
      iframeRef,
      onFilePick
    }
  }
})
</script>

<style lang="scss">
.open-with-app-modal {
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
