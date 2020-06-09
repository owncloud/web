<template>
  <oc-grid
    gutter="small"
    class="oc-file uk-flex-inline uk-flex-middle"
    :filename="item.name"
    :data-preview-loaded="previewLoaded"
  >
    <oc-img
      v-if="previewUrl"
      key="file-preview"
      class="files-list-file-preview"
      :src="previewUrl"
      alt=""
    />
    <oc-icon v-else key="file-icon" :name="previewIcon" size="medium" aria-hidden="true" />
    <div>
      <div>
        <span class="uk-text-bold oc-cursor-pointer" role="button" v-text="fileName" /><span
          v-if="item.extension"
          class="uk-text-meta"
          v-text="'.' + item.extension"
        />
      </div>
      <Indicators
        v-if="indicators.length > 0"
        key="status-indicators"
        :default-indicators="indicators"
        :item="item"
      />
      <span v-else key="no-status-indicators" aria-hidden="true" v-text="'-'" />
    </div>
  </oc-grid>
</template>
<script>
import queryString from 'query-string'
import Mixins from '../mixins'

import Indicators from './FilesLists/Indicators.vue'

export default {
  name: 'FileItem',

  components: {
    Indicators
  },

  mixins: [Mixins],

  props: {
    item: {
      type: Object,
      required: true
    },
    // override for file name
    name: {
      type: String,
      required: false,
      default: undefined
    },
    davUrl: {
      type: String,
      required: false,
      default: undefined
    },
    showPath: {
      type: Boolean,
      default: false
    },
    indicators: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  data: function() {
    return {
      previewUrl: this.item.previewUrl,
      // 'false' while the preview is loading (needs string for Vue.js to render the attribute)
      // true when the preview loading process is done,
      // even if we fell back to the mime type icon
      previewLoaded: 'false'
    }
  },
  computed: {
    fileName() {
      if (this.name) {
        return this.name
      }
      if (this.showPath) {
        const pathSplit = this.item.path.substr(1).split('/')
        if (pathSplit.length === 2)
          return `${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
        if (pathSplit.length > 2)
          return `…/${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
      }
      return this.item.basename
    },
    previewIcon() {
      return this.fileTypeIcon(this.item)
    }
  },
  mounted() {
    this.loadPreview()
  },
  methods: {
    loadPreview() {
      if (this.item.previewUrl) {
        this.previewUrl = this.item.previewUrl
        this.previewLoaded = true
        return
      }

      // TODO: check if previews are globally enabled (requires capability entry)
      // don't load previews for pending or rejected shares (status)
      if (
        !this.davUrl ||
        this.item.type === 'folder' ||
        (typeof this.item.status !== 'undefined' && this.item.status !== 0)
      ) {
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

      const previewUrl =
        this.davUrl + '/' + this.encodePath(itemPath) + '?' + queryString.stringify(query)

      this.mediaSource(previewUrl, 'url', this.requestHeaders)
        .then(dataUrl => {
          // cache inside item
          this.previewUrl = this.item.previewUrl = dataUrl
          this.previewLoaded = true
        })
        .catch(e => {
          this.previewUrl = null
          this.previewLoaded = true
        })
    }
  }
}
</script>

<style scoped>
.files-list-file-preview {
  width: 50px;
}
</style>
