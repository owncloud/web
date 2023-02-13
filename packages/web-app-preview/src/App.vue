<template>
  <main
    id="preview"
    ref="preview"
    tabindex="-1"
    @keydown.left="prev"
    @keydown.right="next"
    @keydown.esc="closeApp"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <app-top-bar :resource="activeFilteredFile">
      <template #right>
        <oc-button
          v-if="!isFileContentError"
          class="preview-download"
          size="small"
          :aria-label="$gettext('Download currently viewed file')"
          @click="triggerActiveFileDownload"
        >
          <oc-icon size="small" name="file-download" />
        </oc-button>
      </template>
    </app-top-bar>

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
        <img
          v-if="activeMediaFileCached.isImage"
          :key="`media-image-${activeMediaFileCached.id}`"
          :src="activeMediaFileCached.url"
          :alt="activeMediaFileCached.name"
          :data-id="activeMediaFileCached.id"
          :style="`zoom: ${currentImageZoom};transform: rotate(${currentImageRotation}deg)`"
        />
        <video
          v-else-if="activeMediaFileCached.isVideo"
          :key="`media-video-${activeMediaFileCached.id}`"
          controls
          preload
          :autoplay="isAutoPlayEnabled"
        >
          <source :src="activeMediaFileCached.url" :type="activeMediaFileCached.mimeType" />
        </video>
        <audio
          v-else-if="activeMediaFileCached.isAudio"
          :key="`media-audio-${activeMediaFileCached.id}`"
          controls
          preload
          :autoplay="isAutoPlayEnabled"
        >
          <source :src="activeMediaFileCached.url" :type="activeMediaFileCached.mimeType" />
        </audio>
      </div>
    </template>
    <div
      class="oc-position-medium oc-position-bottom-center preview-details"
      :class="{ lightbox: isFullScreenModeActivated }"
    >
      <div
        class="oc-background-brand oc-p-s oc-width-large oc-flex oc-flex-middle oc-flex-center oc-flex-around preview-controls-action-bar"
      >
        <oc-button
          v-oc-tooltip="previousDescription"
          class="preview-controls-previous"
          appearance="raw"
          variation="inverse"
          :aria-label="previousDescription"
          @click="prev"
        >
          <oc-icon size="large" name="arrow-drop-left" />
        </oc-button>
        <p v-if="!isFolderLoading" class="oc-m-rm preview-controls-action-count">
          <span aria-hidden="true" v-text="ariaHiddenFileCount" />
          <span class="oc-invisible-sr" v-text="screenreaderFileCount" />
        </p>
        <oc-button
          v-oc-tooltip="nextDescription"
          class="preview-controls-next"
          appearance="raw"
          variation="inverse"
          :aria-label="nextDescription"
          @click="next"
        >
          <oc-icon size="large" name="arrow-drop-right" />
        </oc-button>
        <div class="oc-flex">
          <oc-button
            v-oc-tooltip="
              isFullScreenModeActivated ? exitFullScreenDescription : enterFullScreenDescription
            "
            class="preview-controls-fullscreen"
            appearance="raw"
            variation="inverse"
            :aria-label="
              isFullScreenModeActivated ? exitFullScreenDescription : enterFullScreenDescription
            "
            @click="toggleFullscreenMode"
          >
            <oc-icon
              fill-type="line"
              :name="isFullScreenModeActivated ? 'fullscreen-exit' : 'fullscreen'"
            />
          </oc-button>
        </div>
        <div v-if="activeMediaFileCached.isImage" class="oc-flex oc-flex-middle">
          <div class="oc-flex">
            <oc-button
              v-oc-tooltip="imageShrinkDescription"
              class="preview-controls-image-shrink"
              appearance="raw"
              variation="inverse"
              :aria-label="imageShrinkDescription"
              @click="imageShrink"
            >
              <oc-icon fill-type="line" name="checkbox-indeterminate" />
            </oc-button>
            <oc-button
              v-oc-tooltip="imageOriginalSizeDescription"
              class="preview-controls-image-original-size oc-ml-s oc-mr-s"
              appearance="raw"
              variation="inverse"
              :aria-label="imageOriginalSizeDescription"
              @click="currentImageZoom = 1"
            >
              <span v-text="currentZoomDisplayValue" />
            </oc-button>
            <oc-button
              v-oc-tooltip="imageZoomDescription"
              class="preview-controls-image-zoom"
              appearance="raw"
              variation="inverse"
              :aria-label="imageZoomDescription"
              @click="imageZoom"
            >
              <oc-icon fill-type="line" name="add-box" />
            </oc-button>
          </div>
          <div class="oc-ml-m">
            <oc-button
              v-oc-tooltip="imageRotateLeftDescription"
              class="preview-controls-rotate-left"
              appearance="raw"
              variation="inverse"
              :aria-label="imageRotateLeftDescription"
              @click="imageRotateLeft"
            >
              <oc-icon fill-type="line" name="anticlockwise" />
            </oc-button>
            <oc-button
              v-oc-tooltip="imageRotateRightDescription"
              class="preview-rotate-right"
              appearance="raw"
              variation="inverse"
              :aria-label="imageRotateRightDescription"
              @click="imageRotateRight"
            >
              <oc-icon fill-type="line" name="clockwise" />
            </oc-button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script lang="ts">
import { defineComponent, ref, unref } from 'vue'
import { mapGetters } from 'vuex'
import {
  useAccessToken,
  useAppDefaults,
  usePublicLinkContext,
  useStore
} from 'web-pkg/src/composables'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import { loadPreview } from 'web-pkg/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

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
    ...(window?.Vue?.$store?.getters.extensionConfigByAppId(appId).mimeTypes || [])
  ]
}

export default defineComponent({
  name: 'Preview',
  components: {
    AppTopBar
  },
  setup() {
    const store = useStore()

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

    return {
      ...useAppDefaults({
        applicationId: 'preview'
      }),
      accessToken: useAccessToken({ store }),
      isPublicLinkContext: usePublicLinkContext({ store }),

      isFullScreenModeActivated,
      toggleFullscreenMode
    }
  },
  data() {
    return {
      isFileContentLoading: true,
      isFileContentError: false,
      isAutoPlayEnabled: true,

      activeIndex: null,
      direction: 'rtl',

      cachedFiles: [],
      toPreloadImageIds: [],

      currentImageZoom: 1,
      currentImageRotation: 0,

      preloadImageCount: 10
    }
  },

  computed: {
    ...mapGetters(['capabilities', 'user']),

    pageTitle() {
      const translated = this.$gettext('Preview for %{currentMediumName}')
      return this.$gettextInterpolate(translated, {
        currentMediumName: this.activeFilteredFile?.name
      })
    },
    ariaHiddenFileCount() {
      const translated = this.$gettext('%{ displayIndex } of %{ availableMediaFiles }')
      return this.$gettextInterpolate(translated, {
        displayIndex: this.activeIndex + 1,
        availableMediaFiles: this.filteredFiles.length
      })
    },
    screenreaderFileCount() {
      const translated = this.$gettext('Media file %{ displayIndex } of %{ availableMediaFiles }')
      return this.$gettextInterpolate(translated, {
        displayIndex: this.activeIndex + 1,
        availableMediaFiles: this.filteredFiles.length
      })
    },
    filteredFiles() {
      if (!this.activeFiles) {
        return []
      }

      return this.activeFiles.filter((file) => {
        return mimeTypes().includes(file.mimeType?.toLowerCase())
      })
    },
    activeFilteredFile() {
      return this.filteredFiles[this.activeIndex]
    },
    activeMediaFileCached() {
      const cached = this.cachedFiles.find((i) => i.id === this.activeFilteredFile.id)
      return cached !== undefined ? cached : false
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

    isActiveFileTypeImage() {
      return !this.isActiveFileTypeAudio && !this.isActiveFileTypeVideo
    },

    isActiveFileTypeAudio() {
      return this.isFileTypeAudio(this.activeFilteredFile)
    },

    isActiveFileTypeVideo() {
      return this.isFileTypeVideo(this.activeFilteredFile)
    },
    enterFullScreenDescription() {
      return this.$gettext('Enter full screen mode')
    },
    exitFullScreenDescription() {
      return this.$gettext('Exit full screen mode')
    },
    imageShrinkDescription() {
      return this.$gettext('Shrink the image')
    },
    imageZoomDescription() {
      return this.$gettext('Enlarge the image')
    },
    imageOriginalSizeDescription() {
      return this.$gettext('Show the image at its normal size')
    },
    imageRotateLeftDescription() {
      return this.$gettext('Rotate the image 90 degrees to the left')
    },
    imageRotateRightDescription() {
      return this.$gettext('Rotate the image 90 degrees to the right')
    },
    previousDescription() {
      return this.$gettext('Show previous media file in folder')
    },
    nextDescription() {
      return this.$gettext('Show next media file in folder')
    },
    currentZoomDisplayValue() {
      return `${(this.currentImageZoom * 100).toFixed(0)}%`
    },
    toggleFullScreenDescription() {
      return this.$gettext('Toggle full screen mode')
    }
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
    this.setActiveFile(this.currentFileContext.driveAliasAndItem)
    this.$refs.preview.focus()
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
          this.currentFileContext.space?.getDriveAliasAndItem(this.filteredFiles[i]) ===
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
      const result = this.$router.resolve(document.location)
      this.setActiveFile(result.route.params.driveAliasAndItem)
    },
    handleFullScreenChangeEvent() {
      if (document.fullscreenElement === null) {
        this.isFullScreenModeActivated = false
      }
    },
    // update route and url
    updateLocalHistory() {
      const routeOptions = createFileRouteOptions(
        unref(this.currentFileContext.space),
        this.activeFilteredFile
      )
      history.pushState({}, document.title, this.$router.resolve(routeOptions).href)
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
            this.currentFileContext.space,
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
    triggerActiveFileDownload() {
      if (this.isFileContentLoading) {
        return
      }

      return this.downloadFile(this.activeFilteredFile)
    },
    next() {
      if (this.isFileContentLoading) {
        return
      }
      this.isFileContentError = false
      this.direction = 'rtl'
      if (this.activeIndex + 1 >= this.filteredFiles.length) {
        this.activeIndex = 0
        this.updateLocalHistory()
        return
      }
      this.activeIndex++
      this.updateLocalHistory()
    },
    prev() {
      if (this.isFileContentLoading) {
        return
      }
      this.isFileContentError = false
      this.direction = 'ltr'
      if (this.activeIndex === 0) {
        this.activeIndex = this.filteredFiles.length - 1
        this.updateLocalHistory()
        return
      }
      this.activeIndex--
      this.updateLocalHistory()
    },
    calculateZoom(zoom, factor) {
      return Math.round(zoom * factor * 20) / 20
    },
    imageShrink() {
      this.currentImageZoom = Math.max(0.1, this.calculateZoom(this.currentImageZoom, 0.8))
    },
    imageZoom() {
      const maxZoomValue = this.calculateZoom(9, 1.25)
      this.currentImageZoom = Math.min(
        this.calculateZoom(this.currentImageZoom, 1.25),
        maxZoomValue
      )
    },
    imageRotateLeft() {
      this.currentImageRotation =
        this.currentImageRotation === -270 ? 0 : this.currentImageRotation - 90
    },
    imageRotateRight() {
      this.currentImageRotation =
        this.currentImageRotation === 270 ? 0 : this.currentImageRotation + 90
    },
    isFileTypeImage(file) {
      return !this.isFileTypeAudio(file) && !this.isFileTypeVideo(file)
    },
    isFileTypeAudio(file) {
      return file.mimeType.toLowerCase().startsWith('audio')
    },

    isFileTypeVideo(file) {
      return file.mimeType.toLowerCase().startsWith('video')
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
      return loadPreview({
        resource: file,
        isPublic: this.isPublicLinkContext,
        server: configurationManager.serverUrl,
        userId: this.user.id,
        token: this.accessToken,
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
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-player {
  overflow: auto;
  max-width: 90vw;
  height: 70vh;
  margin: 10px auto;
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

.preview-tool-bar {
  align-items: center;
  justify-content: space-between;
  z-index: 1001;
}

.preview-controls-action-count {
  color: var(--oc-color-swatch-inverse-default);
}

.preview-controls-image-original-size {
  width: 42px;
}

@media (max-width: 959px) {
  .preview-player {
    max-width: 100vw;
  }
}
</style>
