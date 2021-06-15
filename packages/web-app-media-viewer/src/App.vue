<template>
  <main id="mediaviewer" class="uk-position-relative">
    <div class="uk-text-center oc-p-s">
      <transition
        name="custom-classes-transition"
        :enter-active-class="activeClass.enter"
        :leave-active-class="activeClass.leave"
      >
        <div v-show="!loading && activeMediaFileCached">
          <video
            v-if="medium.isVideo"
            :key="`media-video-${medium.id}`"
            class="uk-box-shadow-medium media-viewer-player"
            controls
            preload
          >
            <source :src="medium.url" :type="`video/${medium.ext}`" />
          </video>
          <img
            v-else
            :key="`media-image-${medium.id}`"
            :src="medium.url"
            :alt="medium.name"
            :data-id="medium.id"
            class="uk-box-shadow-medium media-viewer-player"
          />
        </div>
      </transition>
    </div>
    <oc-spinner
      v-if="loading"
      :aria-label="$gettext('Loading media')"
      class="uk-position-center"
      size="xlarge"
    />
    <oc-icon
      v-if="failed"
      name="review"
      variation="danger"
      size="xlarge"
      class="uk-position-center uk-z-index"
      :accessible-label="$gettext('Failed to load media')"
    />

    <div class="uk-position-medium uk-position-bottom-center media-viewer-details">
      <div
        class="uk-overlay uk-overlay-default oc-p-s uk-text-center oc-text-muted uk-text-truncate media-viewer-file-name"
      >
        {{ medium.name }}
      </div>
      <div class="uk-overlay uk-overlay-primary uk-light oc-p-s media-viewer-controls-container">
        <div
          class="uk-width-large uk-flex uk-flex-middle uk-flex-center uk-flex-around media-viewer-controls-action-bar"
          style="user-select:none;"
        >
          <oc-icon
            role="button"
            class="oc-cursor-pointer media-viewer-controls-previous"
            size="large"
            name="chevron_left"
            :accessible-label="$gettext('Previous')"
            @click="prev"
          />
          <!-- @TODO: Bring back working uk-light -->
          <span v-if="!$_loader_folderLoading" class="uk-text-small" style="color:#fff">
            {{ activeIndex + 1 }} <span v-translate>of</span> {{ mediaFiles.length }}
          </span>
          <oc-icon
            role="button"
            class="oc-cursor-pointer media-viewer-controls-next"
            size="large"
            name="chevron_right"
            :accessible-label="$gettext('Next')"
            @click="next"
          />
          <oc-icon
            role="button"
            class="oc-cursor-pointer media-viewer-controls-download"
            name="file_download"
            :accessible-label="$gettext('Download')"
            @click="downloadMedium"
          />
          <oc-icon
            role="button"
            class="oc-cursor-pointer media-viewer-controls-close"
            name="close"
            :accessible-label="$gettext('Close')"
            @click="closeApp"
          />
        </div>
      </div>
    </div>
  </main>
</template>
<script>
import { mapGetters } from 'vuex'
import Loader from './mixins/loader.js'

export default {
  name: 'Mediaviewer',
  mixins: [Loader],
  data() {
    return {
      loading: true,
      failed: false,

      activeIndex: null,
      direction: 'rtl',

      medium: {},
      media: [],

      // Milliseconds
      animationDuration: 1000
    }
  },

  computed: {
    ...mapGetters('Files', ['activeFiles']),
    ...mapGetters(['getToken', 'capabilities']),

    mediaFiles() {
      return this.activeFiles.filter(file => {
        return file.extension.toLowerCase().match(/(png|jpg|jpeg|gif|mp4|webm|ogg)/)
      })
    },
    activeMediaFile() {
      return this.mediaFiles[this.activeIndex]
    },
    activeMediaFileCached() {
      const cached = this.media.find(i => i.id === this.activeMediaFile.id)
      return cached !== undefined ? cached : false
    },
    activeClass() {
      const direction = ['right', 'left']

      if (this.direction === 'ltr') {
        direction.reverse()
      }

      return {
        enter: `uk-animation-slide-${direction[0]}-small`,
        leave: `uk-animation-slide-${direction[1]} uk-animation-reverse`
      }
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
        c: this.activeMediaFile.etag.substr(1, this.activeMediaFile.etag.length - 2),
        scalingup: 0,
        preview: 1,
        a: 1
      }

      return this.$_loader_getDavFilePath(this.activeMediaFile, query)
    },
    rawMediaUrl() {
      return this.$_loader_getDavFilePath(this.activeMediaFile)
    },

    videoExtensions() {
      return ['mp4', 'webm', 'ogg']
    },

    isActiveMediaFileTypeVideo() {
      return this.videoExtensions.includes(this.activeMediaFile.extension)
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
    document.addEventListener('keyup', this.handleKeyPress)

    // keep a local history for this component
    window.addEventListener('popstate', this.handleLocalHistoryEvent)

    const filePath = this.$route.params.filePath
    await this.$_loader_loadFolder(this.$route.params.contextRouteName, filePath)
    this.setCurrentFile(filePath)
  },

  beforeDestroy() {
    document.removeEventListener('keyup', this.handleKeyPress)

    window.removeEventListener('popstate', this.handleLocalHistoryEvent)

    this.media.forEach(medium => {
      window.URL.revokeObjectURL(medium.url)
    })
  },

  methods: {
    setCurrentFile(filePath) {
      for (let i = 0; i < this.mediaFiles.length; i++) {
        if (this.mediaFiles[i].path === filePath) {
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
      this.$route.params.filePath = this.activeMediaFile.path
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
          this.animationDuration / 2
        )
        return
      }

      // Fetch media
      const url = this.isActiveMediaFileTypeImage ? this.thumbUrl : this.rawMediaUrl
      // FIXME: at the moment the signing key is not cached, thus it will be loaded again on each request.
      // workaround for now: Load file as blob for images, load as signed url (if supported) for everything else.
      let promise
      if (this.isActiveMediaFileTypeImage || !this.isUrlSigningEnabled) {
        promise = this.mediaSource(decodeURIComponent(url), 'url', null)
      } else {
        promise = this.$client.signUrl(url, 86400) // Timeout of the signed URL = 24 hours
      }

      promise
        .then(mediaUrl => {
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
        .catch(e => {
          this.loading = false
          this.failed = true
          console.error(e)
        })
    },

    downloadMedium() {
      if (this.loading) {
        return
      }

      return this.downloadFile(this.mediaFiles[this.activeIndex], this.$_loader_publicContext)
    },
    next() {
      if (this.loading) {
        return
      }

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

      this.direction = 'ltr'
      if (this.activeIndex === 0) {
        this.activeIndex = this.mediaFiles.length - 1
        return
      }
      this.activeIndex--
      this.updateLocalHistory()
    },
    handleKeyPress(e) {
      if (!e) return false
      else if (e.key === 'ArrowRight') this.next()
      else if (e.key === 'ArrowLeft') this.prev()
    },
    closeApp() {
      this.$_loader_navigateToContextRoute(
        this.$route.params.contextRouteName,
        this.$route.params.filePath
      )
    }
  }
}
</script>

<style scoped>
#mediaviewer {
  min-height: 100vh;
}
.media-viewer-player {
  width: 100%;
  max-width: 90vw;
  height: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>
