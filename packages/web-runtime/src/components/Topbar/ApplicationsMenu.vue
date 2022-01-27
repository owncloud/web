<template>
  <nav
    id="applications-menu"
    :aria-label="$gettext('Main navigation')"
    class="oc-flex oc-flex-middle"
  >
    <oc-button
      id="_appSwitcherButton"
      ref="menubutton"
      v-oc-tooltip="applicationSwitcherLabel"
      appearance="raw"
      variation="inverse"
      class="oc-topbar-menu-burger"
      :aria-label="applicationSwitcherLabel"
    >
      <oc-icon name="grid" size="large" class="oc-flex" />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="app-switcher-dropdown"
      toggle="#_appSwitcherButton"
      mode="click"
      class="oc-width-auto"
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      padding-size="small"
      close-on-click
    >
      <ul class="oc-my-rm oc-px-rm">
        <li v-for="(n, nid) in menuItems" :key="`apps-menu-${nid}`" class="list-item oc-p-s">
          <a v-if="n.url" key="apps-menu-external-link" :target="n.target" :href="n.url">
            <oc-icon :name="n.icon" size="large" />
            <span class="link-text" v-text="$gettext(n.title)" />
          </a>
          <router-link v-else key="apps-menu-internal-link" :to="n.path">
            <oc-icon :name="n.icon" size="large" />
            <span class="link-text" v-text="$gettext(n.title)" />
          </router-link>
        </li>
      </ul>
    </oc-drop>
  </nav>
</template>

<script>
import NavigationMixin from '../../mixins/navigationMixin'

export default {
  mixins: [NavigationMixin],
  props: {
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    }
  },
  computed: {
    menuItems() {
      return this.navigation_getMenuItems([null, 'apps', 'appSwitcher'])
    },
    applicationSwitcherLabel() {
      return this.$gettext('Application Switcher')
    }
  },
  mounted() {
    this.$refs.menu?.tippy?.setProps({
      onHidden: () => this.$refs.menubutton.$el.focus(),
      onShown: () => this.$refs.menu.$el.querySelector('a:first-of-type').focus()
    })
  }
}
</script>

<style lang="scss">
#applications-menu {
  .list-item {
    display: inline-flex;
    list-style: none;
    gap: 10px;

    a {
      text-align: center;
      .link-text {
        display: block;
      }
    }
  }
}
</style>
