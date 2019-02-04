<template>
  <v-app light id="Phoenix"
         :class="{ loginGradient: showGradientBackground}"
         :style="showImageBackground ? { 'background-image': 'url('+configuration.theme.logo.background+')',
                 'background-size':'cover'} : {}"
  >
    <notification-bar />
    <top-bar v-if="showHeader"></top-bar>
    <side-menu v-if="showHeader"></side-menu>
    <router-view></router-view>
  </v-app>
</template>
<script>
import { mapGetters } from 'vuex'
import TopBar from './components/Top-Bar.vue'
import Menu from './components/Menu.vue'
import NotificationBar from './components/NotificationBar.vue'

export default {
  components: {
    NotificationBar,
    TopBar,
    'side-menu': Menu
  },
  computed: {
    ...mapGetters(['configuration']),
    showHeader () {
      return this.$route.meta.hideHeadbar !== true
    },
    showBackground () {
      if (!this.$route.meta.showBackground) {
        return false
      }
      return this.$route.meta.showBackground === true
    },
    showGradientBackground () {
      if (!this.showBackground) {
        return false
      }
      return !this.configuration.theme.logo.background
    },
    showImageBackground () {
      if (!this.showBackground) {
        return false
      }
      return this.configuration.theme.logo.background
    }
  }
}
</script>

<style>
  .loginGradient {
    background-image: linear-gradient(var(--v-primary-base), var(--v-secondary-base)) !important;
  }
</style>
