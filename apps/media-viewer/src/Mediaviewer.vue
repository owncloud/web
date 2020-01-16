<template>
  <div id="mediaviewer" class="uk-position-relative">
    <div class="uk-position-center uk-padding-small">
      <transition name="custom-classes-transition" :enter-active-class="activeClass.enter" :leave-active-class="activeClass.leave">
        <img v-show="!loading && activeMediaFileCached" :src="image.url" :alt="image.name" :data-id="image.id" style="max-width:90vw;max-height:90vh" class="uk-box-shadow-medium">
      </transition>
    </div>
    <oc-spinner class="uk-position-center" v-if="loading" size="large" />
    <oc-icon v-if="failed" name="review" variation="danger" size="large" class="uk-position-center uk-z-index" />

    <div class="uk-position-medium uk-position-bottom-center">
      <div class="uk-overlay uk-overlay-default uk-padding-small uk-text-center uk-text-meta uk-text-truncate">{{ image.name }}</div>
      <div class="uk-overlay uk-overlay-primary uk-light uk-padding-small">
        <div class="uk-width-large uk-flex uk-flex-middle uk-flex-center uk-flex-around" style="user-select:none;">
          <oc-icon role="button" class="oc-cursor-pointer" size="medium" @click="prev" name="chevron_left" />
          <!-- @TODO: Bring back working uk-light -->
          <span class="uk-text-small" style="color:#fff"> {{ activeIndex + 1 }} <span v-translate>of</span> {{ mediaFiles.length }} </span>
          <oc-icon role="button" class="oc-cursor-pointer" size="medium" @click="next" name="chevron_right" />
          <oc-icon role="button" class="oc-cursor-pointer" @click="downloadImage" name="file_download"  />
          <oc-icon role="button" class="oc-cursor-pointer" @click="closeApp" name="close"/>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
import queryString from 'query-string'

export default {
  name: 'Mediaviewer',
  data () {
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

  watch: {
    activeIndex (o, n) {
      if (o !== n) {
        this.loadImage()
      }
    }
  },

  methods: {
    loadImage () {
      this.loading = true

      // Don't bother loading if files i chached
      if (this.activeMediaFileCached) {
        setTimeout(() => {
          this.image = this.activeMediaFileCached
          this.loading = false
        },
        // Delay to animate
        this.animationDuration / 2)
        return
      }

      // Fetch image
      this.mediaSource(this.thumbPath, 'url', this.headers).then(imageUrl => {
        this.images.push({
          id: this.activeMediaFile.id,
          name: this.activeMediaFile.name,
          url: imageUrl
        })
        this.image = this.activeMediaFileCached
        this.loading = false
        this.failed = false
      }).catch(e => {
        this.loading = false
        this.failed = true
      })
    },
    downloadImage () {
      if (this.loading) {
        return
      }

      return this.downloadFile(this.mediaFiles[this.activeIndex])
    },
    next () {
      if (this.loading) { return }

      this.direction = 'rtl'
      if ((this.activeIndex + 1) >= this.mediaFiles.length) {
        this.activeIndex = 0
        return
      }
      this.activeIndex++
    },
    prev () {
      if (this.loading) { return }

      this.direction = 'ltr'
      if (this.activeIndex === 0) {
        this.activeIndex = this.mediaFiles.length - 1
        return
      }
      this.activeIndex--
    },
    handleKeyPress (e) {
      if (!e) return false
      else if (e.key === 'ArrowRight') this.next()
      else if (e.key === 'ArrowLeft') this.prev()
    },
    closeApp () {
      this.$router.go(-1)
    }
  },

  mounted () {
    document.addEventListener('keyup', this.handleKeyPress)

    // Return if no Image is selected
    if (this.$store.getters.activeFile.path === '') {
      this.$router.push({
        path: '/files'
      })
      return
    }

    // Set initial file
    for (let i = 0; i < this.mediaFiles.length; i++) {
      if (this.mediaFiles[i].path === this.$store.getters.activeFile.path) {
        this.activeIndex = i
        break
      }
    }
  },

  beforeDestroy () {
    document.removeEventListener('keyup', this.handleKeyPress)

    this.images.forEach(image => {
      window.URL.revokeObjectURL(image.url)
    })
  },

  computed: {
    ...mapGetters('Files', ['activeFiles', 'publicLinkPassword']),
    ...mapGetters(['getToken']),

    mediaFiles () {
      return this.activeFiles.filter(file => {
        return file.extension.toLowerCase().match(/(png|jpg|jpeg|gif)/)
      })
    },
    activeMediaFile () {
      return this.mediaFiles[this.activeIndex]
    },
    activeMediaFileCached () {
      const cached = this.images.find(i => i.id === this.activeMediaFile.id)
      return (cached !== undefined) ? cached : false
    },
    activeClass () {
      const direction = ['right', 'left']

      if (this.direction === 'ltr') { direction.reverse() }

      return {
        enter: `uk-animation-slide-${direction[0]}-small`,
        leave: `uk-animation-slide-${direction[1]}-medium uk-animation-reverse`
      }
    },
    thumbDimensions () {
      switch (true) {
        case (window.innerWidth <= 1024) : return 1024
        case (window.innerWidth <= 1280) : return 1280
        case (window.innerWidth <= 1920) : return 1920
        case (window.innerWidth <= 2160) : return 2160
        default: return 3840
      }
    },
    headers () {
      if (!this.publicPage()) {
        return null
      }

      const headers = new Headers()
      headers.append('X-Requested-With', 'XMLHttpRequest')

      const password = this.publicLinkPassword
      if (password) {
        headers.append('Authorization', 'Basic ' + Buffer.from('public:' + password).toString('base64'))
      }
      return headers
    },
    thumbPath () {
      const query = queryString.stringify({
        x: this.thumbDimensions,
        y: this.thumbDimensions,
        c: this.activeMediaFile.etag,
        scalingup: 0,
        preview: 1,
        a: 1
      })

      this.activeMediaFile.path = this.activeMediaFile.path.replace(/^\//, '');
      if (this.publicPage()) {
        const path = [
          '..',
          'webdav',
          this.activeMediaFile.path
        ].join('/')

        return this.$client.files.getFileUrl(path) + '?' + query
      }
      const path = [
        '..',
        'webdav',
        this.$store.getters.user.id,
        this.activeMediaFile.path
      ].join('/')

      return this.$client.files.getFileUrl(path) + '?' + query
    }
  }
}
</script>
