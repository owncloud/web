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
      :path-prefix="pathPrefix"
      :is-path-displayed="true"
      :is-resource-clickable="false"
      :parent-folder-link="parentFolderLink"
      :parent-folder-link-icon-additional-attributes="parentFolderLinkIconAdditionalAttributes"
      :parent-folder-name="parentFolderName"
      :is-thumbnail-displayed="displayThumbnails"
      @parent-folder-clicked="parentFolderClicked"
    />
  </oc-button>
</template>

<script lang="ts">
import { ImageDimension } from '../../constants'
import { VisibilityObserver } from '../../observer'
import { debounce } from 'lodash-es'
import { computed, defineComponent, PropType, ref, unref } from 'vue'
import { mapGetters } from 'vuex'
import { createLocationShares, createLocationSpaces } from '../../router'
import path, { dirname } from 'path'
import {
  useCapabilityShareJailEnabled,
  useGetMatchingSpace,
  useFileActions,
  useFolderLink
} from '../../composables'
import {
  isProjectSpaceResource,
  isShareSpaceResource,
  Resource
} from '@ownclouders/web-client/src/helpers'
import { eventBus } from '../../services'
import { createFileRouteOptions, isResourceTxtFileAlmostEmpty } from '../../helpers'
import { SearchResultValue } from './types'
import { useGettext } from 'vue3-gettext'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  props: {
    searchResult: {
      type: Object as PropType<SearchResultValue>,
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
    const { getInternalSpace, getMatchingSpace } = useGetMatchingSpace()
    const { getPathPrefix, getParentFolderName, getParentFolderLinkIconAdditionalAttributes } =
      useFolderLink()
    const { $gettext } = useGettext()
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

    const space = computed(() => getMatchingSpace(unref(resource)))

    const resourceDisabled = computed(() => {
      return unref(resource).disabled === true
    })

    return {
      space,
      ...useFileActions(),
      getInternalSpace,
      getMatchingSpace,
      hasShareJail: useCapabilityShareJailEnabled(),
      previewData,
      resource,
      resourceDisabled,
      pathPrefix: getPathPrefix(unref(resource)),
      parentFolderName: getParentFolderName(unref(resource)),
      parentFolderLinkIconAdditionalAttributes: getParentFolderLinkIconAdditionalAttributes(
        unref(resource)
      )
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
                space: this.space,
                resources: [this.resource]
              })
          }
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
      if (isProjectSpaceResource(this.resource)) {
        return createLocationSpaces('files-spaces-projects')
      }
      return this.createFolderLink(dirname(this.resource.path), this.resource.parentFolderId)
    }
  },
  mounted() {
    if (this.resourceDisabled) {
      this.$el.parentElement.classList.add('disabled')
    }

    if (!this.displayThumbnails) {
      return
    }

    const debounced = debounce(async ({ unobserve }) => {
      unobserve()
      const preview = await this.$previewService.loadPreview(
        {
          space: this.space,
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
      if (!this.space) {
        return {}
      }

      return createLocationSpaces(
        'files-spaces-generic',
        createFileRouteOptions(this.space, { path: p, fileId })
      )
    }
  }
})
</script>
