<template>
  <div id="mediaviewer" class="uk-position-relative">
    <div class="uk-text-center uk-padding-small">
      <transition
        name="custom-classes-transition"
        :enter-active-class="activeClass.enter"
        :leave-active-class="activeClass.leave"
      >
        <template v-show="!loading && activeMediaFileCached">
          <video
            v-if="image.isVideo"
            key="media-video"
            class="uk-box-shadow-medium media-viewer-player"
            controls
          >
            <source :src="image.url" :type="`video/${image.ext}`" />
          </video>
          <img
            v-else
            key="media-image"
            :src="image.url"
            :alt="image.name"
            :data-id="image.id"
            class="uk-box-shadow-medium media-viewer-player"
          />
        </template>
      </transition>
    </div>
    <oc-spinner
      v-if="loading"
      :aria-label="this.$gettext('Loading media')"
      class="uk-position-center"
      size="large"
    />
    <oc-icon
      v-if="failed"
      name="review"
      variation="danger"
      size="large"
      class="uk-position-center uk-z-index"
    />

    <div class="uk-position-medium uk-position-bottom-center">
      <div
        class="uk-overlay uk-overlay-default uk-padding-small uk-text-center uk-text-meta uk-text-truncate"
      >
        {{ image.name }}
      </div>
      <div class="uk-overlay uk-overlay-primary uk-light uk-padding-small">
        <div
          class="uk-width-large uk-flex uk-flex-middle uk-flex-center uk-flex-around"
          style="user-select:none;"
        >
          <oc-icon
            role="button"
            class="oc-cursor-pointer"
            size="medium"
            name="chevron_left"
            @click="prev"
          />
          <!-- @TODO: Bring back working uk-light -->
          <span v-if="!$_loader_folderLoading" class="uk-text-small" style="color:#fff">
            {{ activeIndex + 1 }} <span v-translate>of</span> {{ mediaFiles.length }}
          </span>
          <oc-icon
            role="button"
            class="oc-cursor-pointer"
            size="medium"
            name="chevron_right"
            @click="next"
          />
          <oc-icon
            role="button"
            class="oc-cursor-pointer"
            name="file_download"
            @click="downloadImage"
          />
          <oc-icon role="button" class="oc-cursor-pointer" name="close" @click="closeApp" />
        </div>
      </div>
    </div>
  </div>
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

      image: {},
      images: [],

      // Milliseconds
      animationDuration: 1000
    }
  },

  computed: {
    ...mapGetters('Files', ['activeFiles']),
    ...mapGetters(['getToken']),

    mediaFiles() {
      return this.activeFiles.filter(file => {
        return file.extension.toLowerCase().match(/(png|jpg|jpeg|gif|mp4|webm|ogg)/)
      })
    },
    activeMediaFile() {
      return this.mediaFiles[this.activeIndex]
    },
    activeMediaFileCached() {
      const cached = this.images.find(i => i.id === this.activeMediaFile.id)
      return cached !== undefined ? cached : false
    },
    activeClass() {
      const direction = ['right', 'left']

      if (this.direction === 'ltr') {
        direction.reverse()
      }

      return {
        enter: `uk-animation-slide-${direction[0]}-small`,
        leave: `uk-animation-slide-${direction[1]}-medium uk-animation-reverse`
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
    thumbPath() {
      const query = {
        x: this.thumbDimensions,
        y: this.thumbDimensions,
        // strip double quotes from etag
        c: this.activeMediaFile.etag.substr(1, this.activeMediaFile.etag.length - 2),
        scalingup: 0,
        preview: 1,
        a: 1
      }

      return this.$_loader_getDavFilePath(this.activeMediaFile.path, query)
    },

    videoExtensions() {
      return ['mp4', 'webm', 'ogg']
    }
  },

  watch: {
    activeIndex(o, n) {
      if (o !== n) {
        this.loadImage()
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

    this.images.forEach(image => {
      window.URL.revokeObjectURL(image.url)
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

    loadImage() {
      this.loading = true

      // Don't bother loading if files i chached
      if (this.activeMediaFileCached) {
        setTimeout(
          () => {
            this.image = this.activeMediaFileCached
            this.loading = false
          },
          // Delay to animate
          this.animationDuration / 2
        )
        return
      }

      // Fetch image
      const url = this.$client.helpers._webdavUrl + this.activeMediaFile.path

      this.$client
        .signUrl(url)
        .then(imageUrl => {
          this.images.push({
            id: this.activeMediaFile.id,
            name: this.activeMediaFile.name,
            url: imageUrl,
            ext: this.activeMediaFile.extension,
            isVideo: this.videoExtensions.includes(this.activeMediaFile.extension)
          })
          this.image = this.activeMediaFileCached
          this.loading = false
          this.failed = false
        })
        .catch(e => {
          this.loading = false
          this.failed = true
          console.error(e)
        })
    },

    downloadImage() {
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
.media-viewer-player {
  width: 100%;
  max-width: 90vw;
  height: 100%;
  max-height: 70vh;
  object-fit: contain;
}
</style>
