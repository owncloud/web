<template>
  <main
    id="preview"
    ref="preview"
    tabindex="-1"
    @keydown.left="handleSetActiveMediaFile(activeIndex - 1)"
    @keydown.right="handleSetActiveMediaFile(activeIndex + 1)"
    @keydown.esc="closePreview"
  >
    <div class="preview-body">
      <media-settings
        v-if="activeMediaFileCached.isImage"
        @download="triggerActiveFileDownload"
        @save-cropped-image="save"
      />
      <div class="image-container">
        <div
          v-if="isFolderLoading || isFileContentLoading"
          class="oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium preview-player"
        >
          <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
        </div>
        <div v-else-if="isFileContentError" class="preview-player">
          <oc-icon
            name="file-damage"
            variation="danger"
            size="xlarge"
            class="oc-position-center"
            :accessible-label="$gettext('Failed to load media file')"
          />
        </div>
        <div
          v-else
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
        <div class="image-gallery">
          <media-gallery
            :media-files="mediaGalleryFiles"
            :active-index="activeIndex"
            :zoom-level="currentImageZoom"
            @update-active-media-file="handleSetActiveMediaFile"
            @handle-go-next="handleSetActiveMediaFile(activeIndex + 1)"
            @handle-go-prev="handleSetActiveMediaFile(activeIndex - 1)"
            @change-active-zoom-level="currentImageZoom = $event"
          />
        </div>
      </div>
      <quick-commands
        :current-image-zoom="currentImageZoom"
        :is-image="activeMediaFileCached.isImage"
        :is-saveable="isSaveable"
        @close="closePreview"
        @set-zoom="currentImageZoom = $event"
        @toggle-full-screen="toggleFullscreenMode"
        @save="save"
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
  usePreviewService,
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
import { CachedFile, MediaGalleryFile, AdjustmentParametersCategoryType } from './helpers/types'
import applyAdjustmentParams from './composables/saveFunctions/applyAdjustmentParams'
import {
  useSaveUnsavedChangesModal,
  useCancelUnsavedChangesModal
} from './composables/saveFunctions/useUnsavedChangesModal'
import { mapActions, mapGetters } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { Ref } from 'vue'
import { isProjectSpaceResource } from 'web-client/src/helpers'
import { DavProperty } from 'web-client/src/webdav/constants'
import { CropVariantEnum, ProcessingToolsEnum } from './helpers'
import applyCropping from './composables/saveFunctions/applyCropping'
import MediaGallery from './components/MediaGallery.vue'
import { onMounted } from 'vue'

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
    QuickCommands,
    MediaGallery
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    const { downloadFile } = useDownloadFile()
    const previewService = usePreviewService()
    const contextRouteQuery = computed(() => useRouteQuery('contextRouteQuery'))
    const appDefaults = useAppDefaults({ applicationId: 'preview' })

    const processingTool = computed(() => store.getters['Preview/getSelectedProcessingTool'])
    const activeAdjustmentParameters = computed(() => store.getters['Preview/allParameters'])

    const currentETag = ref()
    const serverVersion = ref()
    const resource: Ref<Resource> = ref()

    const activeIndex = ref()
    const cachedFiles = ref<CachedFile[]>([])
    const isFileContentError = ref(false)
    const isFileContentLoading = ref(true)
    const appliedAdjustmentParameters = ref<AdjustmentParametersCategoryType[]>()

    const {
      activeFiles,
      currentFileContext,
      getFileContents,
      putFileContents,
      getFileInfo,
      closeApp,
      getUrlForResource
    } = appDefaults

    const { $gettext, interpolate: $gettextInterpolate } = useGettext()

    const isSaveable = computed(
      () => unref(appliedAdjustmentParameters) !== unref(activeAdjustmentParameters)
    )

    const thumbDimensions = computed(() => {
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

    const filteredFiles = computed<Resource[]>(() => {
      if (!unref(activeFiles)) {
        return []
      }

      const files = unref(activeFiles).filter((file) => {
        return mimeTypes().includes(file.mimeType?.toLowerCase())
      })
      return sortHelper(files, [{ name: unref(sortBy) }], unref(sortBy), unref(sortDir))
    })

    const mediaGalleryFiles: Ref<MediaGalleryFile[]> = ref([])

    watch(filteredFiles, async (oldFiles, newFiles) => {
      if (oldFiles !== newFiles) {
        mediaGalleryFiles.value = await Promise.all(
          unref(filteredFiles).map(async (file) => {
            const fileUrl = await getMediaFileUrl(file)
            return {
              name: file.name,
              id: file.id,
              url: fileUrl,
              mimeType: file.mimeType
            }
          })
        )
      }
    })

    async function getMediaFileUrl(file: Resource) {
      try {
        const loadRawFile = isFileTypeImage(file)
        let mediaUrl: string
        if (loadRawFile) {
          mediaUrl = await getUrlForResource(unref(unref(currentFileContext).space), file)
        } else {
          mediaUrl = await loadPreview(file)
        }
        return mediaUrl
      } catch (e) {
        console.error(e)
      }
    }

    const activeFilteredFile = computed(() => {
      return unref(filteredFiles)[unref(activeIndex)]
    })

    const activeMediaFileCached = computed(() => {
      return unref(cachedFiles).find((i) => i.id === unref(activeFilteredFile).id)
    })

    const getUpdatedBlob = async () => {
      let newVersion = null
      switch (processingTool.value) {
        case ProcessingToolsEnum.Customize:
          newVersion = await applyAdjustmentParams({
            imageBlob: serverVersion,
            adjustmentParams: unref(activeAdjustmentParameters)
          })
          appliedAdjustmentParameters.value = unref(activeAdjustmentParameters)
          break
        case ProcessingToolsEnum.Crop:
          const croppedCanvas = store.getters['Preview/getCroppedCanvas']
          const cropType: CropVariantEnum = store.getters['Preview/getCropVariant']
          const croppedVersion = await applyCropping(croppedCanvas, cropType)
          newVersion = await applyAdjustmentParams({
            imageBlob: croppedVersion,
            adjustmentParams: unref(activeAdjustmentParameters)
          })
          break
      }
      return newVersion
    }

    function handleResetAfterSave() {
      switch (processingTool.value) {
        case ProcessingToolsEnum.Crop:
          store.commit('Preview/RESET_SELECTED_PROCESSING_TOOL')
          break
        case ProcessingToolsEnum.Customize:
          store.commit('Preview/RESET_SELECTED_PROCESSING_TOOL')
          store.commit('Preview/RESET_ADJUSTMENT_PARAMETERS')
          appliedAdjustmentParameters.value = unref(activeAdjustmentParameters)
          break
      }
    }

    const loadImageTask = useTask(function* () {
      resource.value = yield getFileInfo(currentFileContext, {
        davProperties: [DavProperty.FileId, DavProperty.Permissions, DavProperty.Name]
      })

      const savedImageVersion = yield getFileContents(currentFileContext, { responseType: 'blob' })
      serverVersion.value = savedImageVersion.body
      currentETag.value = savedImageVersion.headers['OC-ETag']
    })

    function* getNewEditedFileName() {
      try {
        const contextFileName = unref(unref(currentFileContext).fileName).split('.')
        let duplicates = 0
        while (true) {
          yield `${contextFileName[0]} [Edited${duplicates === 0 ? '' : ' (' + duplicates + ')'}].${
            contextFileName[1]
          }`
          duplicates += 1
        }
      } catch (e) {
        console.error(e)
      }
    }

    const saveImageTask = (duplicate: boolean) =>
      useTask(function* () {
        const newVersion = yield getUpdatedBlob()

        if (duplicate) {
          try {
            const nameGenerator = getNewEditedFileName()
            let testName: string = nameGenerator.next().value as string

            while (unref(filteredFiles).find((file) => file.name === testName)) {
              testName = nameGenerator.next().value as string
            }

            const currentFolder = (
              unref(unref(currentFileContext).routeParams).driveAliasAndItem as string
            )
              .split('/')
              .slice(2)
              .toString()
              .replaceAll(',', '/')

            const newPath = `${currentFolder}/${testName}`

            const putFileContentsResponse = yield putFileContents(currentFileContext, {
              content: newVersion,
              path: newPath
            })

            const { params, query } = createFileRouteOptions(
              unref(unref(currentFileContext).space),
              putFileContentsResponse
            )

            const newUrl = router.resolve({
              ...unref(route),
              params: { ...unref(route).params, ...params },
              query: { ...unref(route).query, ...query }
            })

            window.open(newUrl.fullPath, '_blank')?.focus()

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
        } else {
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
        }
        // #Reloads the page
        router.go(0)
      }).restartable()

    function save() {
      const modal = {
        variation: 'danger',
        icon: 'warning',
        title: $gettext('Duplicate modal'),
        message: $gettext('Do you want to save the changes in a duplicate file?'),
        cancelText: $gettext('Save original'),
        confirmText: $gettext('Create duplicate'),
        onCancel: async () => {
          store.dispatch('hideModal')
          await saveImageTask(false).perform()
        },
        onConfirm: async () => {
          store.dispatch('hideModal')
          await saveImageTask(true).perform()
        }
      }
      store.dispatch('createModal', modal)
    }

    watch(activeMediaFileCached, () => {
      if (activeMediaFileCached.value && activeMediaFileCached.value.isImage) {
        loadImageTask.perform()
        store.commit('Preview/RESET_ADJUSTMENT_PARAMETERS')
        store.commit('Preview/RESET_SELECTED_PROCESSING_TOOL')
        appliedAdjustmentParameters.value = unref(activeAdjustmentParameters)
      }
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

    const triggerActiveFileDownload = () => {
      if (isFileContentLoading.value) {
        return
      }

      if (unref(activeAdjustmentParameters) !== unref(appliedAdjustmentParameters)) {
        const onConfirm: Array<(...args: any[]) => Promise<any> | any> = [
          () => save(),
          () => downloadFile(unref(activeFilteredFile))
        ]

        useCancelUnsavedChangesModal([], onConfirm, store)
      } else {
        downloadFile(unref(activeFilteredFile))
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

    function isFileTypeImage(file: Resource) {
      return !isFileTypeAudio(file) && !isFileTypeVideo(file)
    }
    function isFileTypeAudio(file: Resource) {
      return file.mimeType.toLowerCase().startsWith('audio')
    }
    function isFileTypeVideo(file: Resource) {
      return file.mimeType.toLowerCase().startsWith('video')
    }

    const isActiveFileTypeAudio = computed(() => isFileTypeAudio(activeFilteredFile.value))
    const isActiveFileTypeVideo = computed(() => isFileTypeVideo(activeFilteredFile.value))
    const isActiveFileTypeImage = computed(() => isFileTypeImage(activeFilteredFile.value))

    function handleResetValues() {
      store.commit('RESET_ADJUSTMENT_PARAMETERS')
      store.commit('RESET_SELECTED_PROCESSING_TOOL')
    }

    function handleSetNewActiveIndex(newActiveIndex: number) {
      if (newActiveIndex >= unref(filteredFiles).length) {
        activeIndex.value = 0
      } else if (newActiveIndex < 0) {
        activeIndex.value = unref(filteredFiles).length - 1
      } else {
        activeIndex.value = newActiveIndex
      }
    }

    function handleSetActiveMediaFile(newActiveIndex: number) {
      if (unref(isFileContentLoading)) {
        return
      }

      isFileContentError.value = false

      if (unref(isSaveable)) {
        const onConfirm: Array<(...args: any[]) => Promise<any> | any> = [
          () => save(),
          () => handleSetNewActiveIndex(newActiveIndex),
          () => updateLocalHistory()
        ]
        const onCancel: Array<(...args: any[]) => Promise<any> | any> = [
          () => handleSetNewActiveIndex(newActiveIndex),
          () => updateLocalHistory()
        ]
        useSaveUnsavedChangesModal(onCancel, onConfirm, store)
      } else {
        handleSetNewActiveIndex(newActiveIndex)
        updateLocalHistory()
      }
      // Update with loading and error handling
    }

    function closePreview() {
      if (unref(isSaveable)) {
        const onCancel: Array<(...args: any[]) => Promise<any> | any> = [
          () => handleResetValues(),
          () => closeApp()
        ]
        const onConfirm: Array<(...args: any[]) => Promise<any> | any> = [
          () => save(),
          () => handleResetValues(),
          () => closeApp()
        ]
        useSaveUnsavedChangesModal(onCancel, onConfirm, store)
      } else {
        handleResetValues()
        closeApp()
      }
    }

    function loadPreview(file: Resource) {
      return previewService.loadPreview({
        space: unref(currentFileContext.value.space),
        resource: file,
        dimensions: [thumbDimensions.value, thumbDimensions.value] as [number, number]
      })
    }

    onMounted(() => {
      appliedAdjustmentParameters.value = unref(activeAdjustmentParameters)
    })

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
      thumbDimensions,
      mediaGalleryFiles,
      toggleFullscreenMode,
      updateLocalHistory,
      triggerActiveFileDownload,
      useSaveUnsavedChangesModal,
      saveImageTask,
      serverVersion,
      appliedAdjustmentParameters,
      activeAdjustmentParameters,
      save,
      isFileTypeAudio,
      isFileTypeImage,
      isFileTypeVideo,
      isActiveFileTypeAudio,
      isActiveFileTypeImage,
      isActiveFileTypeVideo,
      handleSetActiveMediaFile,
      closePreview,
      loadPreview,
      sortDir,
      sortBy,
      isSaveable
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
    ...mapActions(['createModal', 'hideModal'])
  }
})
</script>

<style lang="scss" scoped>
.image-container {
  padding: $oc-space-medium;
  flex: 1;
  min-width: 0;
}
.image-gallery {
  margin-top: 1rem;
}
.preview-player {
  overflow: auto;
  height: 70vh;
  object-fit: contain;

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
  justify-content: space-between;
}
</style>
