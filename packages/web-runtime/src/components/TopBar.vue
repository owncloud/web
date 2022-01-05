<template>
  <header
    id="oc-topbar"
    class="uk-flex uk-flex-middle uk-flex-between oc-px-m"
    :aria-label="$gettext('Top bar')"
  >
    <div class="topbar-gap uk-flex uk-flex-middle uk-flex-between">
      <applications-menu v-if="applicationsList.length" :applications-list="applicationsList" />
      <router-link ref="navigationSidebarLogo" to="/">
        <oc-img :src="logoImage" :alt="sidebarLogoAlt" />
      </router-link>
    </div>
    <div class="portal-wrapper">
      <portal-target name="app.runtime.header" multiple></portal-target>
    </div>
    <div class="topbar-gap uk-flex uk-flex-middle uk-flex-between">
      <feedback-link v-if="isFeedbackLinkEnabled" />
      <notifications v-if="isNotificationBellEnabled" />
      <user-menu
        v-if="isUserMenuEnabled"
        :user-id="userId"
        :user-display-name="userDisplayName"
        :applications-list="applicationsList"
      />
    </div>
  </header>
</template>

<script>
import { mapGetters } from 'vuex'

import ApplicationsMenu from './ApplicationsMenu.vue'
import UserMenu from './UserMenu.vue'
import Notifications from './Notifications.vue'
import FeedbackLink from './FeedbackLink.vue'

export default {
  components: {
    FeedbackLink,
    Notifications,
    ApplicationsMenu,
    UserMenu
  },
  props: {
    userId: {
      type: String,
      required: false,
      default: ''
    },
    userDisplayName: {
      type: String,
      required: false,
      default: ''
    },
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

    sidebarLogoAlt() {
      return this.$gettext('Navigate to all files page')
    },

    logoImage() {
      return this.configuration.theme.logo.sidebar
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
  z-index: 2;
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
