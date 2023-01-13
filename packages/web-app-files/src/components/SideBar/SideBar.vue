<template>
  <SideBar
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
    :is-header-compact="isSingleResource"
    v-bind="$attrs"
    data-custom-key-bindings="true"
    @beforeUnmount="destroySideBar"
    @mounted="focusSideBar"
    @fileChanged="focusSideBar"
    @selectPanel="setActiveSideBarPanel"
    @close="closeSideBar"
  >
    <template #header>
      <file-info
        v-if="highlightedFile && isSingleResource && !highlightedFileIsSpace"
        class="sidebar-panel__file_info"
        :is-sub-panel-active="!!activePanel"
      />
      <space-info
        v-if="isSingleResource && highlightedFileIsSpace"
        class="sidebar-panel__space_info"
      />
    </template>
  </SideBar>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from 'vuex'
import SideBar from 'web-pkg/src/components/sideBar/SideBar.vue'
import FileInfo from './FileInfo.vue'
import SpaceInfo from './SpaceInfo.vue'
import { Panel } from 'web-pkg/src/components/sideBar/'

import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationTrashActive
} from '../../router'
import { computed, defineComponent, PropType } from 'vue'
import {
  useCapabilityShareJailEnabled,
  useClientService,
  useGraphClient,
  usePublicLinkPassword,
  useStore
} from 'web-pkg/src/composables'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { SideBarEventTopics } from 'web-pkg/src/composables/sideBar'
import isEqual from 'lodash-es/isEqual'
import { useActiveLocation } from '../../composables'
import { isProjectSpaceResource, SpaceResource } from 'web-client/src/helpers'
import { WebDAV } from 'web-client/src/webdav'

export default defineComponent({
  components: { FileInfo, SpaceInfo, SideBar },

  provide() {
    return {
      displayedItem: computed(() => this.selectedFile),
      activePanel: computed(() => this.activePanel),
      displayedSpace: computed(() => this.space)
    }
  },

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

  setup() {
    const store = useStore()

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

    const { webdav } = useClientService()

    return {
      ...useGraphClient(),
      isSharedWithMeLocation: useActiveLocation(isLocationSharesActive, 'files-shares-with-me'),
      isSharedWithOthersLocation: useActiveLocation(
        isLocationSharesActive,
        'files-shares-with-others'
      ),
      isSharedViaLinkLocation: useActiveLocation(isLocationSharesActive, 'files-shares-via-link'),
      isFavoritesLocation: useActiveLocation(isLocationCommonActive, 'files-common-favorites'),
      isSearchLocation: useActiveLocation(isLocationCommonActive, 'files-common-search'),
      isPublicFilesLocation: useActiveLocation(isLocationPublicActive, 'files-public-link'),
      isTrashLocation: useActiveLocation(isLocationTrashActive, 'files-trash-generic'),
      hasShareJail: useCapabilityShareJailEnabled(),
      publicLinkPassword: usePublicLinkPassword({ store }),
      setActiveSideBarPanel,
      closeSideBar,
      destroySideBar,
      focusSideBar,
      webdav
    }
  },
  data() {
    return {
      focused: undefined,
      oldPanelName: null,
      selectedFile: {},
      loading: false
    }
  },

  computed: {
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'currentFolder']),
    ...mapGetters(['fileSideBars', 'capabilities']),
    ...mapGetters('runtime/spaces', ['spaces']),
    ...mapState(['user']),
    availablePanels(): Panel[] {
      const { panels } = this.fileSideBars.reduce(
        (result, panelGenerator) => {
          const panel = panelGenerator({
            capabilities: this.capabilities,
            highlightedFile: this.highlightedFile,
            route: this.$route,
            router: this.$router,
            multipleSelection: this.areMultipleSelected,
            rootFolder: this.isRootFolder,
            user: this.user
          })

          if (panel.enabled) {
            result.panels.push(panel)
          }

          return result
        },
        { panels: [] }
      )

      return panels
    },
    isShareAccepted() {
      return this.highlightedFile?.status === 0
    },
    isContentDisplayed() {
      return isLocationSharesActive(this.$router, 'files-shares-with-me')
        ? this.isShareAccepted
        : true
    },
    warningMessage() {
      if (!this.isShareAccepted) {
        return this.$gettext('Please, accept this share first to display available actions')
      }

      return null
    },
    isSingleResource() {
      return !this.areMultipleSelected && (!this.isRootFolder || this.highlightedFileIsSpace)
    },
    areMultipleSelected() {
      return this.selectedFiles && this.selectedFiles.length > 1
    },
    isRootFolder() {
      const pathSegments = this.highlightedFile?.path?.split('/').filter(Boolean) || []
      if (this.isSharedWithMeLocation || this.isSearchLocation) {
        return !this.highlightedFile
      }
      if (this.hasShareJail && this.space?.driveType === 'share') {
        return false
      }
      if (this.isTrashLocation && !this.highlightedFile?.id) {
        return true
      }
      return !pathSegments.length
    },
    highlightedFileIsSpace() {
      return this.highlightedFile?.type === 'space'
    },
    sharesLoadingDisabledOnCurrentRoute() {
      return this.isPublicFilesLocation || this.isTrashLocation
    },
    isShareLocation() {
      return (
        this.isSharedWithMeLocation ||
        this.isSharedWithOthersLocation ||
        this.isSharedViaLinkLocation
      )
    }
  },
  watch: {
    highlightedFile: {
      handler(newFile, oldFile) {
        if (!this.isSingleResource || !this.highlightedFile) {
          return
        }

        const noChanges = oldFile && isEqual(newFile, oldFile)
        const loadShares =
          !noChanges &&
          !this.sharesLoadingDisabledOnCurrentRoute &&
          (!!oldFile || !this.currentFolder)
        if (loadShares) {
          this.loadShares()
        }

        if (isProjectSpaceResource(this.highlightedFile)) {
          this.loadSpaceMembers({ graphClient: this.graphClient, space: this.highlightedFile })
        }

        if (this.isShareLocation || !noChanges) {
          this.fetchFileInfo()
        }
      },
      deep: true
    }
  },
  methods: {
    ...mapActions('Files', ['loadSharesTree']),
    ...mapActions('runtime/spaces', ['loadSpaceMembers']),

    async fetchFileInfo() {
      this.loading = true

      if (!this.isShareLocation) {
        this.selectedFile = { ...this.highlightedFile }
        this.loading = false
        return
      }

      // shared resources look different, hence we need to fetch the actual resource here
      try {
        this.selectedFile = await (this.webdav as WebDAV).getFileInfo(this.space, {
          path: this.highlightedFile.path
        })
      } catch (error) {
        this.selectedFile = { ...this.highlightedFile }
        console.error(error)
      }
      this.loading = false
    },

    loadShares() {
      this.loadSharesTree({
        client: this.$client,
        path: this.highlightedFile.path,
        storageId: this.highlightedFile.fileId,
        includeRoot: true,
        // cache must not be used on flat file lists that gather resources form various locations
        useCached: !(
          this.isSharedWithMeLocation ||
          this.isSharedWithOthersLocation ||
          this.isSharedViaLinkLocation ||
          this.isSearchLocation ||
          this.isFavoritesLocation
        )
      })
    }
  }
})
</script>

<style lang="scss">
.files-side-bar {
  z-index: 3;

  .sidebar-panel {
    &__file_info,
    &__space_info {
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
