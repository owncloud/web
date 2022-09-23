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
        class="
          oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium
          preview-player
        "
      >
        <img
          v-if="activeMediaFileCached.isImage"
          :key="`media-image-${activeMediaFileCached.id}`"
          :src="activeMediaFileCached.url"
          :alt="activeMediaFileCached.name"
          :data-id="activeMediaFileCached.id"
        />
        <video
          v-else-if="activeMediaFileCached.isVideo"
          :key="`media-video-${activeMediaFileCached.id}`"
          controls
          preload
        >
          <source :src="activeMediaFileCached.url" :type="activeMediaFileCached.mimeType" />
        </video>
        <audio
          v-else-if="activeMediaFileCached.isAudio"
          :key="`media-audio-${activeMediaFileCached.id}`"
          controls
          preload
        >
          <source :src="activeMediaFileCached.url" :type="activeMediaFileCached.mimeType" />
        </audio>
      </div>
    </template>
    <div class="oc-position-medium oc-position-bottom-center preview-details">
      <div
        class="
          oc-background-brand
          oc-p-s
          oc-width-large
          oc-flex
          oc-flex-middle
          oc-flex-center
          oc-flex-around
          preview-controls-action-bar
        "
      >
        <oc-button
          class="preview-controls-previous"
          appearance="raw"
          variation="inverse"
          :aria-label="$gettext('Show previous media file in folder')"
          @click="prev"
        >
          <oc-icon size="large" name="arrow-drop-left" />
        </oc-button>
        <p v-if="!isFolderLoading" class="oc-m-rm preview-controls-action-count">
          <span aria-hidden="true" v-text="ariaHiddenFileCount" />
          <span class="oc-invisible-sr" v-text="screenreaderFileCount" />
        </p>
        <oc-button
          class="preview-controls-next"
          appearance="raw"
          variation="inverse"
          :aria-label="$gettext('Show next media file in folder')"
          @click="next"
        >
          <oc-icon size="large" name="arrow-drop-right" />
        </oc-button>
      </div>
    </div>
  </main>
</template>
<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { mapGetters } from 'vuex'
import {
  useAccessToken,
  useAppDefaults,
  usePublicLinkContext,
  useStore
} from 'web-pkg/src/composables'
import Preview from './index'
import AppTopBar from 'web-pkg/src/components/AppTopBar.vue'
import { loadPreview } from 'web-pkg/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'

export default defineComponent({
  name: 'Preview',
  components: {
    AppTopBar
  },
  setup() {
    const store = useStore()
    return {
      ...useAppDefaults({
        applicationId: 'preview'
      }),
      accessToken: useAccessToken({ store }),
      isPublicLinkContext: usePublicLinkContext({ store })
    }
  },
  data() {
    return {
      isFileContentLoading: true,
      isFileContentError: false,

      activeIndex: null,
      direction: 'rtl',

      cachedFiles: []
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
        return Preview.mimeTypes().includes(file.mimeType?.toLowerCase())
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
    rawMediaUrl() {
      return this.getUrlForResource(this.activeFilteredFile)
    },

    isActiveFileTypeImage() {
      return !this.isActiveFileTypeAudio && !this.isActiveFileTypeVideo
    },

    isActiveFileTypeAudio() {
      return this.activeFilteredFile.mimeType.toLowerCase().startsWith('audio')
    },

    isActiveFileTypeVideo() {
      return this.activeFilteredFile.mimeType.toLowerCase().startsWith('video')
    },

    isUrlSigningEnabled() {
      return this.capabilities.core && this.capabilities.core['support-url-signing']
    }
  },

  watch: {
    activeIndex(o, n) {
      if (o !== n) {
        this.loadMedium()
      }
    }
  },

  async mounted() {
    // keep a local history for this component
    window.addEventListener('popstate', this.handleLocalHistoryEvent)
    await this.loadFolderForFileContext(this.currentFileContext)
    this.setActiveFile(this.currentFileContext.path)
    this.$refs.preview.focus()
  },

  beforeDestroy() {
    window.removeEventListener('popstate', this.handleLocalHistoryEvent)

    this.cachedFiles.forEach((medium) => {
      this.revokeUrl(medium.url)
    })
  },

  methods: {
    setActiveFile(filePath) {
      for (let i = 0; i < this.filteredFiles.length; i++) {
        if (this.filteredFiles[i].webDavPath === filePath) {
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
      this.setActiveFile(result.route.params.filePath)
    },

    // update route and url
    updateLocalHistory() {
      this.$route.params.filePath = this.activeFilteredFile.webDavPath
      history.pushState({}, document.title, this.$router.resolve(this.$route).href)
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
          mediaUrl = await this.getUrlForResource(this.activeFilteredFile)
        } else {
          mediaUrl = await loadPreview({
            resource: this.activeFilteredFile,
            isPublic: this.isPublicLinkContext,
            server: configurationManager.serverUrl,
            userId: this.user.id,
            token: this.accessToken,
            dimensions: [this.thumbDimensions, this.thumbDimensions] as [number, number]
          })
        }

        this.cachedFiles.push({
          id: this.activeFilteredFile.id,
          name: this.activeFilteredFile.name,
          url: mediaUrl,
          ext: this.activeFilteredFile.extension,
          mimeType: this.activeFilteredFile.mimeType,
          isVideo: this.isActiveFileTypeVideo,
          isImage: this.isActiveFileTypeImage,
          isAudio: this.isActiveFileTypeAudio
        })
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
        return
      }
      this.activeIndex--
      this.updateLocalHistory()
    }
  }
})
</script>

<style lang="scss" scoped>
.preview-player {
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

.preview-tool-bar {
  align-items: center;
  justify-content: space-between;
}

.preview-controls-action-count {
  color: var(--oc-color-swatch-inverse-default);
}

@media (max-width: 959px) {
  .preview-player {
    max-width: 100vw;
  }
}
</style>
