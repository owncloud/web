<template>
  <InnerSideBar
    v-if="open"
    ref="sidebar"
    class="files-side-bar"
    tabindex="-1"
    :open="open"
    :active-panel="activePanel"
    :available-panels="availablePanels"
    :warning-message="warningMessage"
    :is-content-displayed="isContentDisplayed"
    :loading="loading"
    :is-header-compact="!!loadedResource"
    v-bind="$attrs"
    data-custom-key-bindings="true"
    @before-unmount="destroySideBar"
    @mounted="focusSideBar"
    @file-changed="focusSideBar"
    @select-panel="setActiveSideBarPanel"
    @close="closeSideBar"
  >
    <template #header>
      <file-info
        v-if="loadedResource && !highlightedFileIsSpace"
        class="sidebar-panel__file_info"
        :is-sub-panel-active="!!activePanel"
      />
      <space-info
        v-if="loadedResource && highlightedFileIsSpace"
        class="sidebar-panel__space_info"
      />
    </template>
  </InnerSideBar>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, provide, ref, unref, watch } from 'vue'
import { useGettext } from 'vue3-gettext'
import { useActiveLocation } from '../../composables'
import FileInfo from './FileInfo.vue'
import { isProjectSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { WebDAV } from 'web-client/src/webdav'
import { default as InnerSideBar } from 'web-pkg/src/components/sideBar/SideBar.vue'
import SpaceInfo from 'web-pkg/src/components/sideBar/Spaces/SpaceInfo.vue'
import { Panel } from 'web-pkg/src/components/sideBar'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive
} from '../../router'
import {
  useCapabilityShareJailEnabled,
  useClientService,
  useGraphClient,
  useStore,
  useRouter
} from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'

export default defineComponent({
  components: { FileInfo, SpaceInfo, InnerSideBar },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    activePanel: {
      type: String,
      required: false,
      default: null
    },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    }
  },
  setup(props) {
    const store = useStore()
    const router = useRouter()
    const { $gettext } = useGettext()
    const { owncloudSdk } = useClientService()
    const { graphClient } = useGraphClient()
    const { webdav } = useClientService()

    const loadedResource = ref()
    const loading = ref(false)

    const highlightedFile = computed(() => {
      return store.getters['Files/highlightedFile']
    })
    const selectedFiles = computed(() => {
      return store.getters['Files/selectedFiles']
    })
    const currentFolder = computed(() => {
      return store.getters['Files/currentFolder']
    })

    const isSharedWithMeLocation = useActiveLocation(isLocationSharesActive, 'files-shares-with-me')
    const isSharedWithOthersLocation = useActiveLocation(
      isLocationSharesActive,
      'files-shares-with-others'
    )
    const isSharedViaLinkLocation = useActiveLocation(
      isLocationSharesActive,
      'files-shares-via-link'
    )
    const isProjectsLocation = isLocationSpacesActive(router, 'files-spaces-projects')
    const isFavoritesLocation = useActiveLocation(isLocationCommonActive, 'files-common-favorites')
    const isSearchLocation = useActiveLocation(isLocationCommonActive, 'files-common-search')
    const isPublicFilesLocation = useActiveLocation(isLocationPublicActive, 'files-public-link')
    const isTrashLocation = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    const hasShareJail = useCapabilityShareJailEnabled()

    const closeSideBar = () => {
      eventBus.publish(SideBarEventTopics.close)
    }
    const setActiveSideBarPanel = (panelName) => {
      eventBus.publish(SideBarEventTopics.setActivePanel, panelName)
    }
    const focusSideBar = (component, event) => {
      component.focus({
        from: document.activeElement,
        to: component.sidebar?.$el,
        revert: event === 'beforeUnmount'
      })
    }
    const destroySideBar = (component, event) => {
      focusSideBar(component, event)
      eventBus.publish(SideBarEventTopics.close)
    }

    const isShareAccepted = computed(() => {
      return unref(highlightedFile)?.status === 0 || unref(highlightedFile)?.status === 1
    })
    const isContentDisplayed = computed(() => {
      return unref(isSharedWithMeLocation) ? unref(isShareAccepted) : true
    })
    const warningMessage = computed(() => {
      if (!unref(isShareAccepted)) {
        return $gettext('Please, accept this share first to display available actions')
      }

      return null
    })
    const areMultipleSelected = computed(() => {
      return unref(selectedFiles)?.length > 1
    })
    const isRootFolder = computed(() => {
      const pathSegments = unref(highlightedFile)?.path?.split('/').filter(Boolean) || []
      if (unref(isSharedWithMeLocation) || unref(isSearchLocation)) {
        return !unref(highlightedFile)
      }
      if (unref(hasShareJail) && props.space?.driveType === 'share') {
        return false
      }
      if (unref(isTrashLocation) && !unref(highlightedFile)?.id) {
        return true
      }
      if (props.space?.driveType === 'project') {
        return false
      }
      return !pathSegments.length
    })
    const highlightedFileIsSpace = computed(() => {
      return isProjectSpaceResource(unref(highlightedFile) || {})
    })
    const highlightedSpace = computed(() => {
      return store.getters['runtime/spaces/spaces'].find((s) => s.id === unref(highlightedFile).id)
    })
    const sharesLoadingDisabledOnCurrentRoute = computed(() => {
      return unref(isPublicFilesLocation) || unref(isTrashLocation)
    })
    const isShareLocation = computed(() => {
      return (
        unref(isSharedWithMeLocation) ||
        unref(isSharedWithOthersLocation) ||
        unref(isSharedViaLinkLocation)
      )
    })

    const availablePanels = computed((): Panel[] => {
      const { panels } = store.getters.fileSideBars.reduce(
        (result, panelGenerator) => {
          const panel = panelGenerator({
            capabilities: store.getters.capabilities,
            resource: unref(loadedResource),
            selectedFiles: unref(selectedFiles),
            router,
            multipleSelection: unref(areMultipleSelected),
            rootFolder: unref(isRootFolder),
            user: store.getters.user
          })

          if (panel.enabled) {
            result.panels.push(panel)
          }
          return result
        },
        { panels: [] }
      )

      return panels
    })

    const getSelectedResource = () => {
      if (unref(highlightedFileIsSpace) && unref(selectedFiles).length === 1) {
        return unref(highlightedSpace)
      }
      if (unref(selectedFiles).length === 1) {
        return unref(selectedFiles)[0]
      }
      if (unref(currentFolder)?.id && !unref(isRootFolder) && !unref(areMultipleSelected)) {
        return unref(currentFolder)
      }
      return null
    }
    const setLoadedResource = async (resource) => {
      if (!unref(isShareLocation)) {
        loadedResource.value = resource
        return
      }

      // shared resources look different, hence we need to fetch the actual resource here
      try {
        const shareResource = await (unref(webdav) as WebDAV).getFileInfo(props.space, {
          path: unref(highlightedFile).path
        })
        shareResource.share = unref(highlightedFile).share
        shareResource.status = unref(highlightedFile).status
        loadedResource.value = shareResource
      } catch (error) {
        loadedResource.value = resource
        console.error(error)
      }
    }

    const loadShares = () => {
      store.dispatch('Files/loadSharesTree', {
        client: owncloudSdk,
        path: unref(highlightedFile).path,
        storageId: unref(highlightedFile).fileId,
        includeRoot: true,
        // cache must not be used on flat file lists that gather resources form various locations
        useCached: !(
          unref(isSharedWithMeLocation) ||
          unref(isSharedWithOthersLocation) ||
          unref(isSharedViaLinkLocation) ||
          unref(isSearchLocation) ||
          unref(isFavoritesLocation)
        )
      })
    }

    watch(
      () => [...unref(selectedFiles), props.open],
      () => {
        if (!props.open) {
          return
        }
        if (
          unref(selectedFiles).length === 1 &&
          unref(loadedResource)?.id === unref(selectedFiles)[0].id
        ) {
          // current resource is already loaded
          return
        }

        loading.value = true
        let selectedResource = getSelectedResource()
        if (selectedResource) {
          if (!unref(sharesLoadingDisabledOnCurrentRoute)) {
            loadShares()
          }

          if (unref(highlightedFileIsSpace)) {
            store.dispatch('runtime/spaces/loadSpaceMembers', {
              graphClient: unref(graphClient),
              space: unref(highlightedSpace)
            })
          }

          setLoadedResource(selectedResource)
          loading.value = false
          return
        }

        const currentFolderRequired = !unref(isShareLocation) && !unref(isProjectsLocation)
        if (!currentFolderRequired || unref(currentFolder)) {
          loadedResource.value = null
          loading.value = false
        }
      },
      { deep: true }
    )

    provide(
      'resource',
      computed(() => unref(loadedResource))
    )
    provide(
      'space',
      computed(() => props.space)
    )
    provide(
      'activePanel',
      computed(() => props.activePanel)
    )

    return {
      loadedResource,
      setActiveSideBarPanel,
      closeSideBar,
      destroySideBar,
      focusSideBar,
      availablePanels,
      loading,
      warningMessage,
      isContentDisplayed,
      highlightedFileIsSpace
    }
  }
})
</script>

<style lang="scss">
.files-side-bar {
  z-index: 3;

  .sidebar-panel {
    &__file_info {
      background-color: var(--oc-color-background-default);
      padding: var(--oc-space-small) var(--oc-space-small) 0 var(--oc-space-small);
    }
  }

  ._clipboard-success-animation {
    animation-name: _clipboard-success-animation;
    animation-duration: 0.8s;
    animation-timing-function: ease-out;
    animation-fill-mode: both;
  }
}

@keyframes _clipboard-success-animation {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0;
  }
}
</style>
