<template>
  <div
    class="space-header oc-p-m"
    :class="{ 'oc-flex': !imageExpanded && !isMobileWidth, 'space-header-squashed': isSideBarOpen }"
  >
    <div
      class="space-header-image"
      :class="{ 'space-header-image-expanded': imageExpanded || isMobileWidth }"
    >
      <img
        v-if="hasImage"
        class="oc-cursor-pointer"
        alt=""
        :src="imageContent"
        @click="toggleImageExpanded"
      />
      <div v-else class="space-header-image-default oc-flex oc-flex-middle oc-flex-center">
        <oc-icon name="layout-grid" size="xxlarge" class="oc-px-m oc-py-m" />
      </div>
    </div>
    <div class="space-header-infos">
      <div class="oc-flex oc-mb-s oc-flex-middle oc-flex-between">
        <div class="oc-flex oc-flex-middle space-header-infos-heading">
          <h2 class="space-header-name">{{ space.name }}</h2>
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
            <space-context-actions :action-options="{ resources: [space] }" />
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
      <p v-if="space.description" class="oc-mt-rm oc-text-bold">{{ space.description }}</p>
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
  inject,
  onBeforeUnmount,
  onMounted,
  PropType,
  Ref,
  ref,
  unref,
  watch
} from 'vue'
import { SpaceResource } from '@ownclouders/web-client/src/helpers'
import { useClientService, useStore, usePreviewService } from '@ownclouders/web-pkg'
import { ImageDimension } from '@ownclouders/web-pkg'
import { VisibilityObserver } from '@ownclouders/web-pkg'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import SpaceContextActions from './SpaceContextActions.vue'
import { eventBus } from '@ownclouders/web-pkg'
import { SideBarEventTopics } from '@ownclouders/web-pkg'
import { useGettext } from 'vue3-gettext'

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
    },
    isSideBarOpen: { type: Boolean, default: false }
  },
  setup(props) {
    const language = useGettext()
    const { $gettext, $ngettext } = language
    const clientService = useClientService()
    const { getFileContents, getFileInfo } = clientService.webdav
    const store = useStore()
    const previewService = usePreviewService()

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

        const fileContentsResponse = await getFileContents(props.space, {
          path: decodeURIComponent(path)
        })

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

        const resource = await getFileInfo(props.space, {
          path: decodeURIComponent(path)
        })
        imageContent.value = await previewService.loadPreview({
          space: props.space,
          resource,
          dimensions: ImageDimension.Preview
        })
      },
      { deep: true, immediate: true }
    )
    const hasImage = computed(() => {
      return props.space?.spaceImageData
    })

    const memberCount = computed(() => {
      return store.getters['runtime/spaces/spaceMembers'].length
    })
    const memberCountString = computed(() => {
      return $ngettext('%{count} member', '%{count} members', unref(memberCount), {
        count: unref(memberCount)
      })
    })

    const openSideBarSharePanel = () => {
      store.commit('Files/SET_SELECTED_IDS', [])
      eventBus.publish(SideBarEventTopics.openWithPanel, 'space-share')
    }

    return {
      isMobileWidth: inject<Ref<boolean>>('isMobileWidth'),
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
      hasImage,
      memberCount,
      memberCountString,
      openSideBarSharePanel
    }
  }
})
</script>

<style lang="scss">
.space-header {
  &-squashed {
    .space-header-image {
      @media only screen and (max-width: 1200px) {
        display: none;
      }
    }
  }

  &-image {
    width: 280px;
    min-width: 280px;
    aspect-ratio: 16 / 9;
    margin-right: var(--oc-space-large);
    max-height: 158px;
    &-default {
      background-color: var(--oc-color-background-highlight);
      height: 100%;
      border-radius: 10px;
    }
    &-expanded {
      width: 100%;
      margin: 0;
      max-height: 100%;
      max-width: 100%;
    }
    img {
      border-radius: 10px;
      height: 100%;
      width: 100%;
      max-height: 100%;
      object-fit: cover;
    }
  }

  &-infos {
    flex: 1;
    &-heading {
      max-width: 100%;
    }
  }

  &-name {
    font-size: 1.5rem;
    word-break: break-all;
  }

  &-people-count {
    white-space: nowrap;
  }

  .markdown-container.collapsed {
    max-height: 100px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, #000 90%, transparent);
  }
}
</style>
