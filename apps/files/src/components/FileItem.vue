<template>
  <oc-file
    :name="fileName"
    :extension="item.extension"
    :icon="previewIcon"
    :iconUrl="previewUrl"
    :filename="item.name"
    :data-preview-loaded="previewLoaded"
    />
</template>
<script>
import queryString from 'query-string'
import Mixins from '../mixins'

export default {
  name: 'FileItem',
  mixins: [
    Mixins
  ],
  props: {
    item: {
      type: Object
    },
    // override for file name
    name: {
      type: String
    },
    davUrl: {
      type: String
    },
    showPath: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      previewUrl: this.item.previewUrl,
      // 'false' while the preview is loading (needs string for Vue.js to render the attribute)
      // true when the preview loading process is done,
      // even if we fell back to the mime type icon
      previewLoaded: 'false'
    }
  },
  computed: {
    fileName () {
      if (this.name) {
        return this.name
      }
      if (this.showPath) {
        const pathSplit = this.item.path.substr(1).split('/')
        if (pathSplit.length === 2) return `${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
        if (pathSplit.length > 2) return `…/${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
      }
      return this.item.basename
    },
    previewIcon () {
      return this.fileTypeIcon(this.item)
    }
  },
  mounted () {
    this.loadPreview()
  },
  methods: {
    loadPreview () {
      if (this.item.previewUrl) {
        this.previewUrl = this.item.previewUrl
        this.previewLoaded = true
        return
      }

      // TODO: check if previews are globally enabled (requires capability entry)
      // don't load previews for pending or rejected shares (status)
      if (!this.davUrl || this.item.type === 'folder' || (typeof this.item.status !== 'undefined' && this.item.status !== 0)) {
        this.previewLoaded = true
        return
      }

      const query = {
        x: this.thumbDimensions,
        y: this.thumbDimensions,
        scalingup: 0,
        preview: 1,
        a: 1
      }

      if (this.item.etag) {
        // add etag for URL based caching
        // strip double quotes from etag
        query.c = this.item.etag.substr(1, this.item.etag.length - 2)
      }

      let itemPath = this.item.path
      if (itemPath.charAt(0) === '/') {
        itemPath = itemPath.substr(1)
      }

      const previewUrl = this.davUrl + '/' + this.encodePath(itemPath) + '?' + queryString.stringify(query)

      this.mediaSource(previewUrl, 'url', this.requestHeaders).then(dataUrl => {
        // cache inside item
        this.previewUrl = this.item.previewUrl = dataUrl
        this.previewLoaded = true
      }).catch((e) => {
        this.previewUrl = null
        this.previewLoaded = true
      })
    }
  }
}
</script>
