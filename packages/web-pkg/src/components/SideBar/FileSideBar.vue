<template>
  <InnerSideBar
    v-if="isOpen"
    ref="sidebar"
    class="files-side-bar"
    tabindex="-1"
    :is-open="isOpen"
    :active-panel="activePanel"
    :available-panels="availablePanels"
    :panel-context="panelContext"
    :loading="isLoading"
    v-bind="$attrs"
    data-custom-key-bindings-disabled="true"
    @before-unmount="destroySideBar"
    @mounted="focusSideBar"
    @file-changed="focusSideBar"
    @select-panel="setActiveSideBarPanel"
    @close="closeSideBar"
  >
    <template #header>
      <file-info
        v-if="isFileHeaderVisible"
        class="sidebar-panel__file_info"
        :is-sub-panel-active="!!activePanel"
      />
      <space-info v-else-if="isSpaceHeaderVisible" class="sidebar-panel__space_info" />
    </template>
  </InnerSideBar>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, provide, readonly, ref, unref, watch } from 'vue'
import { SideBarPanelContext, SideBar as InnerSideBar } from '../SideBar'
import { SpaceInfo } from './Spaces'
import { FileInfo } from './Files'
import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive
} from '../../router'
import {
  SidebarPanelExtension,
  SideBarEventTopics,
  useClientService,
  useEventBus,
  useRouter,
  useActiveLocation,
  useExtensionRegistry,
  useSelectedResources,
  useSpacesStore,
  useSharesStore,
  useResourcesStore
} from '../../composables'
import {
  isProjectSpaceResource,
  SpaceResource,
  Resource
} from '@ownclouders/web-client/src/helpers'
import { storeToRefs } from 'pinia'
import { useTask } from 'vue-concurrency'

export default defineComponent({
  name: 'FileSideBar',
  components: { FileInfo, SpaceInfo, InnerSideBar },
  props: {
    isOpen: {
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
    const router = useRouter()
    const clientService = useClientService()
    const extensionRegistry = useExtensionRegistry()
    const eventBus = useEventBus()
    const spacesStore = useSpacesStore()
    const { loadShares } = useSharesStore()

    const resourcesStore = useResourcesStore()
    const { currentFolder, ancestorMetaData } = storeToRefs(resourcesStore)

    const loadedResource = ref<Resource>()
    const isLoading = ref(false)

    const versions = ref<Resource[]>([])
    provide('versions', versions)

    const { selectedResources } = useSelectedResources()

    const panelContext = computed<SideBarPanelContext<SpaceResource, Resource, Resource>>(() => {
      if (unref(selectedResources).length === 0) {
        return {
          root: props.space,
          parent: null,
          items: unref(currentFolder)?.id ? [unref(currentFolder)] : []
        }
      }
      return {
        root: props.space,
        parent: unref(currentFolder),
        items: unref(selectedResources)
      }
    })

    const fetchVersionsTask = useTask(function* () {
      try {
        if (unref(loadedResource).id) {
          versions.value = yield clientService.webdav.listFileVersions(unref(loadedResource).id)
        }
      } catch (e) {
        console.error(e)
      }
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
    const isFileHeaderVisible = computed(() => {
      return (
        unref(panelContext).items?.length === 1 &&
        !isProjectSpaceResource(unref(panelContext).items[0])
      )
    })
    const isSpaceHeaderVisible = computed(() => {
      return (
        unref(panelContext).items?.length === 1 &&
        isProjectSpaceResource(unref(panelContext).items[0])
      )
    })

    const isShareLocation = computed(() => {
      return (
        unref(isSharedWithMeLocation) ||
        unref(isSharedWithOthersLocation) ||
        unref(isSharedViaLinkLocation)
      )
    })
    const isFlatFileList = computed(() => {
      return unref(isShareLocation) || unref(isSearchLocation) || unref(isFavoritesLocation)
    })

    const availablePanels = computed(() =>
      extensionRegistry
        .requestExtensions<SidebarPanelExtension<SpaceResource, Resource, Resource>>(
          'sidebarPanel',
          ['resource']
        )
        .map((e) => e.panel)
    )

    watch(
      () => [...unref(panelContext).items, props.isOpen],
      async () => {
        if (!props.isOpen) {
          return
        }
        if (unref(panelContext).items?.length !== 1) {
          // don't load additional metadata for empty or multi-select contexts
          return
        }
        const resource = unref(panelContext).items[0]
        if (unref(loadedResource)?.id === resource.id) {
          // current resource is already loaded
          return
        }

        isLoading.value = true
        if (!unref(isPublicFilesLocation) && !unref(isTrashLocation)) {
          loadShares({
            clientService,
            resource,
            path: resource.path,
            storageId: resource.fileId,
            ancestorMetaData: unref(ancestorMetaData),
            // cache must not be used on flat file lists that gather resources from various locations
            useCached: !unref(isFlatFileList) && !unref(isProjectsLocation)
          })
        }

        if (isProjectSpaceResource(resource)) {
          spacesStore.loadSpaceMembers({
            graphClient: clientService.graphAuthenticated,
            space: resource
          })
        }

        if (!unref(isShareLocation)) {
          loadedResource.value = resource
          isLoading.value = false
          return
        }

        // shared resources look different, hence we need to fetch the actual resource here
        try {
          let shareResource = await clientService.webdav.getFileInfo(props.space, {
            path: resource.path
          })
          shareResource.share = resource.share
          shareResource.status = resource.status
          if (isProjectSpaceResource(resource)) {
            shareResource = { ...shareResource, ...resource }
          }
          loadedResource.value = shareResource
        } catch (error) {
          loadedResource.value = resource
          console.error(error)
        }
        isLoading.value = false
      },
      { deep: true }
    )

    watch(loadedResource, () => fetchVersionsTask.perform())

    provide('resource', readonly(loadedResource))
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
      panelContext,
      availablePanels,
      isLoading,
      isFileHeaderVisible,
      isSpaceHeaderVisible
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
