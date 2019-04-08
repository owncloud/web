<template>
  <div id="Phoenix" :class="{ loginGradient: showGradientBackground}"
       :style="showImageBackground ? { 'background-image': 'url('+configuration.theme.logo.background+')',
                 'background-size':'cover'} : {}">
    <div v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </div>
    <div v-else>
      <notification-bar />
      <top-bar></top-bar>
      <side-menu></side-menu>
      <router-view v-if="this.$route.matched[0].components.appTopbar" class="appTopbar" name="appTopbar"></router-view>
      <router-view name="appContent"></router-view>
    </div>
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
