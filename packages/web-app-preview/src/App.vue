<template>
  <main
    id="preview"
    ref="preview"
    tabindex="-1"
    @keydown.left="prev"
    @keydown.right="next"
    @keydown.esc="closePreview"
  >
    <div class="preview-body">
      <media-settings
        v-if="activeMediaFileCached.isImage"
        @download="triggerActiveFileDownload"
        @save-cropped-image="save"
      />
      <div v-if="isFolderLoading || isFileContentLoading" class="oc-position-center">
        <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
      </div>
      <oc-icon
        v-else-if="isFileContentError"
        name="file-damage"
        variation="danger"
        size="xlarge"
        class="oc-position-center"
        :accessible-label="$gettext('Failed to load media file')"
      />
      <template v-else>
        <div
          v-show="activeMediaFileCached"
          class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium preview-player"
          :class="{ lightbox: isFullScreenModeActivated }"
        >
          <media-image
            v-if="activeMediaFileCached.isImage"
            :file="activeMediaFileCached"
            :current-image-rotation="currentImageRotation"
            :current-image-zoom="currentImageZoom"
          />
          <media-video
            v-else-if="activeMediaFileCached.isVideo"
            :file="activeMediaFileCached"
            :is-auto-play-enabled="isAutoPlayEnabled"
          />
          <media-audio
            v-else-if="activeMediaFileCached.isAudio"
            :file="activeMediaFileCached"
            :is-auto-play-enabled="isAutoPlayEnabled"
          />
        </div>
      </template>
      <quick-commands
        :current-image-zoom="currentImageZoom"
        :is-full-screen-mode-activated="isFullScreenModeActivated"
        :save-task="saveImageTask"
        @close="closePreview"
        @set-zoom="currentImageZoom = $event"
        @toggle-full-screen="toggleFullscreenMode"
      />
    </div>
  </main>
</template>
<script lang="ts">
import { computed, defineComponent, ref, unref, watch } from 'vue'
import {
  queryItemAsString,
  sortHelper,
  useAppDefaults,
  useRoute,
  useRouteQuery,
  useRouter,
  useStore
} from 'web-pkg/src/composables'
import { Action, ActionOptions } from 'web-pkg/src/composables/actions/types'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { useDownloadFile } from 'web-pkg/src/composables/download/useDownloadFile'
import { RouteLocationRaw } from 'vue-router'
import { Resource } from 'web-client/src'
import { useTask } from 'vue-concurrency'
import MediaAudio from './components/Sources/MediaAudio.vue'
import MediaImage from './components/Sources/MediaImage.vue'
import MediaVideo from './components/Sources/MediaVideo.vue'
import MediaSettings from './components/MediaSettings.vue'
import QuickCommands from './components/QuickCommands.vue'
import { CachedFile, adjustmentParametersCategoryType } from './helpers/types'
import applyAdjustmentParams from './composables/save/applyAdjustmentParams'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { Ref } from 'vue'
import { isProjectSpaceResource } from 'web-client/src/helpers'
import { DavProperty } from 'web-client/src/webdav/constants'
import { CropVariantEnum, ProcessingToolsEnum } from './helpers'
import applyCropping from './composables/save/applyCropping'

export const appId = 'preview'

export const mimeTypes = () => {
  return [
    'audio/flac',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/x-flac',
    'audio/x-wav',
    'image/gif',
    'image/jpeg',
    'image/png',
    'video/mp4',
    'video/webm',
    ...((window as any).__$store?.getters.extensionConfigByAppId(appId).mimeTypes || [])
  ]
}

export default defineComponent({
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Preview',
  components: {
    MediaAudio,
    MediaImage,
    MediaVideo,
    MediaSettings,
    QuickCommands
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()

    const processingTool = computed(() => store.getters['Preview/getSelectedProcessingTool'])
    const space = computed(() => store.getters['realtime/spaces/spaces'])

    const appDefaults = useAppDefaults({ applicationId: 'preview' })
    const contextRouteQuery = useRouteQuery('contextRouteQuery')
    const { downloadFile } = useDownloadFile()

    const activeIndex = ref()
    const cachedFiles = ref<CachedFile[]>([])
    const isFileContentError = ref(false)
    const isFileContentLoading = ref(true)

    const currentETag = ref()
    const activeAdjustmentParameters: Ref<adjustmentParametersCategoryType[]> = ref()
    const serverVersion = ref()
    const resource: Ref<Resource> = ref()

    const {
      activeFiles,
      currentFileContext,
      replaceInvalidFileRoute,
      getFileContents,
      putFileContents,
      getFileInfo
    } = appDefaults

    const { $gettext, interpolate: $gettextInterpolate } = useGettext()

    const filteredFiles = computed<Resource[]>(() => {
      if (!unref(activeFiles)) {
        return []
      }

      const files = unref(activeFiles).filter((file) => {
        return mimeTypes().includes(file.mimeType?.toLowerCase())
      })
      return sortHelper(files, [{ name: unref(sortBy) }], unref(sortBy), unref(sortDir))
    })

    const activeFilteredFile = computed(() => {
      return unref(filteredFiles)[unref(activeIndex)]
    })

    const activeMediaFileCached = computed(() => {
      return unref(cachedFiles).find((i) => i.id === unref(activeFilteredFile).id)
    })

    const errorPopup = (error) => {
      store.dispatch('showMessage', {
        title: $gettext('An error occurred'),
        desc: error,
        status: 'danger'
      })
    }

    const imageSavedPopup = () => {
      store.dispatch('showMessage', {
        title: $gettext('Image is saved')
      })
    }

    const getUpdatedBlob = async () => {
      let newVersion = null
      switch (processingTool.value) {
        case ProcessingToolsEnum.Customize:
          const adjustmentParams = store.getters['Preview/allParameters']
          newVersion = await applyAdjustmentParams({
            imageBlob: serverVersion,
            adjustmentParams: adjustmentParams
          })
          activeAdjustmentParameters.value = adjustmentParams
          break
        case ProcessingToolsEnum.Crop:
          const croppedCanvas = store.getters['Preview/getCroppedCanvas']
          const cropType: CropVariantEnum = store.getters['Preview/getCropVariant']
          newVersion = await applyCropping(croppedCanvas, cropType)
          break
      }
      return newVersion
    }

    function handleResetAfterSave() {
      switch (processingTool.value) {
        case ProcessingToolsEnum.Crop:
          store.commit('Preview/RESET_SELECTED_PROCESSING_TOOL')
      }
    }

    const loadImageTask = useTask(function* () {
      resource.value = yield getFileInfo(currentFileContext, {
        davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
      })
      replaceInvalidFileRoute(currentFileContext, unref(resource))

      const savedImageVersion = yield getFileContents(currentFileContext, { responseType: 'blob' })
      serverVersion.value = savedImageVersion.body
      currentETag.value = savedImageVersion.headers['OC-ETag']
    })

    const saveImageTask = useTask(function* () {
      const newVersion = yield getUpdatedBlob()

      try {
        const putFileContentsResponse = yield putFileContents(currentFileContext, {
          content: newVersion,
          previousEntityTag: unref(currentETag)
        })
        serverVersion.value = newVersion
        currentETag.value = putFileContentsResponse.etag
        imageSavedPopup()
        handleResetAfterSave()
      } catch (e) {
        switch (e.statusCode) {
          case 412:
            errorPopup(
              $gettext(
                'This file was updated outside this window. Please refresh the page (all changes will be lost).'
              )
            )
            break
          case 500:
            errorPopup($gettext('Error when contacting the server'))
            break
          case 507:
            const space = store.getters['runtime/spaces/spaces'].find(
              (space) => space.id === unref(resource).storageId && isProjectSpaceResource(space)
            )
            if (space) {
              errorPopup(
                $gettextInterpolate(
                  $gettext('There is not enough quota on "%{spaceName}" to save this file'),
                  { spaceName: space.name }
                )
              )
              break
            }
            errorPopup($gettext('There is not enough quota to save this file'))
            break
          case 401:
            errorPopup($gettext("You're not authorized to save this file"))
            break
          default:
            errorPopup(e.message || e)
        }
      }
    }).restartable()

    async function save() {
      await saveImageTask.perform()
    }

    watch(
      activeMediaFileCached,
      () => {
        if (activeMediaFileCached.value.isImage) {
          loadImageTask.perform()
          store.commit('Preview/RESET_ADJUSTMENT_PARAMETERS')
          store.commit('Preview/RESET_SELECTED_PROCESSING_TOOL')
          const storeValues = store.getters['Preview/allParameters']
          activeAdjustmentParameters.value = storeValues
        }
      },
      { immediate: true }
    )

    const sortBy = computed(() => {
      if (!unref(contextRouteQuery)) {
        return 'name'
      }
      return unref(contextRouteQuery)['sort-by'] ?? 'name'
    })
    const sortDir = computed(() => {
      if (!unref(contextRouteQuery)) {
        return 'desc'
      }
      return unref(contextRouteQuery)['sort-dir'] ?? 'asc'
    })

    const isFullScreenModeActivated = ref(false)
    const toggleFullscreenMode = () => {
      const activateFullscreen = !unref(isFullScreenModeActivated)
      isFullScreenModeActivated.value = activateFullscreen
      if (activateFullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }

    const updateLocalHistory = () => {
      const { params, query } = createFileRouteOptions(
        unref(unref(currentFileContext).space),
        unref(activeFilteredFile)
      )
      router.replace({
        ...unref(route),
        params: { ...unref(route).params, ...params },
        query: { ...unref(route).query, ...query }
      })
    }

    function triggerUnsavedChangesModal(
      cancelFuncs: Array<(...args: any[]) => Promise<any>>,
      confirmFuncs: Array<(...args: any[]) => Promise<any>>
    ) {
      const modal = {
        variation: 'danger',
        icon: 'warning',
        title: $gettext('Unsaved changes'),
        message: $gettext('Your changes were not saved. Do you want to save them?'),
        cancelText: $gettext("Don't Save"),
        confirmText: $gettext('Save'),
        onCancel: () => {
          store.dispatch('hideModal')
          cancelFuncs.forEach(async (func) => await func())
        },
        onConfirm: () => {
          store.dispatch('hideModal')
          confirmFuncs.forEach(async (func) => await func())
        }
      }
      store.dispatch('createModal', modal)
    }

    const triggerActiveFileDownload = () => {
      if (isFileContentLoading.value) {
        return
      }

      const adjustmentParams = computed(() => store.getters['Preview/allParameters'])
      if (adjustmentParams.value !== activeAdjustmentParameters.value) {
        const confirmFuncs: Array<(...args: any[]) => Promise<any>> = [
          () => save(),
          () => downloadFile(activeFilteredFile.value)
        ]

        triggerUnsavedChangesModal([], confirmFuncs)
      } else {
        downloadFile(activeFilteredFile.value)
      }
    }

    const fileActions: Action<ActionOptions>[] = [
      {
        name: 'download-file',
        isEnabled: () => true,
        componentType: 'button',
        icon: 'file-download',
        id: 'preview-download',
        label: () => 'Download',
        handler: () => {
          triggerActiveFileDownload()
        }
      }
    ]

    function isFileTypeImage(file) {
      return !isFileTypeAudio(file) && !isFileTypeVideo(file)
    }
    function isFileTypeAudio(file) {
      return file.mimeType.toLowerCase().startsWith('audio')
    }
    function isFileTypeVideo(file) {
      return file.mimeType.toLowerCase().startsWith('video')
    }

    function isActiveFileTypeImage() {
      return !isActiveFileTypeAudio && !isActiveFileTypeVideo
    }
    function isActiveFileTypeAudio() {
      return isFileTypeAudio(activeFilteredFile)
    }
    function isActiveFileTypeVideo() {
      return isFileTypeVideo(activeFilteredFile)
    }

    // #setup
    return {
      ...appDefaults,
      activeFilteredFile,
      activeIndex,
      activeMediaFileCached,
      cachedFiles,
      filteredFiles,
      fileActions,
      isFileContentLoading,
      isFileContentError,
      isFullScreenModeActivated,
      toggleFullscreenMode,
      updateLocalHistory,
      triggerActiveFileDownload,
      triggerUnsavedChangesModal,
      saveImageTask,
      serverVersion,
      activeAdjustmentParameters,
      save,
      isFileTypeAudio,
      isFileTypeImage,
      isFileTypeVideo,
      isActiveFileTypeAudio,
      isActiveFileTypeImage,
      isActiveFileTypeVideo
    }
  },
  data() {
    return {
      isAutoPlayEnabled: true,

      toPreloadImageIds: [],

      currentImageZoom: 1,
      currentImageRotation: 0,

      preloadImageCount: 10
    }
  },

  computed: {
    pageTitle() {
      return this.$gettext('Preview for %{currentMediumName}', {
        currentMediumName: this.activeFilteredFile?.name
      })
    },
    thumbDimensions() {
      switch (true) {
        case window.innerWidth <= 1024:
          return 1024
        case window.innerWidth <= 1280:
          return 1280
        case window.innerWidth <= 1920:
          return 1920
        case window.innerWidth <= 2160:
          return 2160
        default:
          return 3840
      }
    },
    ...mapGetters('Preview', ['allParameters'])
  },

  watch: {
    activeIndex(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.loadMedium()
        this.preloadImages()
      }

      if (oldValue !== null) {
        this.isAutoPlayEnabled = false
      }

      this.currentImageZoom = 1
      this.currentImageRotation = 0
    }
  },

  async mounted() {
    // keep a local history for this component
    window.addEventListener('popstate', this.handleLocalHistoryEvent)
    document.addEventListener('fullscreenchange', this.handleFullScreenChangeEvent)
    await this.loadFolderForFileContext(this.currentFileContext)
    this.setActiveFile(unref(this.currentFileContext.driveAliasAndItem))
    ;(this.$refs.preview as HTMLElement).focus()
  },

  beforeUnmount() {
    window.removeEventListener('popstate', this.handleLocalHistoryEvent)
    document.removeEventListener('fullscreenchange', this.handleFullScreenChangeEvent)

    this.cachedFiles.forEach((medium) => {
      this.revokeUrl(medium.url)
    })
  },

  methods: {
    setActiveFile(driveAliasAndItem: string) {
      for (let i = 0; i < this.filteredFiles.length; i++) {
        if (
          unref(this.currentFileContext.space)?.getDriveAliasAndItem(this.filteredFiles[i]) ===
          driveAliasAndItem
        ) {
          this.activeIndex = i
          return
        }
      }

      this.isFileContentLoading = false
      this.isFileContentError = true
    },
    // react to PopStateEvent ()
    handleLocalHistoryEvent() {
      const result = this.$router.resolve(document.location as unknown as RouteLocationRaw)
      this.setActiveFile(queryItemAsString(result.params.driveAliasAndItem))
    },
    handleFullScreenChangeEvent() {
      if (document.fullscreenElement === null) {
        this.isFullScreenModeActivated = false
      }
    },
    loadMedium() {
      this.isFileContentLoading = true

      // Don't bother loading if file is already loaded and cached
      if (this.activeMediaFileCached) {
        setTimeout(
          () => {
            this.isFileContentLoading = false
          },
          // Delay to animate
          50
        )
        return
      }

      this.loadActiveFileIntoCache()
    },
    async loadActiveFileIntoCache() {
      try {
        const loadRawFile = !this.isActiveFileTypeImage
        let mediaUrl
        if (loadRawFile) {
          mediaUrl = await this.getUrlForResource(
            unref(this.currentFileContext.space),
            this.activeFilteredFile
          )
        } else {
          mediaUrl = await this.loadPreview(this.activeFilteredFile)
        }

        this.addPreviewToCache(this.activeFilteredFile, mediaUrl)
        this.isFileContentLoading = false
        this.isFileContentError = false
      } catch (e) {
        this.isFileContentLoading = false
        this.isFileContentError = true
        console.error(e)
      }
    },
    next() {
      if (this.isFileContentLoading) {
        return
      }
      this.isFileContentError = false
      if (this.activeIndex + 1 >= this.filteredFiles.length) {
        this.activeIndex = 0
        this.updateLocalHistory()
        return
      }
      if (this.checkIfDirty()) {
        const modal = {
          variation: 'danger',
          icon: 'warning',
          title: this.$gettext('Unsaved changes'),
          message: this.$gettext('Your changes were not saved. Do you want to save them?'),
          cancelText: this.$gettext("Don't Save"),
          confirmText: this.$gettext('Save'),
          onCancel: () => {
            this.hideModal()
            this.activeIndex++
            this.updateLocalHistory()
          },
          onConfirm: async () => {
            await this.save()
            this.hideModal()
            this.activeIndex++
            this.updateLocalHistory()
          }
        }
        this.createModal(modal)
      } else {
        this.activeIndex++
        this.updateLocalHistory()
      }
    },
    prev() {
      if (this.isFileContentLoading) {
        return
      }
      this.isFileContentError = false
      if (this.activeIndex === 0) {
        this.activeIndex = this.filteredFiles.length - 1
        this.updateLocalHistory()
        return
      }
      if (this.checkIfDirty()) {
        const modal = {
          variation: 'danger',
          icon: 'warning',
          title: this.$gettext('Unsaved changes'),
          message: this.$gettext('Your changes were not saved. Do you want to save them?'),
          cancelText: this.$gettext("Don't Save"),
          confirmText: this.$gettext('Save'),
          onCancel: () => {
            this.hideModal()
            this.activeIndex--
            this.updateLocalHistory()
          },
          onConfirm: async () => {
            await this.save()
            this.hideModal()
            this.activeIndex--
            this.updateLocalHistory()
          }
        }
        this.createModal(modal)
      } else {
        this.activeIndex--
        this.updateLocalHistory()
      }
    },

    closePreview() {
      if (this.checkIfDirty()) {
        const modal = {
          variation: 'danger',
          icon: 'warning',
          title: this.$gettext('Unsaved changes'),
          message: this.$gettext('Your changes were not saved. Do you want to save them?'),
          cancelText: this.$gettext("Don't Save"),
          confirmText: this.$gettext('Save'),
          onCancel: () => {
            this.hideModal()
            this.handleResetValues()
            this.closeApp()
          },
          onConfirm: async () => {
            await this.save()
            this.hideModal()
            this.handleResetValues()
            this.closeApp()
          }
        }
        this.createModal(modal)
      } else {
        this.handleResetValues()
        this.closeApp()
      }
    },

    checkIfDirty() {
      return this.allParameters !== this.activeAdjustmentParameters
    },
    addPreviewToCache(file, url) {
      this.cachedFiles.push({
        id: file.id,
        name: file.name,
        url,
        ext: file.extension,
        mimeType: file.mimeType,
        isVideo: this.isFileTypeVideo(file),
        isImage: this.isFileTypeImage(file),
        isAudio: this.isFileTypeAudio(file)
      })
    },
    loadPreview(file) {
      return this.$previewService.loadPreview({
        space: unref(this.currentFileContext.space),
        resource: file,
        dimensions: [this.thumbDimensions, this.thumbDimensions] as [number, number]
      })
    },
    preloadImages() {
      const loadPreviewAsync = (file) => {
        this.toPreloadImageIds.push(file.id)
        this.loadPreview(file)

          .then((mediaUrl) => {
            this.addPreviewToCache(file, mediaUrl)
          })
          .catch((e) => {
            console.error(e)
            this.toPreloadImageIds = this.toPreloadImageIds.filter((fileId) => fileId !== file.id)
          })
      }

      const preloadFile = (preloadFileIndex) => {
        let cycleIndex =
          (((this.activeIndex + preloadFileIndex) % this.filteredFiles.length) +
            this.filteredFiles.length) %
          this.filteredFiles.length

        const file = this.filteredFiles[cycleIndex]

        if (!this.isFileTypeImage(file) || this.toPreloadImageIds.includes(file.id)) {
          return
        }

        loadPreviewAsync(file)
      }

      for (
        let followingFileIndex = 1;
        followingFileIndex <= this.preloadImageCount;
        followingFileIndex++
      ) {
        preloadFile(followingFileIndex)
      }

      for (
        let previousFileIndex = -1;
        previousFileIndex >= this.preloadImageCount * -1;
        previousFileIndex--
      ) {
        preloadFile(previousFileIndex)
      }
    },

    ...mapMutations('Preview', ['RESET_ADJUSTMENT_PARAMETERS', 'RESET_SELECTED_PROCESSING_TOOL']),
    ...mapActions(['createModal', 'hideModal']),
    handleResetValues() {
      this.RESET_ADJUSTMENT_PARAMETERS()
      this.RESET_SELECTED_PROCESSING_TOOL()
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-player {
  overflow: auto;
  max-width: 90vw;
  height: 70vh;
  object-fit: contain;
  margin: $oc-space-medium;

  img,
  video {
    max-width: 85vw;
    max-height: 65vh;
  }
}
.preview-player.lightbox {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 999;
  margin: 0;
  background: rgba(38, 38, 38, 0.8);
  width: 100%;
  height: 100%;
  max-width: 100%;
}

.preview-player.lightbox > * {
  max-width: 100vw;
  max-height: 100vh;
}

.preview-details.lightbox {
  z-index: 1000;
  opacity: 0.9;
}

@media (max-width: 959px) {
  .preview-player {
    max-width: 100vw;
  }
}

.preview-body {
  display: flex;
}
</style>
./composables/save/applyAdjustmentParams
