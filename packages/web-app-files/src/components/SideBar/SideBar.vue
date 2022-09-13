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
import { buildResource, buildSpaceShare } from '../../helpers/resources'
import {
  isLocationPublicActive,
  isLocationSharesActive,
  isLocationSpacesActive,
  isLocationTrashActive
} from '../../router'
import { computed, defineComponent, ref, unref } from '@vue/composition-api'
import {
  useCapabilityShareJailEnabled,
  usePublicLinkPassword,
  useRouteParam,
  useStore
} from 'web-pkg/src/composables'
import { bus } from 'web-pkg/src/instance'
import { SideBarEventTopics } from '../../composables/sideBar'
import isEqual from 'lodash-es/isEqual'
import { useGraphClient } from 'web-client/src/composables'
import { useTask } from 'vue-concurrency'
import { sortSpaceMembers } from '../../helpers/space'

export default defineComponent({
  components: { FileInfo, SpaceInfo, SideBar },

  provide() {
    return {
      displayedItem: computed(() => this.selectedFile),
      activePanel: computed(() => this.activePanel),
      spaceMembers: computed(() => this.spaceMembers)
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
    const { graphClient } = useGraphClient()

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

    const spaceMembers = ref([])
    const currentStorageId = useRouteParam('storageId')
    const loadSpaceMembersTask = useTask(function* (signal, space) {
      const promises = []
      const spaceShares = []

      for (const role of Object.keys(space.spaceRoles)) {
        for (const userId of space.spaceRoles[role]) {
          promises.push(
            unref(graphClient)
              .users.getUser(userId)
              .then((resolved) => {
                spaceShares.push(buildSpaceShare({ ...resolved.data, role }, space.id))
              })
          )
        }
      }

      yield Promise.all(promises).then(() => {
        spaceMembers.value = sortSpaceMembers(spaceShares)
      })
    })

    return {
      hasShareJail: useCapabilityShareJailEnabled(),
      publicLinkPassword: usePublicLinkPassword({ store }),
      setActiveSideBarPanel,
      closeSideBar,
      destroySideBar,
      focusSideBar,
      graphClient,
      currentStorageId,
      loadSpaceMembersTask,
      spaceMembers
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
      if (isLocationPublicActive(this.$router, 'files-public-files')) {
        // root node of a public link has the public link token as path
        // root path `/` like for personal home doesn't exist for public links
        return pathSegments.length === 1
      }
      if (isLocationSharesActive(this.$router, 'files-shares-with-me')) {
        return !this.highlightedFile
      }
      if (this.hasShareJail && isLocationSpacesActive(this.$router, 'files-spaces-share')) {
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
    },
    shouldLoadSharesTree() {
      return this.currentFolder?.path !== this.highlightedFile.path
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
    ...mapActions('Files', ['loadSharesTree']),

    async fetchFileInfo() {
      if (!this.highlightedFile) {
        this.selectedFile = {}
        return
      }

      if (
        this.highlightedFileIsSpace ||
        isLocationSpacesActive(this.$router, 'files-spaces-project')
      ) {
        const space = this.highlightedFileIsSpace
          ? this.highlightedFile
          : this.spaces?.spaces?.find((space) => space.id === this.currentStorageId)

        this.loadSpaceMembersTask.perform(space)
      }

      if (
        isLocationTrashActive(this.$router, 'files-trash-personal') ||
        isLocationTrashActive(this.$router, 'files-trash-spaces-project') ||
        this.highlightedFileIsSpace
      ) {
        if (this.shouldLoadSharesTree) {
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
        if (this.shouldLoadSharesTree) {
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
        $gettext: this.$gettext,
        storageId: this.highlightedFile.fileId
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
