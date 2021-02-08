<template>
  <div
    class="oc-file uk-flex-inline uk-flex-middle uk-width-auto"
    :data-preview-loaded="previewLoaded"
  >
    <oc-img
      v-if="previewUrl"
      key="file-preview"
      class="files-list-file-preview oc-mr-s"
      :class="{ 'files-list-file-preview-small': !hasTwoRows }"
      :src="previewUrl"
      alt=""
    />
    <oc-icon
      v-else
      key="file-icon"
      :name="previewIcon"
      :size="hasTwoRows ? 'large' : 'medium'"
      aria-hidden="true"
      class="oc-mr-s"
      variation="file-type"
    />
    <div class="uk-width-expand">
      <div class="file-row-name uk-text-truncate" :filename="item.name">
        <span
          class="oc-text-bold oc-cursor-pointer oc-file-name oc-pl-rm"
          role="button"
          v-text="fileName"
        /><span
          v-if="item.extension"
          class="uk-text-meta oc-file-extension"
          v-text="'.' + item.extension"
        />
      </div>
      <div v-if="hasTwoRows && hasIndicators" class="uk-flex uk-flex-middle">
        <Indicators
          key="status-indicators"
          :default-indicators="indicators"
          :item="item"
          :are-indicators-clickable="areIndicatorsClickable"
          class="files-list-indicators"
        />
      </div>
    </div>
  </div>
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
    showPath: {
      type: Boolean,
      default: false
    },
    indicators: {
      type: Array,
      required: false,
      default: () => []
    },
    hasTwoRows: {
      type: Boolean,
      required: false,
      default: false
    },
    displayPreview: {
      type: Boolean,
      required: false,
      default: true
    },
    areIndicatorsClickable: {
      type: Boolean,
      required: false,
      default: true
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
        const pathSplit = this.item.path
          ? this.item.path.substr(1).split('/')
          : this.item.originalLocation.split('/')

        if (pathSplit.length === 2) {
          return `${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
        }

        if (pathSplit.length > 2) {
          return `…/${pathSplit[pathSplit.length - 2]}/${this.item.basename}`
        }
      }
      return this.item.basename
    },
    previewIcon() {
      return this.fileTypeIcon(this.item)
    },

    davUrl() {
      let davUrl
      // FIXME: use SDK once it switches to DAV v2
      if (this.publicPage()) {
        davUrl = ['..', 'dav', 'public-files'].join('/')
      } else {
        davUrl = ['..', 'dav', 'files', this.$store.getters.user.id].join('/')
      }
      return this.$client.files.getFileUrl(davUrl)
    },

    hasIndicators() {
      return this.indicators.length > 0
    }
  },
  mounted() {
    if (this.displayPreview) {
      this.loadPreview()
    } else {
      this.previewLoaded = 'disabled'
    }
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
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.files-list-file-preview-small {
  width: 24px;
  height: 24px;
  object-fit: cover;
}

.oc-file:hover .oc-file-name {
  text-decoration: none;
}

.oc-file .oc-file-name:hover {
  text-decoration: underline;
}
</style>
