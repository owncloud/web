<template>
  <div>
    <skip-to target="main">Skip to main</skip-to>
    <div id="Phoenix" class="uk-height-1-1">
      <template v-if="!showHeader">
        <router-view name="fullscreen"></router-view>
      </template>
      <template v-else>
        <message-bar />
        <top-bar navListUrl="navigation.json" :userId="user.id" :userDisplayName="user.displayname"></top-bar>
        <main id="main">
          <router-view id="oc-app-container" name="app" class="uk-height-1-1"></router-view>
        </main>
      </template>
    </div>
  </div>
</template>
<script>
import 'inert-polyfill'
import { mapGetters, mapState, mapActions } from 'vuex'
import TopBar from './components/Top-Bar.vue'
import MessageBar from './components/MessageBar.vue'
import SkipTo from './components/SkipTo.vue'

export default {
  components: {
    MessageBar,
    TopBar,
    SkipTo
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
    ...mapState(['route', 'user']),
    ...mapGetters(['configuration']),
    showHeader () {
      return this.$route.meta.hideHeadbar !== true
    },
    favicon () {
      return this.configuration.theme.logo.favicon
    },
    nav () {
      return this.$root.navItems.filter(item => {
        if (item.enabled === undefined) {
          return true
        }
        if (this.capabilities === undefined) {
          return false
        }
        return item.enabled(this.capabilities)
      })
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
