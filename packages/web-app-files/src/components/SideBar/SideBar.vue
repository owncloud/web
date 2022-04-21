<template>
  <SideBar
    ref="sidebar"
    :available-panels="availablePanels"
    :sidebar-accordions-warning-message="sidebarAccordionsWarningMessage"
    :is-content-displayed="isContentDisplayed"
    :loading="loading"
    :is-header-compact="isSingleResource"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #header>
      <file-info
        v-if="isSingleResource && !highlightedFileIsSpace"
        class="sidebar-panel__file_info"
        :is-content-displayed="isContentDisplayed"
      />
      <space-info v-if="highlightedFileIsSpace" class="sidebar-panel__space_info" />
    </template>
  </SideBar>
</template>

<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import { DavProperties } from 'web-pkg/src/constants'
import SideBar from 'web-pkg/src/components/sidebar/SideBar.vue'
import { Panel } from 'web-pkg/src/components/sidebar/'

import { buildResource } from '../../helpers/resources'
import {
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationTrashActive,
  isLocationCommonActive
} from '../../router'
import { computed, defineComponent } from '@vue/composition-api'

import FileInfo from './FileInfo.vue'
import SpaceInfo from './SpaceInfo.vue'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'

export default defineComponent({
  components: { FileInfo, SpaceInfo, SideBar },

  provide() {
    return {
      displayedItem: computed(() => this.selectedFile)
    }
  },

  setup() {
    return {
      hasShareJail: useCapabilityShareJailEnabled()
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
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'publicLinkPassword']),
    ...mapGetters(['fileSideBars', 'capabilities']),
    ...mapState('Files/sidebar', { sidebarActivePanel: 'activePanel' }),
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
    sidebarAccordionsWarningMessage() {
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
      if (isLocationPublicActive(this.$router, 'files-public-files')) {
        // root node of a public link has the public link token as path
        // root path `/` like for personal home doesn't exist for public links
        return pathSegments.length === 1
      }
      if (isLocationSharesActive(this.$router, 'files-shares-with-me')) {
        return !this.highlightedFile
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

      this.fetchFileInfo()
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
      await this.fetchFileInfo()
    }
  },
  methods: {
    async fetchFileInfo() {
      if (!this.highlightedFile) {
        this.selectedFile = this.highlightedFile
        return
      }

      if (
        isLocationTrashActive(this.$router, 'files-trash-personal') ||
        isLocationTrashActive(this.$router, 'files-trash-spaces-project') ||
        isLocationCommonActive(this.$router, 'files-common-projects-trash') ||
        this.highlightedFileIsSpace
      ) {
        this.selectedFile = this.highlightedFile
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
          if (this.hasShareJail && isLocationSharesActive(this.$router, 'files-shares-with-me')) {
            item.name = this.highlightedFile.name
          }
        }

        this.selectedFile = buildResource(item)
        this.$set(this.selectedFile, 'thumbnail', this.highlightedFile.thumbnail || null)
      } catch (error) {
        this.selectedFile = this.highlightedFile
        console.error(error)
      }
      this.loading = false
    }
  }
})
</script>

<style lang="scss">
.sidebar-panel {
  &__file_info,
  &__space_info {
    border-bottom: 1px solid var(--oc-color-border);
    background-color: var(--oc-color-background-default);
    padding: 0 10px;
  }
}

._clipboard-success-animation {
  animation-name: _clipboard-success-animation;
  animation-duration: 0.8s;
  animation-timing-function: ease-out;
  animation-fill-mode: both;
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
