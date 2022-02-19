<template>
  <main
    id="mediaviewer"
    ref="mediaviewer"
    tabindex="-1"
    @keydown.left="prev"
    @keydown.right="next"
    @keydown.esc="closeApp"
  >
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <div
      v-show="!loading && activeMediaFileCached"
      class="
        oc-width-1-1 oc-flex oc-flex-center oc-flex-middle oc-p-s oc-box-shadow-medium
        media-viewer-player
      "
    >
      <video v-if="medium.isVideo" :key="`media-video-${medium.id}`" controls preload>
        <source :src="medium.url" :type="`video/${medium.ext}`" />
      </video>
      <img
        v-else
        :key="`media-image-${medium.id}`"
        :src="medium.url"
        :alt="medium.name"
        :data-id="medium.id"
      />
    </div>
    <div v-if="loading" class="oc-position-center">
      <oc-spinner :aria-label="$gettext('Loading media file')" size="xlarge" />
    </div>
    <oc-icon
      v-if="failed"
      name="review"
      variation="danger"
      size="xlarge"
      class="oc-position-center"
      :accessible-label="$gettext('Failed to load media file')"
    />

    <div class="oc-position-medium oc-position-bottom-center media-viewer-details">
      <p
        class="oc-text-lead oc-text-center oc-text-truncate oc-p-s media-viewer-file-name"
        aria-hidden="true"
      >
        {{ medium.name }}
      </p>
      <div
        class="
          oc-background-brand
          oc-p-s
          oc-width-large
          oc-flex
          oc-flex-middle
          oc-flex-center
          oc-flex-around
          media-viewer-controls-action-bar
        "
      >
        <oc-button
          class="media-viewer-controls-previous"
          appearance="raw"
          variation="inverse"
          :aria-label="$gettext('Show previous media file in folder')"
          @click="prev"
        >
          <oc-icon size="large" name="arrow-drop-left" />
        </oc-button>
        <p v-if="!isFolderLoading" class="oc-m-rm media-viewer-controls-action-count">
          <span aria-hidden="true" v-text="ariaHiddenFileCount" />
          <span class="oc-invisible-sr" v-text="screenreaderFileCount" />
        </p>
        <oc-button
          class="media-viewer-controls-next"
          appearance="raw"
          variation="inverse"
          :aria-label="$gettext('Show next media file in folder')"
          @click="next"
        >
          <oc-icon size="large" name="arrow-drop-right" />
        </oc-button>
        <oc-button
          class="media-viewer-controls-download"
          appearance="raw"
          variation="inverse"
          :aria-label="$gettext('Download currently viewed file')"
          @click="downloadMedium"
        >
          <oc-icon size="large" name="file-download" fill-type="line" />
        </oc-button>
        <oc-button
          class="media-viewer-controls-close"
          appearance="raw"
          variation="inverse"
          :aria-label="$gettext('Close mediaviewer app')"
          @click="closeApp"
        >
          <oc-icon size="large" name="close" />
        </oc-button>
      </div>
    </div>
  </main>
</template>
<script>
import { mapGetters } from 'vuex'
import { useAppDefaults } from 'web-pkg/src/composables'

export default {
  name: 'Mediaviewer',
  setup() {
    return {
      ...useAppDefaults({
        applicationName: 'media'
      })
    }
  },
  data() {
    return {
      loading: true,
      failed: false,

      activeIndex: null,
      direction: 'rtl',

      medium: {},
      media: []
    }
  },

  computed: {
    ...mapGetters(['getToken', 'capabilities']),

    pageTitle() {
      const translated = this.$gettext('Mediaviewer for %{currentMediumName}')
      return this.$gettextInterpolate(translated, {
        currentMediumName: this.medium.name
      })
    },
    ariaHiddenFileCount() {
      const translated = this.$gettext('%{ displayIndex } of %{ availableMediaFiles }')
      return this.$gettextInterpolate(translated, {
        displayIndex: this.activeIndex + 1,
        availableMediaFiles: this.mediaFiles.length
      })
    },
    screenreaderFileCount() {
      const translated = this.$gettext('Media file %{ displayIndex } of %{ availableMediaFiles }')
      return this.$gettextInterpolate(translated, {
        displayIndex: this.activeIndex + 1,
        availableMediaFiles: this.mediaFiles.length
      })
    },
    mediaFiles() {
      if (!this.activeFiles) {
        return []
      }

      return this.activeFiles.filter((file) => {
        return file.extension.toLowerCase().match(/(png|jpg|jpeg|gif|mp4|webm|ogg)/)
      })
    },
    activeMediaFile() {
      return this.mediaFiles[this.activeIndex]
    },
    activeMediaFileCached() {
      const cached = this.media.find((i) => i.id === this.activeMediaFile.id)
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
    thumbUrl() {
      const query = {
        x: this.thumbDimensions,
        y: this.thumbDimensions,
        // strip double quotes from etag
        // we have no etag, e.g. on shared with others page
        c: this.activeMediaFile.etag?.substr(1, this.activeMediaFile.etag.length - 2),
        scalingup: 0,
        preview: 1,
        a: 1
      }

      return this.getUrlForResource(this.activeMediaFile, query)
    },
    rawMediaUrl() {
      return this.getUrlForResource(this.activeMediaFile)
    },

    videoExtensions() {
      return ['mp4', 'webm', 'ogg']
    },

    isActiveMediaFileTypeVideo() {
      return this.videoExtensions.includes(this.activeMediaFile.extension.toLowerCase())
    },

    isActiveMediaFileTypeImage() {
      return !this.isActiveMediaFileTypeVideo
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
    this.setCurrentFile(this.currentFileContext.path)
    this.$refs.mediaviewer.focus()
  },

  beforeDestroy() {
    window.removeEventListener('popstate', this.handleLocalHistoryEvent)

    this.media.forEach((medium) => {
      window.URL.revokeObjectURL(medium.url)
    })
  },

  methods: {
    setCurrentFile(filePath) {
      for (let i = 0; i < this.mediaFiles.length; i++) {
        if (this.mediaFiles[i].webDavPath === filePath) {
          this.activeIndex = i
          break
        }
      }
    },

    // react to PopStateEvent ()
    handleLocalHistoryEvent() {
      const result = this.$router.resolve(document.location)
      this.setCurrentFile(result.route.params.filePath)
    },

    // update route and url
    updateLocalHistory() {
      this.$route.params.filePath = this.activeMediaFile.webDavPath
      history.pushState({}, document.title, this.$router.resolve(this.$route).href)
    },

    loadMedium() {
      this.loading = true

      // Don't bother loading if files are cached
      if (this.activeMediaFileCached) {
        setTimeout(
          () => {
            this.medium = this.activeMediaFileCached
            this.loading = false
          },
          // Delay to animate
          50
        )
        return
      }

      // Fetch media
      const url = this.isActiveMediaFileTypeImage ? this.thumbUrl : this.rawMediaUrl
      // FIXME: at the moment the signing key is not cached, thus it will be loaded again on each request.
      // workaround for now: Load file as blob for images, load as signed url (if supported) for everything else.
      let promise
      if (this.isActiveMediaFileTypeImage || !this.isUrlSigningEnabled || !this.$route.meta.auth) {
        promise = this.mediaSource(url, 'url', null)
      } else {
        promise = this.$client.signUrl(url, 86400) // Timeout of the signed URL = 24 hours
      }

      promise
        .then((mediaUrl) => {
          this.media.push({
            id: this.activeMediaFile.id,
            name: this.activeMediaFile.name,
            url: mediaUrl,
            ext: this.activeMediaFile.extension,
            isVideo: this.isActiveMediaFileTypeVideo,
            isImage: this.isActiveMediaFileTypeImage
          })
          this.medium = this.activeMediaFileCached
          this.loading = false
          this.failed = false
        })
        .catch((e) => {
          this.loading = false
          this.failed = true
          console.error(e)
        })
    },

    downloadMedium() {
      if (this.loading) {
        return
      }

      return this.downloadFile(this.mediaFiles[this.activeIndex], this.isPublicLinkContext)
    },
    next() {
      if (this.loading) {
        return
      }
      this.failed = false
      this.direction = 'rtl'
      if (this.activeIndex + 1 >= this.mediaFiles.length) {
        this.activeIndex = 0
        return
      }
      this.activeIndex++
      this.updateLocalHistory()
    },
    prev() {
      if (this.loading) {
        return
      }
      this.failed = false
      this.direction = 'ltr'
      if (this.activeIndex === 0) {
        this.activeIndex = this.mediaFiles.length - 1
        return
      }
      this.activeIndex--
      this.updateLocalHistory()
    }
  }
}
</script>

<style lang="scss" scoped>
.media-viewer-player {
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

.media-viewer-controls-action-count {
  color: var(--oc-color-swatch-inverse-default);
}

@media (max-width: 959px) {
  .media-viewer-player {
    max-width: 100vw;
  }

  .media-viewer-details {
    left: 0;
    margin: 0;
    max-width: 100%;
    transform: none !important;
    width: 100%;
    .media-viewer-controls-action-bar {
      width: 100%;
    }
  }
}
</style>
