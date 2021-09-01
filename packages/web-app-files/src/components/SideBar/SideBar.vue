<template>
  <div
    data-testid="files-sidebar"
    :class="{
      'has-active': !!appSidebarActivePanel,
      'uk-flex uk-flex-center uk-flex-middle': loading
    }"
  >
    <oc-spinner v-if="loading" />
    <template v-else>
      <div
        v-for="panelMeta in panelMetas"
        :id="`sidebar-panel-${panelMeta.app}`"
        :key="`panel-${panelMeta.app}`"
        ref="panels"
        :data-testid="`sidebar-panel-${panelMeta.app}`"
        :tabindex="appSidebarActivePanel === panelMeta.app ? -1 : false"
        class="sidebar-panel"
        :class="{
          'is-active':
            appSidebarActivePanel === panelMeta.app ||
            (!appSidebarActivePanel && panelMeta.default),
          'sidebar-panel--default': panelMeta.default,
          'sidebar-panel--multiple-selected': areMultipleSelected || isRootFolder
        }"
      >
        <div class="sidebar-panel__header header">
          <oc-button
            v-if="!panelMeta.default"
            class="header__back"
            appearance="raw"
            :aria-label="accessibleLabelBack"
            @click="closePanel"
          >
            <oc-icon name="chevron_left" />
            {{ defaultPanelMeta.component.title($gettext) }}
          </oc-button>

          <div class="header__title">
            {{ panelMeta.component.title($gettext) }}
          </div>

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
          v-if="!areMultipleSelected && !isRootFolder"
          class="sidebar-panel__file_info"
          :is-content-displayed="isContentDisplayed"
        />
        <div class="sidebar-panel__body">
          <template v-if="isContentDisplayed">
            <component
              :is="panelMeta.component"
              v-if="[activePanel, oldPanel].includes(panelMeta.app)"
            />

            <div
              v-if="panelMeta.default && panelMetas.length > 1"
              class="sidebar-panel__navigation"
            >
              <oc-button
                v-for="panelSelect in panelMetas.filter(p => !p.default)"
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
import { mapGetters, mapMutations, mapState, mapActions } from 'vuex'
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
    return { displayedItem: this.displayedItem }
  },

  data() {
    return {
      focused: undefined,
      oldPanel: null,
      displayedItem: {
        value: null
      },
      loading: false
    }
  },

  computed: {
    ...mapGetters('Files', ['highlightedFile', 'selectedFiles', 'currentFolder']),
    ...mapGetters(['fileSideBars', 'capabilities']),
    ...mapState('Files', ['appSidebarActivePanel']),
    activePanel() {
      return this.appSidebarActivePanel || this.defaultPanelMeta.app
    },
    panelMetas() {
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
    defaultPanelMeta() {
      return this.panelMetas.find(panel => panel.default)
    },
    accessibleLabelBack() {
      const translated = this.$gettext('Back to %{panel} panel')
      return this.$gettextInterpolate(translated, {
        panel: this.defaultPanelMeta.component.title(this.$gettext)
      })
    },
    isShareAccepted() {
      return this.highlightedFile.status === 0
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
    areMultipleSelected() {
      return this.selectedFiles && this.selectedFiles.length > 1
    },
    isRootFolder() {
      return !this.highlightedFile?.path
    }
  },
  watch: {
    activePanel: {
      handler: function(panel, select) {
        this.$nextTick(() => {
          this.focused = panel ? `#sidebar-panel-${panel}` : `#sidebar-panel-select-${select}`
        })
      },
      immediate: true
    },
    highlightedFile(newFile, oldFile) {
      if (newFile.id !== oldFile.id) {
        this.fetchFileInfo()
      }
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
    ...mapMutations('Files', ['SET_APP_SIDEBAR_ACTIVE_PANEL']),
    ...mapActions('Files/sidebar', { closeSidebar: 'close' }),

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

      const clearOldPanel = () => {
        this.oldPanel = null
      }

      this.$refs.panels.forEach(panel => {
        visibilityObserver.observe(panel, {
          onEnter: doFocus,
          onExit: doFocus
        })
        hiddenObserver.observe(panel, {
          onExit: clearOldPanel
        })
      })
    },

    setOldPanel() {
      this.oldPanel = this.activePanel || this.defaultPanelMeta.app
    },

    openPanel(panel) {
      this.setOldPanel()
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(panel)
    },

    closePanel() {
      this.setOldPanel()
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    },

    async fetchFileInfo() {
      if (isTrashbinRoute(this.$route)) {
        this.displayedItem.value = this.highlightedFile

        return
      }

      this.loading = true

      try {
        const item = await this.$client.files.fileInfo(
          this.highlightedFile.path,
          DavProperties.Default
        )

        this.displayedItem.value = buildResource(item)
      } catch (error) {
        this.displayedItem.value = this.highlightedFile

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

  &--multiple-selected {
    grid-template-rows: 50px 1fr;
  }

  &--default {
    #files-sidebar.has-active & {
      transform: translateX(-30%);
      visibility: hidden;
    }
  }

  &--default,
  &.is-active {
    visibility: unset;
    transform: translateX(0);
  }

  &__header {
    padding: 0 10px;

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
    border-top: 1px solid var(--oc-color-border);
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
