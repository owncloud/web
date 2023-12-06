<template>
  <div id="files-app-bar" ref="filesAppBar" :class="{ 'files-app-bar-squashed': isSideBarOpen }">
    <quota-modal
      v-if="quotaModalIsOpen"
      :cancel="closeQuotaModal"
      :spaces="selectedFiles"
      :max-quota="maxQuota"
    />
    <oc-hidden-announcer :announcement="selectedResourcesAnnouncement" level="polite" />

    <div class="files-topbar oc-py-s">
      <h1 class="oc-invisible-sr" v-text="pageTitle" />
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
        <div
          v-if="hasViewOptions || hasSidebarToggle"
          id="files-app-bar-controls-right"
          class="oc-flex"
        >
          <view-options
            v-if="hasViewOptions"
            :view-modes="viewModes"
            :has-hidden-files="hasHiddenFiles"
            :has-file-extensions="hasFileExtensions"
            :has-pagination="hasPagination"
            per-page-storage-prefix="files"
            :view-mode-default="viewModeDefault"
          />
          <sidebar-toggle v-if="hasSidebarToggle" :is-side-bar-open="isSideBarOpen" />
        </div>
      </div>
      <div class="files-app-bar-actions oc-mt-xs">
        <div class="oc-flex-1 oc-flex oc-flex-start oc-flex-middle">
          <slot name="actions" :limited-screen-space="limitedScreenSpace" />
          <!-- HACK: vue-tsc thinks BatchActions is of type FileAction[], the empty bind (currently) workarounds the resulting error -->
          <batch-actions
            v-if="showBatchActions"
            v-bind="{} as any"
            :actions="batchActions"
            :action-options="{ space, resources: selectedFiles }"
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
import { mapGetters } from 'vuex'
import { Resource } from '@ownclouders/web-client'
import {
  isPersonalSpaceResource,
  isProjectSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from '@ownclouders/web-client/src/helpers'
import BatchActions from '../BatchActions.vue'
import { isLocationCommonActive, isLocationTrashActive } from '../../router'
import ContextActions from '../FilesList/ContextActions.vue'
import SidebarToggle from './SidebarToggle.vue'
import { ViewMode } from '../../ui/types'
import {
  useFileActionsAcceptShare,
  useFileActionsCopy,
  useFileActionsDeclineShare,
  useFileActionsDelete,
  useFileActionsDownloadArchive,
  useFileActionsDownloadFile,
  useFileActionsEmptyTrashBin,
  useFileActionsMove,
  useFileActionsRestore,
  useSpaceActionsDuplicate
} from '../../composables/actions'
import {
  useAbility,
  useCapabilitySpacesMaxQuota,
  useFileActionsToggleHideShare,
  useRouteMeta,
  useStore,
  ViewModeConstants
} from '../../composables'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { useActiveLocation } from '../../composables'
import { helpers } from 'design-system'
import ViewOptions from '../ViewOptions.vue'
import { useGettext } from 'vue3-gettext'
import {
  FileAction,
  useSpaceActionsDelete,
  useSpaceActionsDisable,
  useSpaceActionsEditQuota,
  useSpaceActionsRestore
} from '../../composables'
import QuotaModal from '../Spaces/QuotaModal.vue'

const { EVENT_ITEM_DROPPED } = helpers

export default defineComponent({
  components: {
    BatchActions,
    ContextActions,
    SidebarToggle,
    ViewOptions,
    QuotaModal
  },
  props: {
    viewModeDefault: {
      type: String,
      required: false,
      default: () => ViewModeConstants.default.name
    },
    breadcrumbs: {
      type: Array as PropType<BreadcrumbItem[]>,
      default: () => []
    },
    breadcrumbsContextActionsItems: {
      type: Array as PropType<Resource[]>,
      default: () => []
    },
    viewModes: {
      type: Array as PropType<ViewMode[]>,
      default: () => []
    },
    hasBulkActions: { type: Boolean, default: false },
    hasSidebarToggle: { type: Boolean, default: true },
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
    const store = useStore()
    const { $gettext } = useGettext()
    const { can } = useAbility()

    const { actions: acceptShareActions } = useFileActionsAcceptShare({ store })
    const { actions: hideShareActions } = useFileActionsToggleHideShare({ store })
    const { actions: copyActions } = useFileActionsCopy({ store })
    const { actions: duplicateActions } = useSpaceActionsDuplicate({ store })
    const { actions: declineShareActions } = useFileActionsDeclineShare({ store })
    const { actions: deleteActions } = useFileActionsDelete({ store })
    const { actions: downloadArchiveActions } = useFileActionsDownloadArchive({ store })
    const { actions: downloadFileActions } = useFileActionsDownloadFile()
    const { actions: emptyTrashBinActions } = useFileActionsEmptyTrashBin({ store })
    const { actions: moveActions } = useFileActionsMove({ store })
    const { actions: restoreActions } = useFileActionsRestore({ store })
    const { actions: deleteSpaceActions } = useSpaceActionsDelete({ store })
    const { actions: disableSpaceActions } = useSpaceActionsDisable({ store })
    const {
      actions: editSpaceQuotaActions,
      modalOpen: quotaModalIsOpen,
      closeModal: closeQuotaModal
    } = useSpaceActionsEditQuota({ store })
    const { actions: restoreSpaceActions } = useSpaceActionsRestore({ store })

    const breadcrumbMaxWidth = ref<number>(0)
    const isSearchLocation = useActiveLocation(isLocationCommonActive, 'files-common-search')

    const hasSharesNavigation = computed(
      () => useSlots().hasOwnProperty('navigation') && can('create-all', 'Share')
    )

    const batchActions = computed(() => {
      let actions = [
        ...unref(hideShareActions),
        ...unref(acceptShareActions),
        ...unref(declineShareActions),
        ...unref(downloadArchiveActions),
        ...unref(downloadFileActions),
        ...unref(moveActions),
        ...unref(copyActions),
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

      return actions.filter((item) =>
        item.isEnabled({ space: props.space, resources: store.getters['Files/selectedFiles'] })
      )
    })

    const spaces = computed<SpaceResource[]>(() =>
      store.getters['runtime/spaces/spaces'].filter(
        (s) => isPersonalSpaceResource(s) || isProjectSpaceResource(s)
      )
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
      if (!props.space) {
        return 2
      }
      return isProjectSpaceResource(unref(props.space)) || isShareSpaceResource(unref(props.space))
        ? 3
        : 2
    })
    const fileDroppedBreadcrumb = async (data) => {
      emit(EVENT_ITEM_DROPPED, data)
    }

    const routeMetaTitle = useRouteMeta('title')
    const pageTitle = computed(() => {
      if (unref(routeMetaTitle)) {
        return $gettext(unref(routeMetaTitle))
      }
      return props.space?.name || ''
    })

    return {
      hasSharesNavigation,
      batchActions,
      showBreadcrumb,
      showMobileNav,
      breadcrumbMaxWidth,
      breadcrumbTruncationOffset,
      fileDroppedBreadcrumb,
      pageTitle,
      quotaModalIsOpen,
      closeQuotaModal,
      maxQuota: useCapabilitySpacesMaxQuota()
    }
  },
  data: function () {
    return {
      resizeObserver: new ResizeObserver(this.onResize as ResizeObserverCallback),
      limitedScreenSpace: false
    }
  },
  computed: {
    ...mapGetters('Files', ['files', 'selectedFiles']),

    showContextActions() {
      return last<BreadcrumbItem>(this.breadcrumbs).allowContextActions
    },
    showBatchActions() {
      return (
        this.hasBulkActions &&
        (this.selectedFiles.length >= 1 ||
          isLocationTrashActive(this.$router, 'files-trash-generic'))
      )
    },
    selectedResourcesAnnouncement() {
      if (this.selectedFiles.length === 0) {
        return this.$gettext('No items selected.')
      }
      return this.$ngettext(
        '%{ amount } item selected. Actions are available above the table.',
        '%{ amount } items selected. Actions are available above the table.',
        this.selectedFiles.length,
        {
          amount: this.selectedFiles.length
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

      const rightControlsWidth = document.getElementById('files-app-bar-controls-right')
        ?.clientWidth

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
  position: sticky;
  padding: 0 var(--oc-space-medium);
  top: 0;

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
