<template>
  <div
    id="files-app-bar"
    ref="filesAppBar"
    :class="{ 'files-app-bar-squashed': isSideBarOpen, 'files-app-bar-sticky': isSticky }"
  >
    <div class="files-topbar oc-py-s">
      <h1 class="oc-invisible-sr" v-text="pageTitle" />
      <oc-hidden-announcer :announcement="selectedResourcesAnnouncement" level="polite" />
      <div
        class="oc-flex oc-flex-middle files-app-bar-controls"
        :class="{
          'oc-flex-between': breadcrumbs.length || hasSharesNavigation,
          'oc-flex-right': !breadcrumbs.length && !hasSharesNavigation
        }"
      >
        <oc-breadcrumb
          v-if="showBreadcrumb"
          id="files-breadcrumb"
          data-testid="files-breadcrumbs"
          class="oc-flex oc-flex-middle"
          context-menu-padding="small"
          :show-context-actions="showContextActions"
          :items="breadcrumbs"
          :max-width="breadcrumbMaxWidth"
          :truncation-offset="breadcrumbTruncationOffset"
          @item-dropped-breadcrumb="fileDroppedBreadcrumb"
        >
          <template #contextMenu>
            <context-actions
              :action-options="{ space, resources: breadcrumbsContextActionsItems.filter(Boolean) }"
            />
          </template>
        </oc-breadcrumb>
        <portal-target v-if="showMobileNav" name="app.runtime.mobile.nav" />
        <slot v-if="hasSharesNavigation" name="navigation" />
        <div v-if="hasViewOptions" id="files-app-bar-controls-right" class="oc-flex">
          <view-options
            :view-modes="viewModes"
            :has-hidden-files="hasHiddenFiles"
            :has-file-extensions="hasFileExtensions"
            :has-pagination="hasPagination"
            :should-show-flat-list-toggle="true"
            per-page-storage-prefix="files"
            :view-mode-default="viewModeDefault"
          />
        </div>
      </div>
      <div class="files-app-bar-actions oc-mt-xs">
        <div class="oc-flex-1 oc-flex oc-flex-start oc-flex-middle">
          <slot name="actions" :limited-screen-space="limitedScreenSpace" />
          <batch-actions
            v-if="showBatchActions"
            :actions="batchActions"
            :action-options="{ space, resources: selectedResources }"
            :limited-screen-space="limitedScreenSpace"
          />
        </div>
      </div>
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts">
import last from 'lodash-es/last'
import { computed, defineComponent, inject, PropType, ref, Ref, unref, useSlots } from 'vue'
import { Resource } from '@ownclouders/web-client'
import {
  isPersonalSpaceResource,
  isProjectSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from '@ownclouders/web-client'
import BatchActions from '../BatchActions.vue'
import ContextActions from '../FilesList/ContextActions.vue'
import ViewOptions from '../ViewOptions.vue'
import { isLocationCommonActive, isLocationTrashActive } from '../../router'
import { FolderView } from '../../ui/types'
import {
  useFileActionsEnableSync,
  useFileActionsCopy,
  useFileActionsDisableSync,
  useFileActionsDelete,
  useFileActionsDownloadArchive,
  useFileActionsDownloadFile,
  useFileActionsEmptyTrashBin,
  useFileActionsMove,
  useFileActionsRestore,
  useSpaceActionsDuplicate,
  useFileActionsDuplicate
} from '../../composables/actions'
import {
  useAbility,
  useFileActionsToggleHideShare,
  useResourcesStore,
  useRouteMeta,
  useSpacesStore,
  useRouter,
  FolderViewModeConstants,
  useExtensionRegistry,
  ActionExtension,
  useIsTopBarSticky
} from '../../composables'
import { BreadcrumbItem, EVENT_ITEM_DROPPED } from '@ownclouders/design-system/helpers'
import { useActiveLocation } from '../../composables'
import { useGettext } from 'vue3-gettext'
import {
  FileAction,
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsEditQuota,
  useSpaceActionsRestore
} from '../../composables'
import { storeToRefs } from 'pinia'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  components: {
    BatchActions,
    ContextActions,
    ViewOptions
  },
  props: {
    viewModeDefault: {
      type: String,
      required: false,
      default: () => FolderViewModeConstants.name.table
    },
    breadcrumbs: {
      type: Array as PropType<BreadcrumbItem[]>,
      default: (): BreadcrumbItem[] => []
    },
    breadcrumbsContextActionsItems: {
      type: Array as PropType<Resource[]>,
      default: (): Resource[] => []
    },
    viewModes: {
      type: Array as PropType<FolderView[]>,
      default: (): FolderView[] => []
    },
    hasBulkActions: { type: Boolean, default: false },
    hasViewOptions: { type: Boolean, default: true },
    hasHiddenFiles: { type: Boolean, default: true },
    hasFileExtensions: { type: Boolean, default: true },
    hasPagination: { type: Boolean, default: true },
    showActionsOnSelection: { type: Boolean, default: false },
    isSideBarOpen: { type: Boolean, default: false },
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    }
  },
  setup(props, { emit }) {
    const spacesStore = useSpacesStore()
    const { $gettext } = useGettext()
    const { can } = useAbility()
    const router = useRouter()
    const { requestExtensions } = useExtensionRegistry()
    const { isSticky } = useIsTopBarSticky()

    const resourcesStore = useResourcesStore()
    const { selectedResources } = storeToRefs(resourcesStore)

    const space = computed(() => props.space)

    const { actions: enableSyncActions } = useFileActionsEnableSync()
    const { actions: hideShareActions } = useFileActionsToggleHideShare()
    const { actions: copyActions } = useFileActionsCopy()
    const { actions: duplicateActions } = useSpaceActionsDuplicate()
    const { actions: disableSyncActions } = useFileActionsDisableSync()
    const { actions: deleteActions } = useFileActionsDelete()
    const { actions: downloadArchiveActions } = useFileActionsDownloadArchive()
    const { actions: downloadFileActions } = useFileActionsDownloadFile()
    const { actions: emptyTrashBinActions } = useFileActionsEmptyTrashBin()
    const { actions: moveActions } = useFileActionsMove()
    const { actions: restoreActions } = useFileActionsRestore()
    const { actions: deleteSpaceActions } = useSpaceActionsDelete()
    const { actions: disableSpaceActions } = useSpaceActionsDisable()
    const { actions: editSpaceQuotaActions } = useSpaceActionsEditQuota()
    const { actions: restoreSpaceActions } = useSpaceActionsRestore()
    const { actions: duplicateResourcesActions } = useFileActionsDuplicate()

    const breadcrumbMaxWidth = ref<number>(0)
    const isSearchLocation = useActiveLocation(isLocationCommonActive, 'files-common-search')

    const hasSharesNavigation = computed(
      () => useSlots().hasOwnProperty('navigation') && can('create-all', 'Share')
    )

    const batchActions = computed(() => {
      let actions: FileAction[] = [
        ...unref(hideShareActions),
        ...unref(enableSyncActions),
        ...unref(disableSyncActions),
        ...unref(downloadArchiveActions),
        ...unref(downloadFileActions),
        ...unref(moveActions),
        ...unref(copyActions),
        ...unref(duplicateResourcesActions),
        ...unref(emptyTrashBinActions),
        ...unref(deleteActions),
        ...unref(restoreActions)
      ]

      /**
       * We show mixed results in search result page, including resources like files and folders but also spaces.
       * Space actions shouldn't be possible in that context.
       **/
      if (!isSearchLocation.value) {
        actions = [
          ...actions,
          ...unref(duplicateActions),
          ...unref(editSpaceQuotaActions),
          ...unref(restoreSpaceActions),
          ...unref(deleteSpaceActions),
          ...unref(disableSpaceActions)
        ] as FileAction[]
      }

      const actionExtensions = requestExtensions<ActionExtension>({
        id: 'global.files.batch-actions',
        extensionType: 'action'
      })
      if (actionExtensions.length) {
        actions = [...actions, ...actionExtensions.map((e) => e.action)]
      }

      return actions.filter((item) =>
        item.isVisible({ space: unref(space), resources: resourcesStore.selectedResources })
      )
    })

    const spaces = computed(() =>
      spacesStore.spaces.filter((s) => isPersonalSpaceResource(s) || isProjectSpaceResource(s))
    )

    const isMobileWidth = inject<Ref<boolean>>('isMobileWidth')
    const isTrashLocation = useActiveLocation(isLocationTrashActive, 'files-trash-generic')
    const showBreadcrumb = computed(() => {
      if (!unref(isMobileWidth) && props.breadcrumbs.length) {
        return true
      }
      if (unref(isTrashLocation) && unref(spaces).length === 1) {
        return false
      }
      return props.breadcrumbs.length > 1
    })
    const showMobileNav = computed(() => {
      if (unref(isTrashLocation) && unref(spaces).length === 1) {
        return props.breadcrumbs.length <= 2
      }
      return props.breadcrumbs.length <= 1
    })

    const breadcrumbTruncationOffset = computed(() => {
      if (!unref(space)) {
        return 2
      }
      return isProjectSpaceResource(unref(space)) || isShareSpaceResource(unref(space)) ? 3 : 2
    })
    const fileDroppedBreadcrumb = (data: RouteLocationRaw) => {
      emit(EVENT_ITEM_DROPPED, data)
    }

    const routeMetaTitle = useRouteMeta('title')
    const pageTitle = computed(() => {
      if (unref(routeMetaTitle)) {
        return $gettext(unref(routeMetaTitle))
      }
      return unref(space)?.name || ''
    })

    return {
      router,
      hasSharesNavigation,
      batchActions,
      showBreadcrumb,
      showMobileNav,
      breadcrumbMaxWidth,
      breadcrumbTruncationOffset,
      fileDroppedBreadcrumb,
      pageTitle,
      selectedResources,
      isSticky
    }
  },
  data: function () {
    return {
      resizeObserver: new ResizeObserver(this.onResize as ResizeObserverCallback),
      limitedScreenSpace: false
    }
  },
  computed: {
    showContextActions() {
      return last<BreadcrumbItem>(this.breadcrumbs).allowContextActions
    },
    showBatchActions() {
      return (
        this.hasBulkActions &&
        (this.selectedResources.length >= 1 ||
          isLocationTrashActive(this.router, 'files-trash-generic'))
      )
    },
    selectedResourcesAnnouncement() {
      if (this.selectedResources.length === 0) {
        return this.$gettext('No items selected.')
      }
      return this.$ngettext(
        '%{ amount } item selected. Actions are available above the table.',
        '%{ amount } items selected. Actions are available above the table.',
        this.selectedResources.length,
        {
          amount: this.selectedResources.length.toString()
        }
      )
    }
  },
  mounted() {
    this.resizeObserver.observe(this.$refs.filesAppBar as HTMLElement)
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    this.resizeObserver.unobserve(this.$refs.filesAppBar as HTMLElement)
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    onResize() {
      const totalContentWidth =
        document.getElementById('web-content-main')?.getBoundingClientRect().width || 0
      const leftSidebarWidth =
        document.getElementById('web-nav-sidebar')?.getBoundingClientRect().width || 0
      const rightSidebarWidth =
        document.getElementById('app-sidebar')?.getBoundingClientRect().width || 0

      const rightControlsWidth = document.getElementById(
        'files-app-bar-controls-right'
      )?.clientWidth

      this.breadcrumbMaxWidth =
        totalContentWidth - leftSidebarWidth - rightSidebarWidth - rightControlsWidth
      this.limitedScreenSpace = this.isSideBarOpen
        ? window.innerWidth <= 1280
        : window.innerWidth <= 1000
    }
  }
})
</script>

<style lang="scss" scoped>
#files-app-bar {
  background-color: var(--oc-color-background-default);
  border-top-right-radius: 15px;
  box-sizing: border-box;
  z-index: 2;
  position: inherit;
  padding: 0 var(--oc-space-medium);
  top: 0;

  &.files-app-bar-sticky {
    position: sticky;
  }

  .files-app-bar-controls {
    min-height: 52px;

    @media (max-width: $oc-breakpoint-xsmall-max) {
      justify-content: space-between;
    }
  }

  .files-app-bar-actions {
    align-items: center;
    display: flex;
    gap: var(--oc-space-small);
    justify-content: flex-end;
    min-height: 3rem;
  }

  #files-breadcrumb {
    min-height: 2rem;
  }
}
</style>
