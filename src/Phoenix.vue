<template>
  <div id="Phoenix">
    <template v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </template>
    <template v-else>
      <notification-bar />
      <top-bar />
      <side-menu />
      <router-view name="app" id="app-container"></router-view>
    </template>
  </div>
</template>
<script>
import { mapGetters, mapState } from 'vuex'
import TopBar from './components/TopBar.vue'
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
    }
  }
}
</script>
<!-- @TODO: Move to base style -->
<style>
#app-container {
  height: calc(100vh - 60px);
}
</style>
