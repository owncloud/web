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
import PQueue from 'p-queue'
import { SideBarPanelContext } from '../SideBar/types'
import InnerSideBar from '../SideBar/SideBar.vue'
import SpaceInfo from './Spaces/SpaceInfo.vue'
import FileInfo from './Files/FileInfo.vue'
import {
  isLocationCommonActive,
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
  useResourcesStore,
  useUserStore,
  useConfigStore
} from '../../composables'
import {
  isProjectSpaceResource,
  SpaceResource,
  Resource,
  ShareRole,
  call,
  isSpaceResource,
  isPersonalSpaceResource,
  isCollaboratorShare,
  isLinkShare
} from '@ownclouders/web-client'
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
    const sharesStore = useSharesStore()
    const userStore = useUserStore()
    const configStore = useConfigStore()

    const resourcesStore = useResourcesStore()
    const { currentFolder } = storeToRefs(resourcesStore)

    const loadedResource = ref<Resource>()
    const versions = ref<Resource[]>([])

    const availableShareRoles = ref<ShareRole[]>([])

    const { selectedResources } = useSelectedResources()

    const isMetaDataLoading = ref(false)

    const isLoading = computed(() => {
      return unref(isMetaDataLoading) || loadVersionsTask.isRunning
    })

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
    const isTrashLocation = useActiveLocation(isLocationTrashActive, 'files-trash-generic')

    const closeSideBar = () => {
      eventBus.publish(SideBarEventTopics.close)
    }
    const setActiveSideBarPanel = (panelName: string) => {
      eventBus.publish(SideBarEventTopics.setActivePanel, panelName)
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

    const userIsSpaceMember = computed(
      () =>
        (isProjectSpaceResource(props.space) && props.space.isMember(userStore.user)) ||
        (isPersonalSpaceResource(props.space) && props.space.isOwner(userStore.user))
    )

    const availablePanels = computed(() =>
      extensionRegistry
        .requestExtensions<SidebarPanelExtension<SpaceResource, Resource, Resource>>({
          id: 'global.files.sidebar',
          extensionType: 'sidebarPanel'
        })
        .map((e) => e.panel)
    )

    const loadVersionsTask = useTask(function* (signal, resource: Resource) {
      versions.value = yield clientService.webdav.listFileVersions(resource.id)
    })

    const loadSharesTask = useTask(function* (signal, resource: Resource) {
      sharesStore.setLoading(true)
      sharesStore.removeOrphanedShares()

      const { collaboratorShares: collaboratorCache, linkShares: linkCache } = sharesStore
      const client = clientService.graphAuthenticated.permissions

      // load direct shares
      const { shares, allowedRoles } = yield* call(
        client.listPermissions(
          props.space?.id,
          resource.id,
          isSpaceResource(resource),
          sharesStore.graphRoles
        )
      )

      const loadedCollaboratorShares = shares.filter(isCollaboratorShare)
      const loadedLinkShares = shares.filter(isLinkShare)

      availableShareRoles.value =
        sharesStore.graphRoles.filter((r) => allowedRoles?.map(({ id }) => id).includes(r.id)) || []

      // use cache for indirect shares
      const useCache = !unref(isFlatFileList) && !unref(isProjectsLocation)
      if (useCache) {
        collaboratorCache.forEach((share) => {
          if (loadedCollaboratorShares.some((s) => s.id === share.id)) {
            return
          }

          loadedCollaboratorShares.push({ ...share, indirect: true })
        })

        linkCache.forEach((share) => {
          if (loadedLinkShares.some((s) => s.id === share.id)) {
            return
          }

          loadedLinkShares.push({ ...share, indirect: true })
        })
      }

      // load uncached indirect shares
      const ancestorDataWithoutRoot = resourcesStore.ancestorMetaData
      if (Object.keys(resourcesStore.ancestorMetaData).includes('/')) {
        // filter out space roots because they don't have shares
        // (expect for project spaces, but they are loaded separately)
        delete ancestorDataWithoutRoot['/']
      }

      const cachedIds = [...collaboratorCache, ...linkCache].map(({ resourceId }) => resourceId)
      const ancestorIds = Object.values(ancestorDataWithoutRoot)
        .map(({ id }) => id)
        .filter((id) => id !== resource.id && !cachedIds.includes(id))

      const queue = new PQueue({
        concurrency: configStore.options.concurrentRequests.shares.list
      })

      const promises = ancestorIds.map((id) => {
        return queue.add(() =>
          clientService.graphAuthenticated.permissions
            .listPermissions(props.space?.id, id, false, sharesStore.graphRoles)
            .then((result) => {
              const indirectShares = result.shares.map((s) => ({ ...s, indirect: true }))
              loadedCollaboratorShares.push(...indirectShares.filter(isCollaboratorShare))
              loadedLinkShares.push(...indirectShares.filter(isLinkShare))
            })
        )
      })

      yield Promise.allSettled(promises)
      sharesStore.setCollaboratorShares(loadedCollaboratorShares)
      sharesStore.setLinkShares(loadedLinkShares)

      if (isProjectSpaceResource(resource)) {
        spacesStore.setSpaceMembers(sharesStore.collaboratorShares)
      } else if (isProjectSpaceResource(props.space)) {
        yield spacesStore.loadSpaceMembers({
          graphClient: clientService.graphAuthenticated,
          space: props.space
        })
      }

      sharesStore.setLoading(false)
    }).restartable()

    watch(
      () => [...unref(panelContext).items, props.isOpen],
      async () => {
        if (unref(panelContext).items?.length !== 1) {
          return
        }
        const resource = unref(panelContext).items[0]

        if (loadVersionsTask.isRunning) {
          loadVersionsTask.cancelAll()
        }

        if (
          !resource.isFolder &&
          !isSpaceResource(resource) &&
          unref(userIsSpaceMember) &&
          !unref(isTrashLocation)
        ) {
          try {
            await loadVersionsTask.perform(resource)
          } catch (e) {
            console.error(e)
          }
        }
      },
      { immediate: true, deep: true }
    )

    watch(
      () => [...unref(panelContext).items, props.isOpen],
      async () => {
        if (!props.isOpen) {
          sharesStore.pruneShares()
          loadedResource.value = null
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

        isMetaDataLoading.value = true
        if (unref(userIsSpaceMember) && !unref(isTrashLocation)) {
          try {
            if (loadSharesTask.isRunning) {
              loadSharesTask.cancelAll()
            }

            loadSharesTask.perform(resource)
          } catch (e) {
            console.error(e)
          }
        }

        if (!unref(isShareLocation)) {
          loadedResource.value = resource
          isMetaDataLoading.value = false
          return
        }

        // shared resources look different, hence we need to fetch the actual resource here
        try {
          let fullResource = await clientService.webdav.getFileInfo(props.space, {
            path: resource.path
          })

          // make sure props from the share (=resource) are available on the full resource as well
          fullResource = { ...fullResource, ...resource }
          loadedResource.value = fullResource
        } catch (error) {
          loadedResource.value = resource
          console.error(error)
        }
        isMetaDataLoading.value = false
      },
      {
        deep: true,
        immediate: true
      }
    )

    provide('resource', readonly(loadedResource))
    provide('versions', readonly(versions))
    provide(
      'space',
      computed(() => props.space)
    )
    provide(
      'activePanel',
      computed(() => props.activePanel)
    )
    provide('availableShareRoles', readonly(availableShareRoles))

    return {
      loadedResource,
      setActiveSideBarPanel,
      closeSideBar,
      panelContext,
      availablePanels,
      isFileHeaderVisible,
      isSpaceHeaderVisible,
      isLoading,

      // unit tests
      loadSharesTask
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
