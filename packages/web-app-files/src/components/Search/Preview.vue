<template>
  <div class="files-search-preview" @click="$_fileActions_triggerDefaultAction(resource)">
    <oc-resource
      :resource="resource"
      :is-path-displayed="true"
      :folder-link="folderLink(resource)"
      :parent-folder-link="parentFolderLink(resource)"
      :parent-folder-name-default="defaultParentFolderName"
    />
  </div>
</template>

<script>
import MixinFileActions from '../../mixins/fileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension } from '../../constants'
import { loadPreview } from '../../helpers/resource'
import debounce from 'lodash-es/debounce'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { createLocationSpaces } from '../../router'
import path from 'path'
import { useCapabilitySpacesEnabled } from 'web-pkg/src/composables'

const visibilityObserver = new VisibilityObserver()

export default {
  mixins: [MixinFileActions],
  props: {
    searchResult: {
      type: Object,
      default: function () {
        return {}
      }
    },
    provider: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  setup() {
    return {
      hasSpaces: useCapabilitySpacesEnabled(),
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home')
    }
  },
  data() {
    return {
      resource: undefined
    }
  },
  computed: {
    ...mapGetters(['configuration', 'user', 'getToken']),

    defaultParentFolderName() {
      return this.hasSpaces ? this.$gettext('Personal') : this.$gettext('All files and folders')
    }
  },
  beforeMount() {
    this.resource = this.searchResult.data
  },
  mounted() {
    const debounced = debounce(async ({ unobserve }) => {
      unobserve()
      const preview = await loadPreview(
        {
          resource: this.resource,
          isPublic: false,
          dimensions: ImageDimension.ThumbNail,
          server: this.configuration.server,
          userId: this.user.id,
          token: this.getToken
        },
        true
      )
      preview && Vue.set(this.resource, 'preview', preview)
    }, 250)

    visibilityObserver.observe(this.$el, { onEnter: debounced, onExit: debounced.cancel })
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },
  methods: {
    folderLink(file) {
      return this.createFolderLink(file.path, file.storageId)
    },
    parentFolderLink(file) {
      return this.createFolderLink(path.dirname(file.path), file.storageId)
    },
    createFolderLink(path, storageId) {
      if (this.resourceTargetLocation === null) {
        return {}
      }
      return {
        name: this.resourceTargetLocation.name,
        query: this.resourceTargetLocation.query,
        params: {
          item: path.replace(/^\//, ''),
          ...this.resourceTargetLocation.params,
          ...(storageId && { storageId })
        }
      }
    }
  }
}
</script>

<style lang="scss">
.files-search-preview {
  button {
    font-size: 0.8rem;
  }
}
</style>
