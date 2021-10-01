<template>
  <div
    data-testid="files-sidebar"
    :class="{
      'has-active-sub-panel': !!activeAvailablePanelName,
      'uk-flex uk-flex-center uk-flex-middle': loading
    }"
  >
    <oc-spinner v-if="loading" />
    <template v-else>
      <div
        v-for="panel in availablePanels"
        :id="`sidebar-panel-${panel.app}`"
        :key="`panel-${panel.app}`"
        ref="panels"
        :data-testid="`sidebar-panel-${panel.app}`"
        :tabindex="activePanelName === panel.app ? -1 : false"
        class="sidebar-panel"
        :class="{
          'is-active-sub-panel': activeAvailablePanelName === panel.app,
          'is-active-default-panel': panel.default && activePanelName === panel.app,
          'sidebar-panel-default': panel.default,
          'resource-info-hidden': !isSingleResource
        }"
      >
        <div
          v-if="[activePanelName, oldPanelName].includes(panel.app)"
          class="sidebar-panel__header header"
        >
          <oc-button
            v-if="!panel.default"
            class="header__back"
            appearance="raw"
            :aria-label="accessibleLabelBack"
            @click="closePanel"
          >
            <oc-icon name="chevron_left" />
            {{ defaultPanel.component.title($gettext) }}
          </oc-button>

          <h2 class="header__title oc-my-rm">
            {{ panel.component.title($gettext) }}
          </h2>

          <oc-button
            appearance="raw"
            class="header__close"
            :aria-label="$gettext('Close file sidebar')"
            @click="closeSidebar"
          >
            <oc-icon name="close" />
          </oc-button>
        </div>
        <file-info
          v-if="isSingleResource"
          class="sidebar-panel__file_info"
          :is-content-displayed="isContentDisplayed"
        />
        <div class="sidebar-panel__body">
          <template v-if="isContentDisplayed">
            <component :is="panel.component" class="sidebar-panel__body-content" />

            <div
              v-if="panel.default && availablePanels.length > 1"
              class="sidebar-panel__navigation"
            >
              <oc-button
                v-for="panelSelect in availablePanels.filter(p => !p.default)"
                :id="`sidebar-panel-${panelSelect.app}-select`"
                :key="`panel-select-${panelSelect.app}`"
                :data-testid="`sidebar-panel-${panelSelect.app}-select`"
                appearance="raw"
                @click="openPanel(panelSelect.app)"
              >
                <oc-icon :name="panelSelect.icon" />
                {{ panelSelect.component.title($gettext) }}
                <oc-icon name="chevron_right" />
              </oc-button>
            </div>
          </template>
          <p v-else>{{ sidebarAccordionsWarningMessage }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { DavProperties } from 'web-pkg/src/constants'

import MixinRoutes from '../../mixins/routes'
import { buildResource } from '../../helpers/resources'
import { isTrashbinRoute } from '../../helpers/route'

import FileInfo from './FileInfo.vue'

let visibilityObserver
let hiddenObserver

export default {
  components: { FileInfo },
  mixins: [MixinRoutes],

  provide() {
    const displayedItem = {}

    Object.defineProperty(displayedItem, 'value', {
      enumerable: true,
      get: () => this.selectedFile
    })

    return { displayedItem }
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
    ...mapState('Files/sidebar', { sidebarActivePanel: 'activePanel' }),
    activeAvailablePanelName() {
      if (!this.sidebarActivePanel) {
        return null
      }
      if (!this.availablePanels.map(p => p.app).includes(this.sidebarActivePanel)) {
        return null
      }
      return this.sidebarActivePanel
    },
    activePanelName() {
      return this.activeAvailablePanelName || this.defaultPanel.app
    },
    availablePanels() {
      const { panels } = this.fileSideBars.reduce(
        (result, panelGenerator) => {
          const panel = panelGenerator({
            capabilities: this.capabilities,
            highlightedFile: this.highlightedFile,
            route: this.$route,
            multipleSelection: this.areMultipleSelected,
            rootFolder: this.isRootFolder
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
    defaultPanel() {
      return this.availablePanels.find(panel => panel.default)
    },
    accessibleLabelBack() {
      const translated = this.$gettext('Back to %{panel} panel')
      return this.$gettextInterpolate(translated, {
        panel: this.defaultPanel.component.title(this.$gettext)
      })
    },
    isShareAccepted() {
      return this.highlightedFile?.status === 0
    },
    isContentDisplayed() {
      if (this.isSharedWithMeRoute) {
        return this.isShareAccepted
      }

      return true
    },
    sidebarAccordionsWarningMessage() {
      if (!this.isShareAccepted) {
        return this.$gettext('Please, accept this share first to display available actions')
      }

      return null
    },
    isSingleResource() {
      return !this.areMultipleSelected && !this.isRootFolder
    },
    areMultipleSelected() {
      return this.selectedFiles && this.selectedFiles.length > 1
    },
    isRootFolder() {
      return !this.highlightedFile?.path
    },
    highlightedFileThumbnail() {
      return this.highlightedFile?.thumbnail
    }
  },
  watch: {
    activePanelName: {
      handler: function(panel, select) {
        this.$nextTick(() => {
          this.focused = panel ? `#sidebar-panel-${panel}` : `#sidebar-panel-select-${select}`
        })
      },
      immediate: true
    },
    highlightedFile(newFile, oldFile) {
      if (!this.isSingleResource) {
        return
      }

      if (newFile.id !== oldFile?.id) {
        this.fetchFileInfo()
      }
    },

    highlightedFileThumbnail(thumbnail) {
      this.$set(this.selectedFile, 'thumbnail', thumbnail)
    }
  },

  async created() {
    if (!this.areMultipleSelected) {
      await this.fetchFileInfo()
    }
    this.$nextTick(this.initVisibilityObserver)
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
    hiddenObserver.disconnect()
  },
  methods: {
    ...mapActions('Files/sidebar', {
      closeSidebar: 'close',
      setSidebarPanel: 'setActivePanel',
      resetSidebarPanel: 'resetActivePanel'
    }),

    initVisibilityObserver() {
      visibilityObserver = new VisibilityObserver({
        root: document.querySelector('#files-sidebar'),
        threshold: 0.9
      })
      hiddenObserver = new VisibilityObserver({
        root: document.querySelector('#files-sidebar'),
        threshold: 0.05
      })
      const doFocus = () => {
        const selector = document.querySelector(this.focused)
        if (!selector) {
          return
        }
        selector.focus()
      }

      const clearOldPanelName = () => {
        this.oldPanelName = null
      }

      this.$refs.panels.forEach(panel => {
        visibilityObserver.observe(panel, {
          onEnter: doFocus,
          onExit: doFocus
        })
        hiddenObserver.observe(panel, {
          onExit: clearOldPanelName
        })
      })
    },

    setOldPanelName() {
      this.oldPanelName = this.activePanelName
    },

    openPanel(panel) {
      this.setOldPanelName()
      this.setSidebarPanel(panel)
    },

    closePanel() {
      this.setOldPanelName()
      this.resetSidebarPanel()
    },

    async fetchFileInfo() {
      if (!this.highlightedFile) {
        this.selectedFile = this.highlightedFile
        return
      }

      if (isTrashbinRoute(this.$route)) {
        this.selectedFile = this.highlightedFile
        return
      }

      this.loading = true
      try {
        const item = await this.$client.files.fileInfo(
          this.highlightedFile.path,
          DavProperties.Default
        )

        this.selectedFile = buildResource(item)
        this.$set(this.selectedFile, 'thumbnail', this.highlightedFile.thumbnail || null)
      } catch (error) {
        this.selectedFile = this.highlightedFile
        console.error(error)
      }
      this.loading = false
    }
  }
}
</script>

<style lang="scss">
#files-sidebar {
  border-left: 1px solid var(--oc-color-border);
}

.sidebar-panel {
  $root: &;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  display: grid;
  grid-template-rows: 50px 70px 1fr;
  background-color: var(--oc-color-background-default);
  top: 0;
  position: absolute;
  transform: translateX(100%);
  transition: transform 0.4s ease, visibility 0.4s 0s;
  // visibility is here to prevent focusing panel child elements,
  // the transition delay keeps care that it will only apply if the element is visible or not.
  // hidden: if element is off screen
  // visible: if element is on screen
  visibility: hidden;

  @media screen and (prefers-reduced-motion: reduce), (update: slow) {
    transition-duration: 0.001ms !important;
  }

  &.resource-info-hidden {
    grid-template-rows: 50px 1fr;
  }

  &.sidebar-panel-default {
    #files-sidebar.has-active-sub-panel & {
      transform: translateX(-30%);
      visibility: hidden;
    }
  }

  &.is-active-default-panel,
  &.is-active-sub-panel {
    visibility: unset;
    transform: translateX(0);
  }

  &__header {
    padding: 0 10px;
    border-bottom: 1px solid var(--oc-color-border);

    &.header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
    }

    & .header {
      &__back {
        grid-column-start: 1;
      }

      &__title {
        text-align: center;
        color: var(--oc-color-text-default);
        font-size: 1.2rem;
        grid-column-start: 2;
      }

      &__close {
        grid-column-start: 3;
      }
    }
  }

  &__file_info {
    border-bottom: 1px solid var(--oc-color-border);
    background-color: var(--oc-color-background-default);
    padding: 0 10px;
  }

  &__body {
    overflow-y: auto;
    padding: 10px;
  }

  &__navigation {
    margin: 10px -10px -10px;

    > button {
      border-bottom: 1px solid var(--oc-color-border);
      width: 100%;
      border-radius: 0;
      color: var(--oc-color-text-default) !important;
      display: grid;
      grid-template-columns: auto 1fr auto;
      text-align: left;
      height: 50px;
      padding: 0 10px;

      &:first-of-type {
        border-top: 1px solid var(--oc-color-border);
      }

      &:last-of-type {
        border-bottom: 0;
      }

      &:hover,
      &:focus {
        border-color: var(--oc-color-border) !important;
      }

      &:hover {
        background-color: var(--oc-color-background-muted) !important;
      }
    }
  }
}
</style>
