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
  EDITOR_MODE_EDIT,
  embedModeLocationPickMessageData,
  Modal,
  useClientService,
  useFileActions,
  useGetMatchingSpace,
  useMessages,
  useModals,
  useRouter,
  useThemeStore
} from '../../composables'
import { LocationQuery, RouteLocationRaw } from 'vue-router'
import AppLoadingSpinner from '../AppLoadingSpinner.vue'
import { isShareSpaceResource, Resource, SpaceResource, urlJoin } from '@ownclouders/web-client'
import { unref } from 'vue'
import { resolveFileNameDuplicate } from '../../helpers'
import { useGettext } from 'vue3-gettext'
import { DavProperty } from '@ownclouders/web-client/webdav'

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
    const clientService = useClientService()
    const { removeModal } = useModals()
    const { showMessage, showErrorMessage } = useMessages()
    const { getMatchingSpace } = useGetMatchingSpace()
    const { getEditorRouteOpts } = useFileActions()

    const parentFolderRoute = router.resolve(props.parentFolderLink)
    const iframeTitle = themeStore.currentTheme.common?.name
    const iframeUrl = new URL(parentFolderRoute.href, window.location.origin)
    iframeUrl.searchParams.append('hide-logo', 'true')
    iframeUrl.searchParams.append('embed', 'true')
    iframeUrl.searchParams.append('embed-target', 'location')
    iframeUrl.searchParams.append('embed-choose-file-name', 'true')
    iframeUrl.searchParams.append('embed-delegate-authentication', 'false')
    iframeUrl.searchParams.append('embed-choose-file-name-suggestion', props.originalResource.name)

    const onLoad = () => {
      isLoading.value = false
      unref(iframeRef).contentWindow.focus()
    }

    const onLocationPick = async ({ data }: MessageEvent) => {
      if (data.name !== 'owncloud-embed:select') {
        return
      }

      const { resources, fileName, locationQuery }: embedModeLocationPickMessageData = data.data

      const destinationFolder: Resource = resources[0]
      const space = getMatchingSpace(destinationFolder)

      try {
        const resource = await saveFile({ destinationFolder, fileName, space })
        showMessage({
          title: $gettext('"%{fileName}" was saved successfully', { fileName: resource.name })
        })
        openFile({ resource, space, locationQuery })
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

    const saveFile = async ({
      destinationFolder,
      fileName,
      space
    }: {
      destinationFolder: Resource
      fileName: string
      space: SpaceResource
    }) => {
      const { children: existingResources } = await clientService.webdav.listFiles(
        space,
        {
          fileId: destinationFolder.fileId
        },
        { davProperties: [DavProperty.Name] }
      )
      const resourceAlreadyExists = existingResources.find(
        (existingResource) => existingResource.name === fileName
      )
      if (resourceAlreadyExists) {
        fileName = resolveFileNameDuplicate(
          fileName,
          props.originalResource.extension,
          existingResources
        )
      }

      return clientService.webdav.putFileContents(space, {
        fileName,
        parentFolderId: destinationFolder.id,
        content: props.content,
        path: urlJoin(destinationFolder.path, fileName)
      })
    }

    const openFile = ({
      locationQuery,
      resource,
      space
    }: {
      locationQuery: LocationQuery
      resource: Resource
      space: SpaceResource
    }) => {
      const remoteItemId = isShareSpaceResource(space) ? space.id : undefined
      const routeOpts = getEditorRouteOpts(
        unref(router.currentRoute).name,
        space,
        resource,
        EDITOR_MODE_EDIT,
        remoteItemId
      )
      routeOpts.query = { ...routeOpts.query, ...locationQuery }

      const editorRoute = router.resolve(routeOpts)
      const editorRouteUrl = new URL(editorRoute.href, window.location.origin)
      window.open(editorRouteUrl.href, '_blank')
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
