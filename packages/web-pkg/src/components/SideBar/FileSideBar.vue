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
import PQueue from 'p-queue'
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
  useResourcesStore,
  useUserStore,
  useConfigStore
} from '../../composables'
import {
  isProjectSpaceResource,
  SpaceResource,
  Resource,
  CollaboratorShare,
  LinkShare,
  ShareRole,
  getGraphItemId,
  call
} from '@ownclouders/web-client/src/helpers'
import { storeToRefs } from 'pinia'
import { useTask } from 'vue-concurrency'
import {
  buildCollaboratorShare,
  buildLinkShare
} from '@ownclouders/web-client/src/helpers/share/functionsNG'
import { Permission } from '@ownclouders/web-client/src/generated'

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
    const isLoading = ref(false)

    const availableShareRoles = ref<ShareRole[]>([])

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

    const loadSharesTask = useTask(function* (signal, resource: Resource) {
      sharesStore.setLoading(true)

      sharesStore.removeOrphanedShares()
      const { collaboratorShares: collaboratorCache, linkShares: linkCache } = sharesStore

      const resourceId = getGraphItemId(resource)
      const { data } = yield* call(
        clientService.graphAuthenticated.permissions.listPermissions(props.space.id, resourceId)
      )

      let availableRoles =
        sharesStore.graphRoles.filter(
          (r) =>
            data['@libre.graph.permissions.roles.allowedValues']?.map(({ id }) => id).includes(r.id)
        ) || []

      // FIXME server bug, remove when https://github.com/owncloud/ocis/issues/8331 is resolved
      if (resource.isFolder) {
        availableRoles = availableRoles.filter(
          ({ id }) => id !== '2d00ce52-1fc2-4dbc-8b95-a73b73395f5a'
        )
      } else {
        availableRoles = availableRoles.filter(
          ({ id }) =>
            id !== 'fb6c3e19-e378-47e5-b277-9732f9de6e21' &&
            id !== '1c996275-f1c9-4e71-abdf-a42f6495e960'
        )
      }

      availableShareRoles.value = availableRoles

      const permissions = data.value || []

      const loadedCollaboratorShares: CollaboratorShare[] = []
      const loadedLinkShares: LinkShare[] = []

      const buildShares = ({
        p,
        resourceId,
        indirect = false
      }: {
        p: Permission[]
        resourceId: string
        indirect?: boolean
      }) => {
        p.forEach((graphPermission) => {
          if (!!graphPermission.link) {
            loadedLinkShares.push(
              buildLinkShare({ graphPermission, user: userStore.user, resourceId, indirect })
            )
            return
          }
          loadedCollaboratorShares.push(
            buildCollaboratorShare({
              graphPermission,
              graphRoles: sharesStore.graphRoles,
              resourceId,
              spaceId: getGraphItemId(props.space),
              user: userStore.user,
              indirect
            })
          )
        })
      }

      // load direct shares
      buildShares({ p: permissions, resourceId })

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

      const chachedIds = [...collaboratorCache, ...linkCache].map(({ resourceId }) => resourceId)
      const ancestorIds = Object.values(ancestorDataWithoutRoot)
        .map(({ id }) => id)
        .filter((id) => id !== resourceId && !chachedIds.includes(id))

      const queue = new PQueue({
        concurrency: configStore.options.concurrentRequests.shares.list
      })

      const promises = ancestorIds.map((id) => {
        return queue.add(() =>
          clientService.graphAuthenticated.permissions
            .listPermissions(props.space.id, id)
            .then((value) => {
              const data = value.data
              const permissions = ((data as any).value || []) as Permission[]
              buildShares({ p: permissions, resourceId: id, indirect: true })
            })
        )
      })

      yield Promise.allSettled(promises)
      sharesStore.setCollaboratorShares(loadedCollaboratorShares)
      sharesStore.setLinkShares(loadedLinkShares)

      if (isProjectSpaceResource(resource)) {
        // FIXME: do we need this?
        spacesStore.setSpaceMembers(sharesStore.collaboratorShares)
      }

      sharesStore.setLoading(false)
    }).restartable()

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

        isLoading.value = true
        if (!unref(isPublicFilesLocation) && !unref(isTrashLocation)) {
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
          isLoading.value = false
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
        isLoading.value = false
      },
      { deep: true, immediate: true }
    )

    provide('resource', readonly(loadedResource))
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
