<template>
  <div
    id="app-sidebar"
    ref="appSideBar"
    data-testid="app-sidebar"
    tabindex="-1"
    :class="{
      'has-active-sub-panel': hasActiveSubPanel,
      'oc-flex oc-flex-center oc-flex-middle': loading,
      'app-sidebar-full-width': fullWidthSideBar
    }"
  >
    <oc-spinner v-if="loading" />
    <template v-else>
      <div
        v-for="panel in displayPanels"
        :id="`sidebar-panel-${panel.name}`"
        :key="`panel-${panel.name}`"
        :data-testid="`sidebar-panel-${panel.name}`"
        :tabindex="activePanelName === panel.name ? -1 : null"
        class="sidebar-panel"
        :inert="activePanelName !== panel.name"
        :class="{
          'is-root-panel': panel.isRoot?.(panelContext),
          'is-active-sub-panel': hasActiveSubPanel && activeSubPanelName === panel.name, // only one specific sub panel can be active
          'is-active-root-panel': hasActiveRootPanel && panel.isRoot?.(panelContext) // all root panels are active if no sub panel is active
        }"
      >
        <div
          v-if="[activePanelName, oldPanelName].includes(panel.name)"
          class="sidebar-panel__header header"
        >
          <oc-button
            v-if="!panel.isRoot?.(panelContext)"
            v-oc-tooltip="accessibleLabelBack"
            class="header__back"
            appearance="raw"
            :aria-label="accessibleLabelBack"
            @click="closePanel"
          >
            <oc-icon name="arrow-left-s" fill-type="line" />
          </oc-button>

          <h2 class="header__title oc-my-rm">
            {{ panel.title(panelContext) }}
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

        <div>
          <slot v-if="panel.isRoot?.(panelContext)" name="rootHeader" />
          <slot v-else name="subHeader" />
        </div>
        <div class="sidebar-panel__body" :class="[`sidebar-panel__body-${panel.name}`]">
          <div
            class="sidebar-panel__body-content"
            :class="{ 'sidebar-panel__body-content-stretch': !panel.isRoot?.(panelContext) }"
          >
            <slot name="body">
              <component
                :is="p.component"
                v-for="(p, index) in panel.isRoot?.(panelContext) ? rootPanels : [panel]"
                :key="`sidebar-panel-${p.name}`"
                :class="{ 'multi-root-panel-separator oc-mt oc-pt-s': index > 0 }"
                v-bind="p.componentAttrs?.(panelContext) || {}"
              />
            </slot>
          </div>

          <div
            v-if="panel.isRoot?.(panelContext) && subPanels.length > 0"
            class="sidebar-panel__navigation oc-mt-m"
          >
            <oc-button
              v-for="panelSelect in subPanels"
              :id="`sidebar-panel-${panelSelect.name}-select`"
              :key="`panel-select-${panelSelect.name}`"
              :data-testid="`sidebar-panel-${panelSelect.name}-select`"
              appearance="raw"
              @click="openPanel(panelSelect.name)"
            >
              <oc-icon :name="panelSelect.icon" :fill-type="panelSelect.iconFillType" />
              {{ panelSelect.title(panelContext) }}
              <oc-icon name="arrow-right-s" fill-type="line" />
            </oc-button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  PropType,
  ref,
  unref,
  useTemplateRef,
  watch
} from 'vue'
import { SideBarPanel, SideBarPanelContext } from './types'
import { useGettext } from 'vue3-gettext'

export default defineComponent({
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    availablePanels: {
      type: Array as PropType<SideBarPanel<unknown, unknown, unknown>[]>,
      required: true
    },
    panelContext: {
      type: Object as PropType<SideBarPanelContext<unknown, unknown, unknown>>,
      required: true
    },
    activePanel: {
      type: String,
      required: false,
      default: ''
    }
  },
  emits: ['close', 'selectPanel'],
  setup(props) {
    const { $gettext } = useGettext()
    const appSideBar = useTemplateRef<HTMLElement>('appSideBar')

    const rootPanels = computed(() => {
      return props.availablePanels.filter(
        (p) => p.isVisible(props.panelContext) && p.isRoot?.(props.panelContext)
      )
    })
    const subPanels = computed(() =>
      props.availablePanels.filter(
        (p) => p.isVisible(props.panelContext) && !p.isRoot?.(props.panelContext)
      )
    )
    const displayPanels = computed<SideBarPanel<unknown, unknown, unknown>[]>(() => {
      if (unref(rootPanels).length) {
        return [unref(rootPanels)[0], ...unref(subPanels)]
      }
      return unref(subPanels)
    })

    const activeSubPanelName = computed(() => {
      const panelName = props.activePanel?.split('#')[0]
      if (!panelName) {
        return null
      }
      if (
        !unref(subPanels)
          .map((p) => p.name)
          .includes(panelName)
      ) {
        return null
      }
      return panelName
    })
    const hasActiveSubPanel = computed(() => {
      return unref(activeSubPanelName) !== null
    })
    const hasActiveRootPanel = computed(() => {
      return unref(activeSubPanelName) === null
    })

    const oldPanelName = ref<string>(null)
    const clearOldPanelName = () => {
      oldPanelName.value = null
    }
    const setOldPanelName = (name: string) => {
      oldPanelName.value = name
    }
    const activePanelName = computed<string>(() => {
      if (unref(hasActiveSubPanel)) {
        return unref(activeSubPanelName)
      }
      return unref(rootPanels)[0].name
    })

    const accessibleLabelBack = computed(() => {
      if (unref(rootPanels).length === 1) {
        return $gettext('Back to %{panel} panel', {
          panel: unref(rootPanels)[0].title(props.panelContext)
        })
      }
      return $gettext('Back to main panels')
    })

    const fullWidthSideBar = computed(() => window.innerWidth <= 1024)
    const backgroundContentEl = computed(() => {
      return unref(appSideBar)?.parentElement?.querySelector('div') as HTMLElement
    })

    watch(
      () => props.isOpen,
      async (isOpen) => {
        if (!isOpen) {
          return
        }
        await nextTick()
        if (unref(fullWidthSideBar) && unref(backgroundContentEl)) {
          // hide content behind sidebar when it has full width to avoid focusable elements
          unref(backgroundContentEl).style.visibility = 'hidden'
        }
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      if (unref(backgroundContentEl)) {
        unref(backgroundContentEl).style.visibility = 'visible'
      }
    })

    return {
      appSideBar,
      displayPanels,
      rootPanels,
      subPanels,
      activeSubPanelName,
      activePanelName,
      oldPanelName,
      clearOldPanelName,
      setOldPanelName,
      hasActiveSubPanel,
      hasActiveRootPanel,
      accessibleLabelBack,
      fullWidthSideBar
    }
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

    openPanel(panel: string) {
      this.setOldPanelName(this.activePanelName)
      this.setSidebarPanel(panel)
    },

    closePanel() {
      this.setOldPanelName(this.activePanelName)
      this.resetSidebarPanel()
      this.appSideBar.focus()
    }
  }
})
</script>

<style lang="scss">
#app-sidebar {
  border-left: 1px solid var(--oc-color-outlineVariant);
  position: relative;
  overflow: hidden;
  min-width: 440px;
  width: 440px;

  &:focus,
  &:focus-visible {
    box-shadow: none;
    outline: none;
  }
}
.app-sidebar-full-width {
  min-width: 100% !important;
  width: 100% !important;
}

@media only screen and (max-width: 1024px) {
  .files-wrapper {
    flex-wrap: nowrap !important;
  }
}

.sidebar-panel {
  $root: &;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  display: grid;
  grid-template-rows: auto auto 1fr;
  background-color: var(--oc-color-background);
  top: 0;
  position: absolute;
  transform: translateX(100%);
  transition: transform 0.4s ease, visibility 0.4s 0s;
  // visibility is here to prevent focusing panel child elements,
  // the transition delay keeps care that it will only apply if the element is visible or not.
  // hidden: if element is off screen
  // visible: if element is on screen
  visibility: hidden;
  border-top-right-radius: var(--oc-space-medium);
  border-bottom-right-radius: var(--oc-space-medium);

  @media screen and (prefers-reduced-motion: reduce), (update: slow) {
    transition-duration: 0.001ms !important;
  }

  &.is-active-root-panel,
  &.is-active-sub-panel {
    visibility: unset;
    transform: translateX(0);
  }

  &.is-active-root-panel {
    right: 0 !important;
    transition: right 0.4s 0s;
  }

  &.is-root-panel {
    transform: translateX(0);
    visibility: visible;
    transition: right 0.4s 0s;
    right: 100px;
  }

  .multi-root-panel-separator {
    border-top: 1px solid var(--oc-color-outlineVariant);
  }

  &__header {
    padding: var(--oc-space-small) var(--oc-space-small) 0 var(--oc-space-small);

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
        color: var(--oc-color-onSurface);
        font-size: var(--oc-font-size-large);
        grid-column-start: 2;
      }

      &__close {
        grid-column-start: 3;
      }
    }
  }

  &__body {
    overflow-y: auto;
    overflow-x: hidden;
    padding: var(--oc-space-small);
    display: flex;
    flex-direction: column;

    &-content-stretch {
      flex: 1;
    }
  }

  &__navigation {
    margin: var(--oc-space-small) - var(--oc-space-small) - var(--oc-space-small);

    > button {
      border-bottom: 1px solid var(--oc-color-outlineVariant);
      width: 100%;
      border-radius: 0;
      color: var(--oc-color-onSurface) !important;
      display: grid;
      grid-template-columns: auto 1fr auto;
      text-align: left;
      height: 50px;
      padding: 0 var(--oc-space-small);

      &:first-of-type {
        border-top: 1px solid var(--oc-color-outlineVariant);
      }

      &:last-of-type {
        border-bottom: 0;
      }

      &:hover,
      &:focus {
        border-color: var(--oc-color-outlineVariant) !important;
      }

      &:hover {
        background-color: var(--oc-color-surfaceDim) !important;
      }
    }
  }
}
</style>
