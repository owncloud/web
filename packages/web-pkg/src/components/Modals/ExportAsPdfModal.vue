<template>
  <div class="oc-height-1-1" tabindex="0">
    <app-loading-spinner v-if="isLoading" />
    <iframe
      v-show="!isLoading"
      ref="iframeRef"
      class="oc-width-1-1 oc-height-1-1"
      :title="iframeTitle"
      :src="iframeUrl.href"
      tabindex="0"
      @load="onLoad"
    />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  EDITOR_MODE_EDIT,
  embedModeLocationPickMessageData,
  Modal,
  useAppsStore,
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
import { Resource, SpaceResource, urlJoin } from '@ownclouders/web-client'
import { unref } from 'vue'
import { resolveFileNameDuplicate } from '../../helpers'
import { useGettext } from 'vue3-gettext'
import { DavProperty } from '@ownclouders/web-client/webdav'
import { useExportAsPdfWorker } from '../../composables/webWorkers/exportAsPdfWorker'

const { modal, parentFolderLink, originalResource, content } = defineProps<{
  modal: Modal
  parentFolderLink: RouteLocationRaw
  originalResource: Resource
  content: string
}>()

const themeStore = useThemeStore()
const { $pgettext } = useGettext()
const router = useRouter()
const clientService = useClientService()
const { removeModal } = useModals()
const { showMessage, showErrorMessage } = useMessages()
const { getMatchingSpace } = useGetMatchingSpace()
const { openEditor } = useFileActions()
const appsStore = useAppsStore()
const { startWorker } = useExportAsPdfWorker()

const parentFolderRoute = router.resolve(parentFolderLink)
const iframeTitle = themeStore.currentTheme.common?.name
const iframeUrl = new URL(parentFolderRoute.href, window.location.origin)
iframeUrl.searchParams.append('hide-logo', 'true')
iframeUrl.searchParams.append('embed', 'true')
iframeUrl.searchParams.append('embed-target', 'location')
iframeUrl.searchParams.append('embed-choose-file-name', 'true')
iframeUrl.searchParams.append('embed-delegate-authentication', 'false')
iframeUrl.searchParams.append(
  'embed-choose-file-name-suggestion',
  originalResource.name.replace('.md', '.pdf')
)

const iframeRef = ref<HTMLIFrameElement>()
const isLoading = ref(true)
const previewEl = ref<HTMLDivElement>()

const onLoad = () => {
  isLoading.value = false
  unref(iframeRef).contentWindow.focus()
}

const onLocationPick = async ({ data }: MessageEvent) => {
  if (data.name !== 'owncloud-embed:select') {
    return
  }

  if (Array.isArray(data.data)) {
    // The location pick is somehow triggered twice as soon as we list the destination folder in `saveFile` method.
    // It uses an array as payload instead of an object. That is why we can use that to ignore the second message.
    return
  }

  const { resources, fileName, locationQuery }: embedModeLocationPickMessageData = data.data

  const destinationFolder: Resource = resources[0]
  const space = getMatchingSpace(destinationFolder)

  startWorker(destinationFolder, space, fileName, content, (result) => {
    console.log(result)
  })
  removeModal(modal.id)

  // try {
  //   const resource = await saveFile({ destinationFolder, fileName, space })
  //   showMessage({
  //     title: $pgettext(
  //       'Success toast message title shown to a user when a file is exported as PDF via the export as PDF modal.',
  //       '"%{fileName}" was exported successfully',
  //       { fileName: resource.name }
  //     )
  //   })
  //   openFile({ resource, space, locationQuery })
  // } catch (e) {
  //   console.error(e)
  //   showErrorMessage({
  //     title: $pgettext(
  //       'Error toast message title shown to a user when exporting a file as PDF via the export as PDF modal failed.',
  //       'Unable to export "%{fileName}"',
  //       { fileName }
  //     ),
  //     errors: [e]
  //   })
  //   console.error(e)
  // }
}

// const saveFile = async ({
//   destinationFolder,
//   fileName,
//   space
// }: {
//   destinationFolder: Resource
//   fileName: string
//   space: SpaceResource
// }) => {
//   console.log('saveFile', fileName)
//   const { children: existingResources } = await clientService.webdav.listFiles(
//     space,
//     {
//       fileId: destinationFolder.fileId
//     },
//     { davProperties: [DavProperty.Name] }
//   )

//   const resourceAlreadyExists = existingResources.find(
//     (existingResource) => existingResource.name === fileName
//   )

//   if (resourceAlreadyExists) {
//     fileName = resolveFileNameDuplicate(fileName, 'pdf', existingResources)
//   }

//   const A4_WIDTH = 793.7066666667
//   const A4_HEIGHT = 1122.52

//   const output = await html3pdf()
//     .set({
//       margin: 10,
//       html2canvas: {
//         scale: 3,
//         useCORS: true,
//         letterRendering: true,
//         width: A4_WIDTH,
//         windowWidth: A4_WIDTH,
//         height: A4_HEIGHT,
//         windowHeight: A4_HEIGHT
//       },
//       pagesPerCanvas: navigator.userAgent.includes('Chrome') ? 19 : 9,
//       pagebreak: { mode: 'avoid-all' },
//       jsPDF: { format: 'a4', orientation: 'portrait' }
//     })
//     .from(unref(previewEl).children[0])
//     .output('arraybuffer')

//   return clientService.webdav.putFileContents(space, {
//     fileName,
//     parentFolderId: destinationFolder.id,
//     content: output,
//     path: urlJoin(destinationFolder.path, fileName)
//   })
// }

// const openFile = ({
//   locationQuery,
//   resource,
//   space
// }: {
//   locationQuery: LocationQuery
//   resource: Resource
//   space: SpaceResource
// }) => {
//   const [pdfApp] = appsStore.fileExtensions.filter(({ extension }) => extension === 'pdf')
//   openEditor(pdfApp, space, resource, EDITOR_MODE_EDIT, locationQuery, true)
// }

const onCancel = ({ data }: MessageEvent) => {
  if (data.name !== 'owncloud-embed:cancel') {
    return
  }

  removeModal(modal.id)
}

onMounted(() => {
  window.addEventListener('message', onLocationPick)
  window.addEventListener('message', onCancel)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onLocationPick)
  window.removeEventListener('message', onCancel)
})
</script>

<style lang="scss">
.oc-modal.export-as-pdf-modal {
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

  .export-pdf-preview {
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    p {
      color: var(--oc-color-text-default);
    }

    .md-editor-preview {
      hyphens: auto;
      overflow-wrap: break-word;
      word-break: normal;
      word-break: auto-phrase;
    }
  }
}
</style>
