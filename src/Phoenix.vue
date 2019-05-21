<template>
  <div id="Phoenix" class="uk-flex uk-flex-column uk-height-1-1">
    <template v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </template>
    <template v-else>
      <notification-bar />
      <top-bar></top-bar>
      <side-menu></side-menu>
      <router-view v-if="this.$route.matched[0].components.appTopbar" class="appTopbar" name="appTopbar"></router-view>
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
    }
  }
}
</script>
