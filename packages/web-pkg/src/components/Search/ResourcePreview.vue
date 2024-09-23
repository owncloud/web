<template>
  <resource-list-item
    :resource="resource"
    :path-prefix="pathPrefix"
    :is-path-displayed="true"
    :link="resourceLink"
    :is-extension-displayed="areFileExtensionsShown"
    :parent-folder-link-icon-additional-attributes="parentFolderLinkIconAdditionalAttributes"
    :parent-folder-name="parentFolderName"
    :is-thumbnail-displayed="!!previewData"
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
  useResourcesStore,
  useLoadPreview
} from '../../composables'
import { isSpaceResource, Resource } from '@ownclouders/web-client'
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
    const { getDefaultAction } = useFileActions()
    const { loadPreview } = useLoadPreview()

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

    const previewData = ref<string>()

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

    const resourceLink = computed(() => {
      if (unref(resource).isFolder) {
        return getFolderLink(unref(resource))
      }

      const action = getDefaultAction({ resources: [unref(resource)], space: unref(space) })

      if (!action?.route) {
        return null
      }

      return action.route({ space: unref(space), resources: [unref(resource)] })
    })

    return {
      configOptions,
      space,
      previewData,
      loadPreview,
      resource,
      resourceDisabled,
      resourceClicked,
      resourceLink,
      parentFolderLink: getParentFolderLink(unref(resource)),
      pathPrefix: getPathPrefix(unref(resource)),
      parentFolderName: getParentFolderName(unref(resource)),
      parentFolderLinkIconAdditionalAttributes: getParentFolderLinkIconAdditionalAttributes(
        unref(resource)
      ),
      additionalAttrs,
      areFileExtensionsShown
    }
  },
  mounted() {
    if (this.resourceDisabled) {
      this.$el.parentElement.classList.add('disabled')
    }

    const loadPreview = async () => {
      const preview = await this.loadPreview({
        space: this.space,
        resource: this.resource,
        dimensions: ImageDimension.Thumbnail,
        cancelRunning: true,
        ignoreAlmostEmptyTxtFiles: true
      })

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
