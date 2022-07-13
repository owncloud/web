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
      class="toggle-sidebar-button oc-py-s"
      :aria-label="$gettext('Toggle sidebar')"
      @click="toggleSidebarButtonClick"
    >
      <oc-icon size="large" fill-type="line" :name="toggleSidebarButtonIcon" />
    </oc-button>
    <nav class="oc-sidebar-nav oc-my-m oc-px-xs" :aria-label="$gettext('Sidebar navigation menu')">
      <oc-list>
        <div
          v-show="isAnyNavItemActive"
          id="nav-highlighter"
          class="oc-ml-s oc-background-primary-gradient"
        />
        <sidebar-nav-item
          v-for="link in navItems"
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
    </nav>
    <!-- @slot bottom content of the sidebar -->
    <slot name="bottom" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import SidebarNavItem from './SidebarNavItem.vue'
import * as uuid from 'uuid'

export default {
  components: {
    SidebarNavItem
  },
  props: {
    navItems: {
      type: Array,
      required: true
    }
  },
  mounted() {
    const navItem = document.getElementsByClassName('oc-sidebar-nav-item-link')[0]
    const highlighter = document.getElementById('nav-highlighter')

    if (!highlighter || !navItem) {
      return
    }

    const resizeObserver = new ResizeObserver((data) => {
      const width = data[0].borderBoxSize[0].inlineSize
      highlighter.style.setProperty('transition-duration', `0.05s`)
      if (width === 0) return
      highlighter.style.setProperty('width', `${width}px`)
    }).observe(navItem)
    if (navItem.clientWidth === 0) return
    highlighter.style.setProperty('width', `${navItem.clientWidth}px`)
    highlighter.style.setProperty('height', `${navItem.clientHeight}px`)

    this.$on('beforeDestroy', () => {
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
}
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
      background-color: var(--oc-color-background-secondary) !important;
      overflow: hidden;
    }
  }
  .toggle-sidebar-button-expanded {
    justify-content: flex-end !important;
  }
}
.oc-app-navigation-expanded {
  min-width: 250px !important;
  max-width: 250px !important;
}
.oc-app-navigation-collapsed {
  min-width: 64px !important;
  max-width: 64px !important;
}
</style>
