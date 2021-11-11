<template>
  <header
    id="oc-topbar"
    class="uk-flex uk-flex-middle uk-flex-between oc-mx-m"
    :aria-label="$gettext('Top bar')"
  >
  <div class="gap-15 uk-flex uk-flex-middle uk-flex-between">
    <applications-menu v-if="applicationsList.length > 0" :applications-list="applicationsList" />
    <router-link ref="navigationSidebarLogo" to="/">
      <oc-img :src="logoImage" :alt="sidebarLogoAlt" />
    </router-link>
  </div>
    <div class="portal-wrapper">
      <portal-target name="app.runtime.header" multiple></portal-target>
    </div>
    <div class="gap-15 uk-flex uk-flex-middle uk-flex-between">
      <feedback-link v-if="isFeedbackLinkEnabled" />
      <notifications v-if="activeNotifications.length" />
      <user-menu
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
    sidebarLogoAlt() {
      return this.$gettext('Navigate to all files page')
    },
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
    ...mapGetters(['configuration']),

    logoImage() {
      return this.configuration.theme.logo.sidebar
    },

    isFeedbackLinkEnabled() {
      return !this.configuration.options.disableFeedbackLink
    }
  }
}
</script>

<style lang="scss" scoped>
.gap-15 {
  gap: 15px;
}
#oc-topbar {
  z-index: 2;
  height: 80px;
  img {
    margin: 0 !important;
    height: 60px;
  }
}
</style>
