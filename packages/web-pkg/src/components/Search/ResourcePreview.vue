<template>
  <oc-resource
    :resource="resource"
    :path-prefix="pathPrefix"
    :is-path-displayed="true"
    :is-resource-clickable="true"
    :folder-link="folderLink"
    :parent-folder-link="parentFolderLink"
    :parent-folder-link-icon-additional-attributes="parentFolderLinkIconAdditionalAttributes"
    :parent-folder-name="parentFolderName"
    :is-thumbnail-displayed="displayThumbnails"
    @click="resourceClicked"
    @click-folder="folderClicked"
    @click-parent-folder="folderClicked"
  />
</template>

<script lang="ts">
import { ImageDimension } from '../../constants'
import { VisibilityObserver } from '../../observer'
import { debounce } from 'lodash-es'
import { computed, defineComponent, PropType, ref, unref } from 'vue'
import { mapGetters } from 'vuex'
import {
  useCapabilityShareJailEnabled,
  useGetMatchingSpace,
  useFileActions,
  useFolderLink
} from '../../composables'
import { Resource } from '@ownclouders/web-client/src/helpers'
import { eventBus } from '../../services'
import { isResourceTxtFileAlmostEmpty } from '../../helpers'
import { SearchResultValue } from './types'

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
    const {
      getPathPrefix,
      getParentFolderName,
      getParentFolderLink,
      getParentFolderLinkIconAdditionalAttributes,
      getFolderLink
    } = useFolderLink()
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
      parentFolderLink: getParentFolderLink(unref(resource)),
      folderLink: getFolderLink(unref(resource)),
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

    displayThumbnails() {
      return (
        !this.configuration?.options?.disablePreviews &&
        !isResourceTxtFileAlmostEmpty(this.resource)
      )
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
    resourceClicked() {
      eventBus.publish('app.search.options-drop.hide')
      this.triggerDefaultAction({
        space: this.space,
        resources: [this.resource]
      })
    },
    folderClicked() {
      eventBus.publish('app.search.options-drop.hide')
    }
  }
})
</script>
