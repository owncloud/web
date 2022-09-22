<template>
  <div class="space-header" :class="{ 'oc-flex': imageContent && !imageExpanded }">
    <div v-if="imageContent" :class="{ 'oc-width-1-4 oc-mr-l': !imageExpanded }">
      <img
        :class="{ expanded: imageExpanded }"
        class="space-header-image oc-cursor-pointer"
        alt=""
        :src="imageContent"
        @click="toggleImageExpanded"
      />
    </div>
    <div :class="{ 'oc-width-3-4': imageContent && !imageExpanded }">
      <div class="oc-flex oc-mb-s oc-flex-middle oc-flex-between">
        <div class="oc-flex oc-flex-middle">
          <h1 class="space-header-name oc-text-truncate">{{ space.name }}</h1>
          <oc-button
            :id="`space-context-btn`"
            v-oc-tooltip="$gettext('Show context menu')"
            :aria-label="$gettext('Show context menu')"
            appearance="raw"
            class="oc-ml-s"
          >
            <oc-icon name="more-2" />
          </oc-button>
          <oc-drop
            :drop-id="`space-context-drop`"
            :toggle="`#space-context-btn`"
            mode="click"
            close-on-click
            :options="{ delayHide: 0 }"
            padding-size="small"
            position="right-start"
          >
            <space-context-actions :items="[space]" :space="space" />
          </oc-drop>
        </div>
        <oc-button
          v-if="memberCount"
          :aria-label="$gettext('Open context menu and show members')"
          appearance="raw"
          @click="openSideBarSharePanel"
        >
          <oc-icon name="group" fill-type="line" size="small" />
          <span class="space-header-people-count oc-text-small" v-text="memberCountString"></span>
        </oc-button>
      </div>
      <p v-if="space.description" class="oc-mt-rm">{{ space.description }}</p>
      <div>
        <!-- eslint-disable vue/no-v-html -->
        <div ref="markdownContainerRef" class="markdown-container" v-html="markdownContent"></div>
        <!-- eslint-enable -->
        <div v-if="showMarkdownCollapse" class="markdown-collapse oc-text-center oc-mt-s">
          <oc-button appearance="raw" @click="toggleMarkdownCollapsed">
            <oc-icon :name="toggleMarkdownCollapsedIcon" />
            <span>{{ toggleMarkdownCollapsedText }}</span>
          </oc-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  unref,
  watch
} from '@vue/composition-api'
import { buildWebDavSpacesPath, SpaceResource } from 'web-client/src/helpers'
import { buildResource } from '../../helpers/resources'
import { loadPreview } from 'web-pkg/src/helpers'
import {
  useAccessToken,
  useAppFileHandling,
  useClientService,
  useStore,
  useTranslations
} from 'web-pkg/src/composables'
import { ImageDimension } from '../../constants'
import { configurationManager } from 'web-pkg/src/configuration'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import SpaceContextActions from './SpaceContextActions.vue'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../composables/sideBar'
import { useGraphClient } from 'web-client/src/composables'

const visibilityObserver = new VisibilityObserver()
const markdownContainerCollapsedClass = 'collapsed'

export default defineComponent({
  name: 'SpaceHeader',
  components: {
    SpaceContextActions
  },
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    }
  },
  setup(props) {
    const { $gettext, $ngettext, $gettextInterpolate } = useTranslations()
    const { getFileContents, getFileInfo } = useAppFileHandling({
      clientService: useClientService(),
      isPublicLinkContext: false,
      publicLinkPassword: ''
    })
    const store = useStore()
    const userId = computed(() => store.getters.user?.id)
    const accessToken = useAccessToken({ store })
    const { graphClient } = useGraphClient({ store })

    const markdownContainerRef = ref(null)
    const markdownContent = ref('')
    const markdownCollapsed = ref(true)
    const showMarkdownCollapse = ref(false)
    const toggleMarkdownCollapsedIcon = computed(() => {
      return unref(markdownCollapsed) ? 'add' : 'subtract'
    })
    const toggleMarkdownCollapsedText = computed(() => {
      return unref(markdownCollapsed) ? $gettext('Show more') : $gettext('Show less')
    })
    const toggleMarkdownCollapsed = () => {
      markdownCollapsed.value = !unref(markdownCollapsed)
      unref(markdownContainerRef).classList.toggle(markdownContainerCollapsedClass)
    }
    const onMarkdownResize = () => {
      if (!unref(markdownContainerRef)) {
        return
      }

      unref(markdownContainerRef).classList.remove(markdownContainerCollapsedClass)
      const markdownContainerHeight = unref(markdownContainerRef).offsetHeight
      if (markdownContainerHeight < 150) {
        showMarkdownCollapse.value = false
        return
      }
      showMarkdownCollapse.value = true

      if (unref(markdownCollapsed)) {
        unref(markdownContainerRef).classList.add(markdownContainerCollapsedClass)
      }
    }
    const markdownResizeObserver = new ResizeObserver(onMarkdownResize)
    const observeMarkdownContainerResize = () => {
      if (!markdownResizeObserver || !unref(markdownContainerRef)) {
        return
      }
      markdownResizeObserver.unobserve(unref(markdownContainerRef))
      markdownResizeObserver.observe(unref(markdownContainerRef))
    }
    const unobserveMarkdownContainerResize = () => {
      if (!markdownResizeObserver || !unref(markdownContainerRef)) {
        return
      }
      markdownResizeObserver.unobserve(unref(markdownContainerRef))
    }
    onMounted(observeMarkdownContainerResize)
    onBeforeUnmount(() => {
      visibilityObserver.disconnect()
      unobserveMarkdownContainerResize()
    })
    watch(
      computed(() => props.space.spaceReadmeData),
      async (data: any) => {
        if (!data) {
          return
        }
        const decodedUri = decodeURI(data.webDavUrl)
        const webDavPathComponents = decodedUri.split('/')
        const idComponent = webDavPathComponents.find((c) => c.startsWith(props.space.id as string))
        if (!idComponent) {
          return
        }
        const path = webDavPathComponents
          .slice(webDavPathComponents.indexOf(idComponent) + 1)
          .join('/')

        const fileContentsResponse = await getFileContents(
          buildWebDavSpacesPath(idComponent, decodeURIComponent(path)),
          {}
        )
        unobserveMarkdownContainerResize()
        const parsedMarkdown = marked.parse(fileContentsResponse.body)
        // Sanitize markdown content to prevent XSS vulnerabilities
        markdownContent.value = sanitizeHtml(parsedMarkdown)

        if (unref(markdownContent)) {
          observeMarkdownContainerResize()
        }
      },
      { deep: true, immediate: true }
    )

    const imageContent = ref(null)
    const imageExpanded = ref(false)
    const toggleImageExpanded = () => {
      imageExpanded.value = !unref(imageExpanded)
    }
    watch(
      computed(() => props.space.spaceImageData),
      async (data) => {
        if (!data) {
          return
        }
        const decodedUri = decodeURI(props.space.spaceImageData.webDavUrl)
        const webDavPathComponents = decodedUri.split('/')
        const idComponent = webDavPathComponents.find((c) => c.startsWith(props.space.id as string))
        if (!idComponent) {
          return
        }
        const path = webDavPathComponents
          .slice(webDavPathComponents.indexOf(idComponent) + 1)
          .join('/')

        const fileInfo = await getFileInfo(
          buildWebDavSpacesPath(idComponent, decodeURIComponent(path)),
          undefined
        )
        const resource = buildResource(fileInfo)
        imageContent.value = await loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Preview,
          server: configurationManager.serverUrl,
          userId: unref(userId),
          token: unref(accessToken)
        })
      },
      { deep: true, immediate: true }
    )

    const memberCount = computed(() => {
      return store.getters['runtime/spaces/spaceMembers'].length
    })
    const memberCountString = computed(() => {
      const translated = $ngettext('%{count} member', '%{count} members', unref(memberCount))

      return $gettextInterpolate(translated, {
        count: unref(memberCount)
      })
    })

    const openSideBarSharePanel = () => {
      store.commit('Files/SET_SELECTED_IDS', [])
      bus.publish(SideBarEventTopics.openWithPanel, 'space-share-item')
    }

    return {
      markdownContainerRef,
      markdownContent,
      markdownCollapsed,
      showMarkdownCollapse,
      toggleMarkdownCollapsedIcon,
      toggleMarkdownCollapsedText,
      toggleMarkdownCollapsed,
      imageContent,
      imageExpanded,
      toggleImageExpanded,
      memberCount,
      memberCountString,
      openSideBarSharePanel
    }
  }
})
</script>

<style lang="scss">
.space-header {
  &-image {
    border-radius: 10px;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  &-image.expanded {
    max-height: 100%;
    max-width: 100%;
  }

  &-name {
    font-size: 1.5rem;
  }

  &-people-count {
    white-space: nowrap;
  }

  .markdown-container.collapsed {
    max-height: 150px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, #000 90%, transparent);
  }
}
</style>
