<template>
  <oc-button
    :type="resource.isFolder ? 'router-link' : 'button'"
    justify-content="left"
    class="files-search-preview oc-flex oc-width-1-1"
    appearance="raw"
    v-bind="attrs"
    v-on="listeners"
  >
    <oc-resource
      :resource="resource"
      :is-path-displayed="true"
      :is-resource-clickable="false"
      :parent-folder-link="parentFolderLink"
      :parent-folder-name-default="defaultParentFolderName"
      :is-thumbnail-displayed="displayThumbnails"
    />
  </oc-button>
</template>

<script lang="ts">
import MixinFileActions from '../../mixins/fileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../../constants'
import { loadPreview } from 'web-pkg/src/helpers/preview'
import debounce from 'lodash-es/debounce'
import Vue from 'vue'
import { mapGetters, mapState } from 'vuex'
import { createLocationShares, createLocationSpaces } from '../../router'
import path from 'path'
import { useAccessToken, useCapabilityShareJailEnabled, useStore } from 'web-pkg/src/composables'
import { defineComponent } from '@vue/composition-api'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
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
    const store = useStore()
    return {
      hasShareJail: useCapabilityShareJailEnabled(),
      accessToken: useAccessToken({ store })
    }
  },
  computed: {
    ...mapGetters(['configuration', 'user']),
    ...mapState('runtime/spaces', ['spaces']),

    attrs() {
      return this.resource.isFolder
        ? {
            to: this.createFolderLink(this.resource.path, this.resource)
          }
        : {}
    },
    listeners() {
      return this.resource.isFolder
        ? {}
        : {
            click: () =>
              this.$_fileActions_triggerDefaultAction({
                space: this.matchingSpace,
                resources: [this.resource]
              })
          }
    },
    resource() {
      return this.searchResult.data
    },
    matchingSpace() {
      return this.spaces.find((space) => space.id === this.resource.storageId)
    },
    defaultParentFolderName() {
      if (this.resource.shareId) {
        return this.resource.path === '/'
          ? this.$gettext('Shared with me')
          : path.basename(this.resource.shareRoot)
      }

      if (!this.hasShareJail) {
        return this.$gettext('All files and folders')
      }

      if (this.matchingSpace?.driveType === 'project') {
        return this.matchingSpace.name
      }

      return this.$gettext('Personal')
    },
    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    },
    folderLink() {
      return this.createFolderLink(this.resource.path)
    },
    parentFolderLink() {
      if (this.resource.shareId && this.resource.path === '/') {
        return createLocationShares('files-shares-with-me')
      }
      return this.createFolderLink(path.dirname(this.resource.path))
    }
  },
  mounted() {
    if (!this.displayThumbnails) {
      return
    }

    const debounced = debounce(async ({ unobserve }) => {
      unobserve()
      const preview = await loadPreview(
        {
          resource: this.resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          server: this.configuration.server,
          userId: this.user.id,
          token: this.accessToken
        },
        true
      )
      preview && Vue.set(this.resource, ImageType.Thumbnail, preview)
    }, 250)

    visibilityObserver.observe(this.$el, { onEnter: debounced, onExit: debounced.cancel })
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },
  methods: {
    createFolderLink(p: string) {
      if (this.resource.shareId) {
        const shareName = path.basename(this.resource.shareRoot)
        return createLocationSpaces('files-spaces-generic', {
          params: {
            driveAliasAndItem: `share/${shareName}/${p.replace(/^\/+/, '')}`
          },
          query: {
            shareId: this.resource.shareId
          }
        })
      }

      if (!this.matchingSpace) {
        return {}
      }

      return createLocationSpaces('files-spaces-generic', {
        params: {
          driveAliasAndItem: [this.matchingSpace.driveAlias, p.split('/')].filter(Boolean).join('/')
        }
      })
    }
  }
})
</script>
<style lang="scss">
.files-search-preview {
  font-size: inherit;
}
</style>
