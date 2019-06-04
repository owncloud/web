<template>
  <div id="Phoenix" class="uk-height-1-1">
    <template v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </template>
    <template v-else>
      <notification-bar />
      <top-bar></top-bar>
      <side-menu></side-menu>
      <div id="oc-app-container">
        <router-view name="app" class="uk-height-1-1"></router-view>
      </div>
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