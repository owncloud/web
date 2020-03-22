<template>
  <oc-navbar id="oc-topbar" tag="header" class="oc-topbar uk-position-relative uk-navbar">
    <oc-navbar-item position="left">
      <oc-button
        v-if="hasAppNavigation"
        key="extension-navigation-button"
        ref="menubutton"
        icon="menu"
        variation="primary"
        class="oc-topbar-menu-burger uk-height-1-1"
        :aria-label="$gettext('Menu')"
        @click="toggleAppNavigationVisibility"
      >
        <span v-translate class="oc-topbar-menu-burger-label">Menu</span>
      </oc-button>
      <span
        v-else
        key="extension-title"
        class="topbar-current-extension-title uk-margin-left"
        v-text="currentExtensionName"
      />
    </oc-navbar-item>
    <oc-navbar-item position="center">
      <router-link to="/" class="oc-topbar-icon">ownCloud X</router-link>
    </oc-navbar-item>
    <oc-navbar-item v-if="!isPublicPage" position="right">
      <notifications v-if="activeNotifications.length" />
      <applications-menu :applications-list="applicationsList" />
      <user-menu :user-id="userId" :user-display-name="userDisplayName" />
    </oc-navbar-item>
  </oc-navbar>
</template>

<script>
import { mapGetters } from 'vuex'
import pluginHelper from '../mixins/pluginHelper.js'
import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'

export default {
  components: {
    Notifications,
    ApplicationsMenu,
    UserMenu
  },
  mixins: [pluginHelper],
  props: {
    userId: {
      type: String,
      required: false,
      default: null
    },
    userDisplayName: {
      type: String,
      required: false,
      default: null
    },
    applicationsList: {
      type: Array,
      required: false,
      default: () => null
    },
    hasAppNavigation: {
      type: Boolean,
      required: false,
      default: false
    },
    activeNotifications: {
      type: [Array, Boolean],
      required: false,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['apps']),

    isPublicPage() {
      return !this.userId
    },

    currentExtensionName() {
      return this.$gettext(this.apps[this.currentExtension].name)
    }
  },
  methods: {
    toggleAppNavigationVisibility() {
      this.$emit('toggleAppNavigationVisibility')
    }
  }
}
</script>

TODO: Move to ODS and enable theming
<style scoped>
.topbar-current-extension-title {
  color: white;
}
</style>
