<template>
  <v-app light id="Phoenix"
         :class="{ loginGradient: showGradientBackground}"
         :style="showImageBackground ? { 'background-image': 'url('+configuration.theme.logo.background+')',
                 'background-size':'cover'} : {}"
  >
    <div v-if="!showHeader">
      <router-view name="fullscreen"></router-view>
    </div>
    <div v-else>
      <notification-bar />
      <top-bar></top-bar>
      <side-menu></side-menu>
      <router-view v-if="this.$route.matched[0].components.appTopbar" class="appTopbar" name="appTopbar"></router-view>
      <router-view style="margin-top: 115px" name="appContent"></router-view>
    </div>
  </v-app>
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
  .oc-app {
    display: grid;
    max-height: calc(100vh - 115px);
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto;
    grid-template-areas: "ocAppNavbar ocAppContent ocAppSidebar";
  }
  .oc-app-navbar {
    max-width: 20vw;
    grid-area: ocAppNavbar;
  }

  .oc-app-sidebar {
    min-width: 280px;
    max-width: 20vw;
    position: sticky;
    grid-area: ocAppSidebar;
  }

  .oc-app-content {
    overflow-y: scroll;
    height: calc(100vh - 115px);
    max-width: 100%;
    grid-area: ocAppContent;
  }
  .grid-container {
    display: grid;
    grid-template-columns: auto 1.5fr;
    grid-template-rows: 1fr;
    grid-template-areas: "sidebar content";
  }
  .appTopbar {
    position: fixed;
    top: 50px;
    z-index: 2;
    width: 100%;
    height: 60px;
  }
  .sidebar { grid-area: sidebar;
            background-color: brown;
            overflow: auto;
            transition: all 1s; }

  .content { grid-area: content; }
  body, html {
      overflow-y: hidden;
      overflow: -moz-scrollbars-none;
      -ms-overflow-style: none;  /* IE 10+ */
  }
  body::-webkit-scrollbar { /* WebKit */
      display: none;
      width: 0;
      height: 0;
  }

  .loginGradient {
    background-image: linear-gradient(var(--v-primary-base), var(--v-secondary-base)) !important;
  }
</style>
