<template>
  <nav :aria-label="$gettext('Main navigation')">
    <oc-button
      id="_appSwitcherButton"
      ref="menubutton"
      v-oc-tooltip="applicationSwitcherLabel"
      appearance="raw"
      class="oc-topbar-menu-burger"
      :aria-label="applicationSwitcherLabel"
    >
      <oc-icon name="apps" class="uk-flex" />
    </oc-button>
    <oc-drop
      ref="menu"
      drop-id="app-switcher-dropdown"
      toggle="#_appSwitcherButton"
      mode="click"
      :options="{ pos: 'bottom-right', delayHide: 0 }"
      class="uk-width-large"
      close-on-click
    >
      <ul class="uk-grid-small uk-text-center" uk-grid>
        <li v-for="(n, nid) in menuItems" :key="`apps-menu-${nid}`" class="uk-width-1-3">
          <a v-if="n.url" key="apps-menu-external-link" :target="n.target" :href="n.url">
            <oc-icon :name="n.iconMaterial" size="xlarge" />
            <span class="uk-display-block" v-text="$gettext(n.title)" />
          </a>
          <router-link v-else key="apps-menu-internal-link" :to="n.path">
            <oc-icon :name="n.iconMaterial" size="xlarge" />
            <span class="uk-display-block" v-text="$gettext(n.title)" />
          </router-link>
        </li>
      </ul>
    </oc-drop>
  </nav>
</template>

<script>
import NavigationMixin from '../mixins/navigationMixin'
import UiKit from 'uikit'

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
    UiKit.util.on('#app-switcher-dropdown', 'shown', () => {
      this.focusFirstLink()
    })

    UiKit.util.on('#app-switcher-dropdown', 'hidden', () => {
      this.$emit('closed')
      this.focusMenuButton()
    })
  },
  methods: {
    logout() {
      this.visible = false
      this.$store.dispatch('logout')
    },
    focusFirstLink() {
      /*
       * Delay for two reasons:
       * - for screen readers Virtual buffer
       * - to outsmart uikit's focus management
       */
      setTimeout(() => {
        this.$refs.menu.$el.querySelector('a:first-of-type').focus()
      }, 500)
    },
    focusMenuButton() {
      this.$refs.menubutton.$el.focus()
    }
  }
}
</script>
