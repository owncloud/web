<template>
  <div>
    <skip-to target="main">Skip to main</skip-to>
    <div id="Phoenix" class="uk-height-1-1">
      <template v-if="!showHeader">
        <router-view name="fullscreen"></router-view>
      </template>
      <template v-else>
        <message-bar :active-messages="activeMessages" @deleteMessage="$_deleteMessage" />
        <top-bar :applicationsList="$_applicationsList" :activeNotifications="activeNotifications" :user-id="user.id" :user-display-name="user.displayname" :hasAppNavigation="!!appNavigationEntries.length" @toggleAppNavigation="$_toggleAppNavigation(!appNavigationVisible)"></top-bar>
        <side-menu :visible="appNavigationVisible" :entries="appNavigationEntries" @closed="$_toggleAppNavigation(false)"></side-menu>
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
import Menu from './components/Menu.vue'
import MessageBar from './components/MessageBar.vue'
import SkipTo from './components/SkipTo.vue'

export default {
  components: {
    MessageBar,
    'side-menu': Menu,
    TopBar,
    SkipTo
  },
  data () {
    return {
      appNavigationVisible: false,
      $_notificationsInterval: null
    }
  },
  computed: {
    ...mapState(['route', 'user']),
    ...mapGetters(['configuration', 'activeNotifications', 'activeMessages', 'capabilities']),
    $_applicationsList () {
      return this.configuration.applications
    },

    appNavigationEntries () {
      if (this.publicPage()) {
        return []
      }
      // FIXME: use store or other ways, not $root
      return this.$root.navItems.filter(item => {
        // FIXME: filter to only show current app
        if (item.enabled === undefined) {
          return true
        }
        if (this.capabilities === undefined) {
          return false
        }
        return item.enabled(this.capabilities)
      })
    },
    showHeader () {
      return this.$route.meta.hideHeadbar !== true
    },
    favicon () {
      return this.configuration.theme.logo.favicon
    }
  },
  watch: {
    $route () {
      this.appNavigationVisible = false
    },
    capabilities (caps) {
      if (!caps) {
        // capabilities not loaded yet
        return
      }

      // setup periodic loading of notifications if the server supports them
      if (caps.notifications) {
        this.$nextTick(() => {
          this.$_updateNotifications()
        })
        this.$_notificationsInterval = setInterval(() => {
          this.$_updateNotifications()
        }, 30000)
      }
    }
  },
  destroyed () {
    if (this.$_notificationsInterval) {
      clearInterval(this.$_notificationsInterval)
    }
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
  methods: {
    ...mapActions(['initAuth', 'fetchNotifications', 'deleteMessage']),
    $_toggleAppNavigation (state) {
      this.appNavigationVisible = state
    },
    $_updateNotifications () {
      this.fetchNotifications(this.$client).catch((error) => {
        console.error('Error while loading notifications: ', error)
        clearInterval(this.$_notificationsInterval)
      })
    },
    $_deleteMessage (item) {
      this.deleteMessage(item)
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
