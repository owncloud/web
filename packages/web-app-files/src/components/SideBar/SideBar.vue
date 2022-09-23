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
    @beforeDestroy="destroySideBar"
    @mounted="focusSideBar"
    @fileChanged="focusSideBar"
    @selectPanel="setActiveSideBarPanel"
    @close="closeSideBar"
    v-on="$listeners"
  >
    <template #header>
      <file-info
        v-if="isSingleResource && !highlightedFileIsSpace"
        class="sidebar-panel__file_info"
        :is-sub-panel-active="!!activePanel"
      />
      <space-info v-if="highlightedFileIsSpace" class="sidebar-panel__space_info" />
    </template>
  </SideBar>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapState } from 'vuex'
import SideBar from 'web-pkg/src/components/sideBar/SideBar.vue'
import FileInfo from './FileInfo.vue'
import SpaceInfo from './SpaceInfo.vue'
import { Panel } from 'web-pkg/src/components/sideBar/'

import { DavProperties } from 'web-pkg/src/constants'
import { buildResource } from '../../helpers/resources'
import {
  isLocationCommonActive,
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive
} from '../../router'
import { computed, defineComponent } from '@vue/composition-api'
import {
  useCapabilityShareJailEnabled,
  usePublicLinkPassword,
  useRouteParam,
  useStore
} from 'web-pkg/src/composables'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../composables/sideBar'
import isEqual from 'lodash-es/isEqual'
import { useActiveLocation } from '../../composables'

export default defineComponent({
  components: { FileInfo, SpaceInfo, SideBar },

  provide() {
    return {
      displayedItem: computed(() => this.selectedFile),
      activePanel: computed(() => this.activePanel)
    }
  },

  props: {
    open: {
      type: Boolean,
      required: true
    },
    activePanel: {
      type: String,
      default: null
    }
  },

  setup() {
    const store = useStore()
    const currentStorageId = useRouteParam('storageId')

    const closeSideBar = () => {
      bus.publish(SideBarEventTopics.close)
    }
    const setActiveSideBarPanel = (panelName) => {
      bus.publish(SideBarEventTopics.setActivePanel, panelName)
    }

    const focusSideBar = (component, event) => {
      component.focus({
        from: document.activeElement,
        to: component.sidebar?.$el,
        revert: event === 'beforeDestroy'
      })
    }

    const destroySideBar = (component, event) => {
      focusSideBar(component, event)
      bus.publish(SideBarEventTopics.close)
    }

    return {
      isSpacesProjectsLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-projects'),
      isSpacesShareLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-share'),
      isSharedWithMeLocation: useActiveLocation(isLocationSharesActive, 'files-shares-with-me'),
      isSharedWithOthersLocation: useActiveLocation(
        isLocationSharesActive,
        'files-shares-with-others'
      ),
      isSharedViaLinkLocation: useActiveLocation(isLocationSharesActive, 'files-shares-via-link'),
      isFavoritesLocation: useActiveLocation(isLocationCommonActive, 'files-common-favorites'),
      isSearchLocation: useActiveLocation(isLocationCommonActive, 'files-common-search'),
      isPublicFilesLocation: useActiveLocation(isLocationPublicActive, 'files-public-files'),
      hasShareJail: useCapabilityShareJailEnabled(),
      publicLinkPassword: usePublicLinkPassword({ store }),
      setActiveSideBarPanel,
      closeSideBar,
      destroySideBar,
      focusSideBar,
      currentStorageId
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
      return this.highlightedFile?.status === 0 || this.highlightedFile?.status === 1
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
      if (this.isPublicFilesLocation) {
        // root node of a public link has the public link token as path
        // root path `/` like for personal home doesn't exist for public links
        return pathSegments.length === 1
      }
      if (this.isSharedWithMeLocation || this.isSearchLocation) {
        return !this.highlightedFile
      }
      if (this.hasShareJail && this.isSpacesShareLocation) {
        return false
      }
      return !pathSegments.length
    },
    highlightedFileThumbnail() {
      return this.highlightedFile?.thumbnail
    },
    highlightedFileFavorite() {
      return this.highlightedFile?.starred
    },
    highlightedFileIsSpace() {
      return this.highlightedFile?.type === 'space'
    }
  },
  watch: {
    highlightedFile(newFile, oldFile) {
      if (!this.isSingleResource) {
        return
      }

      if (oldFile && isEqual(newFile, oldFile)) {
        return
      }

      // FIXME: isSpacesProjectsLocation resolves "true" within a project?!
      const isSpacesProjectsLocation = this.isSpacesProjectsLocation && !this.currentStorageId
      const loadShares =
        !!oldFile ||
        isSpacesProjectsLocation ||
        this.isSharedWithMeLocation ||
        this.isSharedWithOthersLocation ||
        this.isSharedViaLinkLocation ||
        this.isSearchLocation ||
        this.isFavoritesLocation
      this.fetchFileInfo(loadShares)
    },

    highlightedFileThumbnail(thumbnail) {
      this.$set(this.selectedFile, 'thumbnail', thumbnail)
    },

    highlightedFileFavorite(starred) {
      this.$set(this.selectedFile, 'starred', starred)
    }
  },
  async created() {
    if (!this.areMultipleSelected) {
      await this.fetchFileInfo(false)
    }
  },
  methods: {
    ...mapActions('Files', ['loadSharesTree']),

    async fetchFileInfo(loadShares) {
      if (!this.highlightedFile) {
        this.selectedFile = {}
        return
      }

      if (
        isLocationTrashActive(this.$router, 'files-trash-personal') ||
        isLocationTrashActive(this.$router, 'files-trash-spaces-project') ||
        isLocationCommonActive(this.$router, 'files-common-projects-trash') ||
        this.highlightedFileIsSpace
      ) {
        if (loadShares) {
          this.loadShares()
        }
        this.selectedFile = { ...this.highlightedFile }
        return
      }

      this.loading = true
      try {
        let item
        if (isLocationPublicActive(this.$router, 'files-public-files')) {
          item = await this.$client.publicFiles.getFileInfo(
            this.highlightedFile.webDavPath,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        } else {
          item = await this.$client.files.fileInfo(
            this.highlightedFile.webDavPath,
            DavProperties.Default
          )
        }

        this.selectedFile = buildResource(item)
        this.$set(this.selectedFile, 'thumbnail', this.highlightedFile.thumbnail || null)
        if (loadShares) {
          this.loadShares()
        }
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
