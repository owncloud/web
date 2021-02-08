<template>
  <div>
    <oc-button
      id="_appSwitcherButton"
      ref="menubutton"
      variation="raw"
      class="oc-topbar-menu-burger"
      :aria-label="applicationSwitcherLabel"
      :uk-tooltip="applicationSwitcherLabel"
    >
      <oc-icon name="apps" aria-hidden="true" class="uk-flex" />
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
      <div class="uk-grid-small uk-text-center" uk-grid>
        <div v-for="(n, nid) in menuItems" :key="`apps-menu-${nid}`" class="uk-width-1-3">
          <a v-if="n.url" key="apps-menu-external-link" :target="n.target" :href="n.url">
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" size="xlarge" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" size="xlarge" />
            <div>{{ n.title }}</div>
          </a>
          <router-link v-else key="apps-menu-internal-link" :to="n.path">
            <oc-icon v-if="n.iconMaterial" :name="n.iconMaterial" size="xlarge" />
            <oc-icon v-if="n.iconUrl" :url="n.iconUrl" size="xlarge" />
            <div v-text="n.title" />
          </router-link>
        </div>
      </div>
    </oc-drop>
  </div>
</template>

<script>
import NavigationMixin from '../mixins/navigationMixin'

export default {
  mixins: [NavigationMixin],
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
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
  watch: {
    visible(val) {
      if (val) {
        this.focusFirstLink()
      } else {
        this.$emit('closed')
      }
    }
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
    }
  }
}
</script>
