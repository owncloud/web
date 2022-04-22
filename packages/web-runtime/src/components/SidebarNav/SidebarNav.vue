<template>
  <div
    id="web-nav-sidebar"
    :class="{
      'oc-app-navigation-collapsed': navigation.closed,
      'oc-app-navigation-expanded': !navigation.closed
    }"
  >
    <oc-button
      appearance="raw"
      :class="toggleSidebarButtonClass"
      class="toggle-sidebar-button oc-pb-s oc-pt-m"
      :aria-label="$gettext('Toggle sidebar')"
      @click="toggleSidebarButtonClick"
    >
      <oc-icon size="large" fill-type="line" :name="toggleSidebarButtonIcon" />
    </oc-button>
    <nav
      class="oc-sidebar-nav oc-mb-m oc-mt-s oc-px-xs"
      :aria-label="$gettext('Sidebar navigation menu')"
    >
      <oc-list>
        <div
          v-show="isAnyNavItemActive"
          id="nav-highlighter"
          class="oc-ml-s oc-background-primary-gradient"
        />
        <sidebar-nav-item
          v-for="link in navItemsTop"
          :key="link.route.path"
          :index="getUuid()"
          :target="link.route.path"
          :active="link.active"
          :icon="link.icon"
          :fill-type="link.fillType"
          :name="link.name"
          :collapsed="navigation.closed"
          :tag="link.tag"
        />
      </oc-list>
      <p
        v-if="navItemsBottom.length"
        style="
          padding-left: calc(var(--oc-space-small) + 8px);
          margin-bottom: 0;
          margin-top: 30px;
          font-size: 0.8em;
        "
      />
      <!--Shortcuts-->
      <oc-list>
        <sidebar-nav-item
          v-for="link in navItemsBottom"
          :key="link.route.path"
          :index="getUuid()"
          :target="link.route.path"
          :active="link.active"
          :icon="link.icon"
          :fill-type="link.fillType"
          :name="link.name"
          :collapsed="navigation.closed"
          :tag="link.tag"
          :class="'nav-item-separated'"
        />
      </oc-list>
    </nav>
    <!-- @slot bottom content of the sidebar -->
    <slot name="bottom" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted } from 'vue'
import { mapState, mapActions } from 'vuex'
import SidebarNavItem from './SidebarNavItem.vue'
import * as uuid from 'uuid'

export default defineComponent({
  components: {
    SidebarNavItem
  },
  props: {
    navItems: {
      type: Array,
      required: true
    }
  },
  setup() {
    let resizeObserver

    onMounted(() => {
      const navBar = document.getElementById('web-nav-sidebar')
      const highlighter = document.getElementById('nav-highlighter')

      if (!highlighter || !navBar) {
        return
      }

      resizeObserver = new ResizeObserver(() => {
        const navItem = document.getElementsByClassName('oc-sidebar-nav-item-link')[0]
        if (!navItem) {
          return
        }
        highlighter.style.setProperty('transition-duration', `0.05s`)
        highlighter.style.setProperty('width', `${navItem.clientWidth}px`)
        highlighter.style.setProperty('height', `${navItem.clientHeight}px`)
      })
      resizeObserver.observe(navBar)
    })

    onBeforeUnmount(() => {
      resizeObserver.disconnect()
    })
  },
  computed: {
    ...mapState(['navigation']),

    toggleSidebarButtonClass() {
      return this.navigation.closed
        ? 'toggle-sidebar-button-collapsed'
        : 'toggle-sidebar-button-expanded oc-pr-s'
    },

    toggleSidebarButtonIcon() {
      return this.navigation.closed ? 'arrow-drop-right' : 'arrow-drop-left'
    },
    navItemsTop() {
      return this.navItems.filter((item) => item.separate === false || !item.separate)
    },
    navItemsBottom() {
      return this.navItems.filter((item) => item.separate === true)
    },
    isAnyNavItemActive() {
      return this.navItems.some((i) => i.active === true)
    }
  },
  methods: {
    ...mapActions(['openNavigation', 'closeNavigation']),

    toggleSidebarButtonClick() {
      return this.navigation.closed ? this.openNavigation() : this.closeNavigation()
    },

    getUuid() {
      return uuid.v4().replaceAll('-', '')
    }
  }
})
</script>

<style lang="scss">
#nav-highlighter {
  position: absolute;
  border-radius: 5px;
  transition: transform 0.2s cubic-bezier(0.51, 0.06, 0.56, 1.37);
}
#web-nav-sidebar {
  background-color: var(--oc-color-background-default);
  border-radius: 15px;
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.34, 0.11, 0, 1.12);
  z-index: 4;

  .oc-list {
    position: relative;
  }

  .toggle-sidebar-button {
    min-height: 3rem;
    transition: all 0.2s ease-out;
    &:hover {
      overflow: hidden;
    }
  }
  .toggle-sidebar-button-expanded {
    justify-content: flex-end !important;
  }

  .oc-sidebar-nav li a:not(.active) {
    &:hover,
    &:focus {
      text-decoration: none !important;
      background-color: var(--oc-color-background-hover);
      color: var(--oc-color-swatch-passive-default);
    }
  }

  .oc-sidebar-nav li a.active {
    &:focus,
    &:hover {
      color: var(--oc-color-swatch-inverse-default);
    }
  }
}
.oc-app-navigation-expanded {
  min-width: 230px !important;
  max-width: 230px !important;
}
.oc-app-navigation-collapsed {
  min-width: 62px !important;
  max-width: 62px !important;
}
.nav-item-separated {
  //color: var(--oc-color-swatch-passive-default) !important;
  .oc-button-inverse-raw:not([disabled]) {
    color: var(--oc-color-swatch-passive-default) !important;
    svg {
      fill: var(--oc-color-swatch-passive-default) !important;
    }
  }
}
</style>
