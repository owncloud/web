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
      @parent-folder-clicked="parentFolderClicked"
    />
  </oc-button>
</template>

<script lang="ts">
import { useFileActions } from '../../composables/actions/files/useFileActions'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension } from 'web-pkg/src/constants'
import { isResourceTxtFileAlmostEmpty } from '../../helpers/resources'
import { debounce } from 'lodash-es'
import { computed, defineComponent, ref, unref } from 'vue'
import { mapGetters } from 'vuex'
import { createLocationShares, createLocationSpaces } from '../../router'
import { basename, dirname } from 'path'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { buildShareSpaceResource, Resource } from 'web-client/src/helpers'
import { configurationManager } from 'web-pkg/src/configuration'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
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
  setup(props) {
    const previewData = ref()
    const resource = computed((): Resource => {
      return {
        ...(props.searchResult.data as Resource),
        ...(unref(previewData) &&
          ({
            thumbnail: unref(previewData)
          } as Resource))
      }
    })
    return {
      ...useFileActions(),
      hasShareJail: useCapabilityShareJailEnabled(),
      previewData,
      resource
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapGetters('runtime/spaces', ['spaces']),

    attrs() {
      return this.resource.isFolder
        ? {
            to: this.createFolderLink(this.resource.path, this.resource.fileId)
          }
        : {}
    },
    listeners() {
      return this.resource.isFolder
        ? {}
        : {
            click: () =>
              this.triggerDefaultAction({
                space: this.matchingSpace,
                resources: [this.resource]
              })
          }
    },
    matchingSpace() {
      const space = this.spaces.find((space) => space.id === this.resource.storageId)
      if (space) {
        return space
      }

      return buildShareSpaceResource({
        shareId: this.resource.shareId,
        shareName: basename(this.resource.shareRoot),
        serverUrl: configurationManager.serverUrl
      })
    },
    defaultParentFolderName() {
      if (this.resource.shareId) {
        return this.resource.path === '/'
          ? this.$gettext('Shared with me')
          : basename(this.resource.shareRoot)
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
      return (
        !this.configuration?.options?.disablePreviews &&
        !isResourceTxtFileAlmostEmpty(this.resource)
      )
    },
    folderLink() {
      return this.createFolderLink(this.resource.path, this.resource.fileId)
    },
    parentFolderLink() {
      if (this.resource.shareId && this.resource.path === '/') {
        return createLocationShares('files-shares-with-me')
      }
      return this.createFolderLink(dirname(this.resource.path), this.resource.parentFolderId)
    }
  },
  mounted() {
    if (!this.displayThumbnails) {
      return
    }

    const debounced = debounce(async ({ unobserve }) => {
      unobserve()
      const preview = await this.$previewService.loadPreview(
        {
          space: this.matchingSpace,
          resource: this.resource,
          dimensions: ImageDimension.Thumbnail
        },
        true
      )
      preview && (this.previewData = preview)
    }, 250)

    visibilityObserver.observe(this.$el, { onEnter: debounced, onExit: debounced.cancel })
  },
  beforeUnmount() {
    visibilityObserver.disconnect()
  },
  methods: {
    parentFolderClicked() {
      eventBus.publish('app.search.options-drop.hide')
    },
    createFolderLink(p: string, fileId: string | number) {
      if (!this.matchingSpace) {
        return {}
      }

      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(this.matchingSpace, { path: p, fileId })
      )
    }
  }
})
</script>
<style lang="scss">
.files-search-preview {
  font-size: inherit;
}
</style>
