<template>
  <header
    id="oc-topbar"
    class="oc-flex oc-flex-middle oc-flex-between oc-px-m"
    :aria-label="$gettext('Top bar')"
  >
    <div class="topbar-gap oc-flex oc-flex-middle oc-flex-between">
      <applications-menu v-if="applicationsList.length" :applications-list="appMenuItems" />
      <router-link ref="navigationSidebarLogo" to="/">
        <oc-img :src="logoImage" :alt="sidebarLogoAlt" />
      </router-link>
    </div>
    <div class="portal-wrapper">
      <portal-target name="app.runtime.header" multiple></portal-target>
    </div>
    <div class="topbar-gap oc-flex oc-flex-middle oc-flex-between">
      <theme-switcher v-if="darkThemeAvailable" />
      <feedback-link v-if="isFeedbackLinkEnabled" />
      <notifications v-if="isNotificationBellEnabled" />
      <user-menu v-if="isUserMenuEnabled" :applications-list="userMenuItems" />
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'
import NavigationMixin from '../../mixins/navigationMixin'

import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'

export default {
  components: {
    ApplicationsMenu,
    FeedbackLink,
    Notifications,
    ThemeSwitcher,
    UserMenu
  },
  mixins: [NavigationMixin],
  props: {
    applicationsList: {
      type: Array,
      required: false,
      default: () => []
    },
    activeNotifications: {
      type: [Array, Boolean],
      required: false,
      default: () => []
    }
  },
  computed: {
    ...mapGetters(['configuration', 'user']),

    appMenuItems() {
      return this.navigation_getMenuItems([null, 'apps', 'appSwitcher'])
    },
    userMenuItems() {
      return this.navigation_getMenuItems(['user'])
    },

    darkThemeAvailable() {
      return this.configuration.themes.default && this.configuration.themes['default-dark']
    },

    sidebarLogoAlt() {
      return this.$gettext('Navigate to all files page')
    },

    logoImage() {
      return this.configuration.currentTheme.logo.sidebar
    },

    isFeedbackLinkEnabled() {
      return !this.configuration.options.disableFeedbackLink
    },

    isNotificationBellEnabled() {
      return this.user?.id && this.activeNotifications.length
    },

    isUserMenuEnabled() {
      return this.user?.id
    }
  }
}
</script>

<style lang="scss">
#oc-topbar {
  height: 60px;
  position: sticky;
  z-index: 5;
  img {
    height: 42px;
    image-rendering: auto;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    image-rendering: -webkit-optimize-contrast;
    user-select: none;
  }
  .topbar-gap {
    gap: 30px;
  }
  @media only screen and (max-width: 960px) {
    .topbar-gap {
      gap: 0.5rem;
    }
  }
}
</style>
