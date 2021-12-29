<template>
  <div id="web-nav-sidebar" :class="sidebarClasses">
    <oc-button
      variation="inverse"
      appearance="raw"
      :class="toggleSidebarButtonClass"
      class="toggle-sidebar-button oc-py-s"
      :aria-label="$gettext('Toggle sidebar')"
      @click="toggleSidebarButtonClick"
    >
      <oc-icon size="large" :name="toggleSidebarButtonIcon" />
    </oc-button>
    <nav
      class="oc-sidebar-nav oc-my-l oc-px-xs"
      :aria-label="$gettext('Sidebar top navigation menu')"
    >
      <oc-list>
        <sidebar-nav-item
          v-for="link in navItems"
          :key="link.route.path"
          :target="link.route.path"
          :active="link.active"
          :icon="link.icon || link.iconMaterial"
          :name="link.name"
          :collapsed="navigation.closed"
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
  computed: {
    ...mapState(['sidebar', 'navigation']),

    sidebarClasses() {
      if (this.navigation.closed) {
        return 'uk-visible@l oc-app-navigation-collapsed'
      }
      return 'uk-visible@l'
    },

    toggleSidebarButtonClass() {
      return this.navigation.closed
        ? 'toggle-sidebar-button-collapsed'
        : 'toggle-sidebar-button-expanded oc-pr-s'
    },

    toggleSidebarButtonIcon() {
      return this.navigation.closed ? 'chevron_right' : 'chevron_left'
    }
  },
  methods: {
    ...mapActions(['openNavigation', 'closeNavigation']),

    toggleSidebarButtonClick() {
      if (this.navigation.closed) return this.openNavigation()
      return this.closeNavigation()
    }
  }
}
</script>

<style lang="scss">
#web-nav-sidebar {
  background-color: #2d2d2d;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;
  // box-shadow: 5px 0px 25px rgba(0, 0, 0, 0.3);
  color: var(--oc-color-text-inverse);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  transition: all 0.35s cubic-bezier(0.34, 0.11, 0, 1.12);
  width: var(--oc-size-width-medium);

  .toggle-sidebar-button {
    transition: all 0.2s ease-out;
    &:hover {
      border-top-left-radius: 15px;
      background: #383838;
    }
  }
  .toggle-sidebar-button-expanded {
    justify-content: flex-end !important;
  }
}

.oc-app-navigation-collapsed {
  width: 75px !important;
}
</style>
