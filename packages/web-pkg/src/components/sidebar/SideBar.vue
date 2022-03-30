<template>
  <div
    data-testid="files-sidebar"
    :class="{
      'has-active-sub-panel': !!activeAvailablePanelName,
      'oc-flex oc-flex-center oc-flex-middle': loading
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
        :tabindex="activePanelName === panel.app ? -1 : null"
        class="sidebar-panel"
        :class="{
          'is-active-sub-panel': activeAvailablePanelName === panel.app,
          'is-active-default-panel': panel.default && activePanelName === panel.app,
          'sidebar-panel-default': panel.default,
          'compact-header': isHeaderCompact
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
            <oc-icon name="arrow-left-s" fill-type="line" />
            {{ $gettext(defaultPanel.title) }}
          </oc-button>

          <h2 class="header__title oc-my-rm">
            {{ $gettext(panel.title) }}
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

        <slot name="header" />

        <div class="sidebar-panel__body">
          <template v-if="isContentDisplayed">
            <div class="sidebar-panel__body-content">
              <slot name="body">
                <component :is="panel.component" />
              </slot>
            </div>

            <div
              v-if="panel.default && availablePanels.length > 1"
              class="sidebar-panel__navigation"
            >
              <oc-button
                v-for="panelSelect in availablePanels.filter((p) => !p.default)"
                :id="`sidebar-panel-${panelSelect.app}-select`"
                :key="`panel-select-${panelSelect.app}`"
                :data-testid="`sidebar-panel-${panelSelect.app}-select`"
                appearance="raw"
                @click="openPanel(panelSelect.app)"
              >
                <oc-icon :name="panelSelect.icon" :fill-type="panelSelect.iconFillType" />
                {{ $gettext(panelSelect.title) }}
                <oc-icon name="arrow-right-s" fill-type="line" />
              </oc-button>
            </div>
          </template>
          <p v-else>{{ sidebarAccordionsWarningMessage }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { VisibilityObserver } from 'web-pkg/src/observer'
import { defineComponent, PropType } from '@vue/composition-api'
import { Panel } from './types'

let visibilityObserver: VisibilityObserver
let hiddenObserver: VisibilityObserver

export default defineComponent({
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    availablePanels: {
      type: Array as PropType<Panel[]>,
      required: true
    },
    sidebarActivePanel: {
      type: String,
      required: false,
      default: ''
    },
    sidebarAccordionsWarningMessage: {
      type: String,
      required: false
    },
    isContentDisplayed: {
      type: Boolean,
      required: false,
      default: true
    },
    isHeaderCompact: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  data() {
    return {
      focused: undefined,
      oldPanelName: null,
      selectedFile: {}
    }
  },

  computed: {
    activeAvailablePanelName() {
      if (!this.sidebarActivePanel) {
        return null
      }
      if (!this.availablePanels.map((p) => p.app).includes(this.sidebarActivePanel)) {
        return null
      }
      return this.sidebarActivePanel
    },
    activePanelName() {
      return this.activeAvailablePanelName || this.defaultPanel.app
    },
    defaultPanel() {
      return this.availablePanels.find((panel) => panel.default)
    },
    accessibleLabelBack() {
      const translated = this.$gettext('Back to %{panel} panel')
      return this.$gettextInterpolate(translated, {
        panel: this.defaultPanel.title
      })
    }
  },
  watch: {
    activePanelName: {
      handler: function (panel, select) {
        this.$nextTick(() => {
          this.focused = panel ? `#sidebar-panel-${panel}` : `#sidebar-panel-select-${select}`
        })
      },
      immediate: true
    },
    loading: {
      handler() {
        this.$nextTick(() => {
          this.initVisibilityObserver()
        })
      },
      immediate: true
    },
    availablePanels: {
      handler() {
        this.$nextTick(() => {
          this.initVisibilityObserver()
        })
      },
      immediate: true,
      deep: true
    }
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
    hiddenObserver.disconnect()
  },
  methods: {
    setSidebarPanel(panel: string) {
      this.$emit('selectPanel', panel)
    },

    resetSidebarPanel() {
      this.$emit('selectPanel', null)
    },

    closeSidebar() {
      this.$emit('close')
    },

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

      if (!this.$refs.panels) {
        return
      }

      visibilityObserver.disconnect()
      hiddenObserver.disconnect()

      this.$refs.panels.forEach((panel) => {
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
    }
  }
})
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
  grid-template-rows: 50px 1fr;
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
  border-top-right-radius: 15px;
  border-bottom-right-radius: 15px;

  @media screen and (prefers-reduced-motion: reduce), (update: slow) {
    transition-duration: 0.001ms !important;
  }

  &.compact-header {
    grid-template-rows: 50px 70px 1fr;
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
