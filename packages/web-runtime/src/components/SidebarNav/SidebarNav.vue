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
        <sidebar-nav-item
          v-for="(link, index) in navItemsTop"
          :key="link.route.path"
          :index="index"
          :target="link.route.path"
          :active="link.active"
          :icon="link.icon"
          :fill-type="link.fillType"
          :name="link.name"
          :collapsed="navigation.closed"
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
      >
        <!--Shortcuts-->
      </p>
      <oc-list>
        <sidebar-nav-item
          v-for="(link, index) in navItemsBottom"
          :key="link.route.path"
          :index="index"
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
    }
  },
  methods: {
    ...mapActions(['openNavigation', 'closeNavigation']),

    toggleSidebarButtonClick() {
      return this.navigation.closed ? this.openNavigation() : this.closeNavigation()
    }
  }
}
</script>

<style lang="scss">
#web-nav-sidebar {
  background-color: var(--oc-color-background-default);
  border-radius: 15px;
  box-shadow: 5px 0 25px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.34, 0.11, 0, 1.12);
  z-index: 4;

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
