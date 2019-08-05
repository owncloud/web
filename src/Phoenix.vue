<template>
  <div id="Phoenix" class="uk-height-1-1">
    <template v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </template>
    <template v-else>
      <message-bar />
      <top-bar></top-bar>
      <side-menu></side-menu>
      <router-view id="oc-app-container" name="app" class="uk-height-1-1"></router-view>
    </template>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import TopBar from './components/Top-Bar.vue'
import Menu from './components/Menu.vue'
import MessageBar from './components/MessageBar.vue'

export default {
  components: {
    MessageBar,
    'side-menu': Menu,
    TopBar
  },
  metaInfo () {
    const metaInfo = {
      title: this.configuration.theme.general.name
    }
    if (this.favicon) {
      metaInfo.link = [
        { rel: 'icon', href: this.favicon }
      ]
    }
    return metaInfo
  },
  beforeMount () {
    this.initAuth()
  },
  computed: {
    ...mapState(['route']),
    ...mapGetters(['configuration']),
    showHeader () {
      return this.$route.meta.hideHeadbar !== true
    },
    favicon () {
      return this.configuration.theme.logo.favicon
    }
  },
  methods: {
    ...mapActions(['initAuth'])
  }
}
</script>
<style>
  body {
    height: 100vh;
    overflow: hidden;
  }
</style>
