<template>
  <div
    id="Phoenix"
    :class="['uk-flex uk-flex-column uk-height-1-1', { loginGradient: showGradientBackground}]"
    :style="showImageBackground ? { 'background-image': 'url('+configuration.theme.logo.background+')',
      'background-size':'cover'} : {}"
  >
    <template v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </template>
    <template v-else>
      <notification-bar />
      <top-bar></top-bar>
      <side-menu></side-menu>
      <div class="uk-height-1-1 uk-overflow-auto">
        <router-view name="appContent"></router-view>
      </div>
    </template>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import TopBar from './components/Top-Bar.vue'
import Menu from './components/Menu.vue'
import NotificationBar from './components/NotificationBar.vue'

export default {
  components: {
    NotificationBar,
    'side-menu': Menu,
    TopBar
  },
  beforeMount () {
    let instance = this.$root.config.server || window.location.origin
    this.$client.setInstance(instance)
    this.$store.dispatch('initAuth')
  },
  computed: {
    ...mapState(['route']),
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
  body {
    height: 100vh;
    overflow: hidden;
  }
</style>
