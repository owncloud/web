<template>
  <header
    id="oc-topbar"
    class="oc-flex oc-flex-middle oc-flex-between oc-px-m"
    :aria-label="$gettext('Top bar')"
  >
    <div class="oc-topbar-left oc-flex oc-flex-middle oc-flex-between">
      <applications-menu v-if="appMenuItems.length" :applications-list="appMenuItems" />
      <router-link ref="navigationSidebarLogo" to="/">
        <oc-img :src="logoImage" :alt="sidebarLogoAlt" class="oc-logo-image" />
      </router-link>
    </div>
    <div class="portal-wrapper">
      <portal-target name="app.runtime.header" multiple></portal-target>
    </div>
    <div class="oc-topbar-right oc-flex oc-flex-middle oc-flex-between">
      <tours />
      <theme-switcher v-if="darkThemeAvailable" />
      <feedback-link v-if="isFeedbackLinkEnabled" v-bind="feedbackLinkOptions" />
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
import Tours from './Tours/Tours.vue'

export default {
  components: {
    ApplicationsMenu,
    FeedbackLink,
    Notifications,
    ThemeSwitcher,
    UserMenu,
    Tours
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

    activeRoutePath() {
      return this.$router.resolve(this.$route).location.path
    },

    appMenuItems() {
      return this.navigation_getMenuItems([null, 'apps', 'appSwitcher'], this.activeRoutePath)
    },
    userMenuItems() {
      return this.navigation_getMenuItems(['user'], this.activeRoutePath)
    },

    darkThemeAvailable() {
      return this.configuration.themes.default && this.configuration.themes['default-dark']
    },

    sidebarLogoAlt() {
      return this.$gettext('Navigate to personal files page')
    },

    logoImage() {
      return this.configuration.currentTheme.logo.topbar
    },

    isFeedbackLinkEnabled() {
      return !this.configuration?.options?.disableFeedbackLink
    },

    feedbackLinkOptions() {
      const feedback = this.configuration?.options?.feedbackLink
      if (!this.isFeedbackLinkEnabled || !feedback) {
        return {}
      }

      return {
        ...(feedback.href && { href: feedback.href }),
        ...(feedback.ariaLabel && { ariaLabel: feedback.ariaLabel }),
        ...(feedback.description && { description: feedback.description })
      }
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
    max-height: 42px;
    image-rendering: auto;
    image-rendering: crisp-edges;
    image-rendering: pixelated;
    image-rendering: -webkit-optimize-contrast;
    user-select: none;
  }

  .oc-topbar-left {
    gap: 30px;

    img.oc-logo-image {
      height: 42px;
    }
  }
  .oc-topbar-right {
    gap: 20px;
  }
  @media only screen and (max-width: 960px) {
    .oc-topbar-left,
    .oc-topbar-right {
      gap: 0.5rem;
    }
  }
}
</style>
