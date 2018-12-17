<template>
  <v-app light id="Phoenix">
    <notification-bar />
    <top-bar v-if="showHeader"></top-bar>
    <side-menu v-if="showHeader"></side-menu>
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>
<script>
import TopBar from './components/Top-Bar.vue'
import Menu from './components/Menu.vue'
import NotificationBar from './components/NotificationBar.vue'

export default {
  components: {
    NotificationBar,
    TopBar,
    'side-menu': Menu
  },
  beforeMount () {
    let instance = this.$root.config.server || window.location.origin
    this.$client.setInstance(instance)
    this.$store.dispatch('initAuth')
  },
  computed: {
    showHeader () {
      if (this.$route.meta.hideHeadbar === true) {
        return false
      } else {
        return true
      }
    }
  }
}
</script>
