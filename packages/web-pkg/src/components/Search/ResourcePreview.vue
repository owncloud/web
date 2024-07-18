<template>
  <resource-list-item
    :resource="resource"
    :path-prefix="pathPrefix"
    :is-path-displayed="true"
    :folder-link="folderLink"
    :is-extension-displayed="areFileExtensionsShown"
    :parent-folder-link-icon-additional-attributes="parentFolderLinkIconAdditionalAttributes"
    :parent-folder-name="parentFolderName"
    :is-thumbnail-displayed="displayThumbnails"
    v-bind="additionalAttrs"
  />
</template>

<script lang="ts">
import { ImageDimension } from '../../constants'
import { VisibilityObserver } from '../../observer'
import { debounce } from 'lodash-es'
import { computed, defineComponent, PropType, ref, unref } from 'vue'
import {
  useGetMatchingSpace,
  useFileActions,
  useFolderLink,
  useConfigStore,
  useResourcesStore
} from '../../composables'
import { isSpaceResource, Resource } from '@ownclouders/web-client'
import { isResourceTxtFileAlmostEmpty } from '../../helpers'
import ResourceListItem from '../FilesList/ResourceListItem.vue'
import { SearchResultValue } from './types'
import { storeToRefs } from 'pinia'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: { ResourceListItem },
  props: {
    searchResult: {
      type: Object as PropType<SearchResultValue>,
      default: function () {
        return {}
      }
    },
    isClickable: {
      type: Boolean,
      default: true
    }
  },
  setup(props) {
    const { triggerDefaultAction } = useFileActions()
    const { getMatchingSpace } = useGetMatchingSpace()
    const {
      getPathPrefix,
      getParentFolderName,
      getParentFolderLink,
      getParentFolderLinkIconAdditionalAttributes,
      getFolderLink
    } = useFolderLink()
    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)
    const resourcesStore = useResourcesStore()

    const previewData = ref()

    const areFileExtensionsShown = computed(() => resourcesStore.areFileExtensionsShown)

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
      const res = unref(resource)
      return isSpaceResource(res) && res.disabled === true
    })

    const resourceClicked = () => {
      triggerDefaultAction({
        space: unref(space),
        resources: [unref(resource)]
      })
    }

    const additionalAttrs = computed(() => {
      if (!props.isClickable) {
        return {
          isResourceClickable: false
        }
      }

      return {
        parentFolderLink: getParentFolderLink(unref(resource)),
        onClick: resourceClicked
      }
    })

    return {
      configOptions,
      space,
      previewData,
      resource,
      resourceDisabled,
      resourceClicked,
      parentFolderLink: getParentFolderLink(unref(resource)),
      folderLink: getFolderLink(unref(resource)),
      pathPrefix: getPathPrefix(unref(resource)),
      parentFolderName: getParentFolderName(unref(resource)),
      parentFolderLinkIconAdditionalAttributes: getParentFolderLinkIconAdditionalAttributes(
        unref(resource)
      ),
      additionalAttrs,
      areFileExtensionsShown
    }
  },
  computed: {
    displayThumbnails() {
      return !isResourceTxtFileAlmostEmpty(this.resource)
    }
  },
  mounted() {
    if (this.resourceDisabled) {
      this.$el.parentElement.classList.add('disabled')
    }

    if (!this.displayThumbnails) {
      return
    }

    const loadPreview = async () => {
      const preview = await this.$previewService.loadPreview(
        {
          space: this.space,
          resource: this.resource,
          dimensions: ImageDimension.Thumbnail
        },
        true
      )

      preview && (this.previewData = preview)
    }

    const debounced = debounce(({ unobserve }) => {
      unobserve()
      loadPreview()
    }, 250)

    visibilityObserver.observe(this.$el, { onEnter: debounced, onExit: debounced.cancel })
  },
  beforeUnmount() {
    visibilityObserver.disconnect()
  }
})
</script>
