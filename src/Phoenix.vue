<template>
  <div class="uk-height-1-1">
    <skip-to target="main">Skip to main</skip-to>
    <div id="Phoenix" class="uk-height-1-1">
      <template v-if="!showHeader">
        <router-view name="fullscreen" />
      </template>
      <div v-else key="core-content" class="uk-height-1-1 uk-flex uk-flex-row uk-flex-row">
        <transition :name="appNavigationAnimation">
          <oc-sidebar
            v-if="isSidebarVisible"
            v-touch:swipe.left="handleNavSwipe"
            class="oc-app-navigation"
            :logo-img="logoImage"
            :product-name="productName"
            :nav-items="navItems"
            :class="sidebarClasses"
            :fixed="isSidebarFixed"
            @close="toggleAppNavigationVisibility"
          />
        </transition>
        <div class="uk-width-expand">
          <top-bar
            class="uk-width-expand"
            :applications-list="$_applicationsList"
            :active-notifications="activeNotifications"
            :user-id="user.id"
            :user-display-name="user.displayname"
            @toggleAppNavigationVisibility="toggleAppNavigationVisibility"
          />
          <main id="main">
            <message-bar :active-messages="activeMessages" @deleteMessage="$_deleteMessage" />
            <router-view id="oc-app-container" name="app" class="uk-height-1-1" />
          </main>
        </div>
      </div>
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
  data() {
    return {
      appNavigationVisible: false,
      $_notificationsInterval: null,
      windowWidth: 0
    }
  },
  computed: {
    ...mapState(['route', 'user']),
    ...mapGetters([
      'configuration',
      'activeNotifications',
      'activeMessages',
      'capabilities',
      'apps'
    ]),
    $_applicationsList() {
      const list = []

      // Get extensions manually added into config
      list.push(this.configuration.applications)

      // Get extensions which have at least one nav item
      const navItems = this.$root.navItems
      for (const extensionId in navItems) {
        list.push(this.apps[extensionId])
      }

      return list.flat()
    },

    showHeader() {
      return this.$route.meta.hideHeadbar !== true
    },
    favicon() {
      return this.configuration.theme.logo.favicon
    },

    logoImage() {
      return `/themes/${this.configuration.theme.name}/assets/logo.png`
    },

    productName() {
      return this.configuration.theme.general.name
    },

    navItems() {
      if (this.publicPage()) {
        return []
      }

      // FIXME: use store or other ways, not $root
      const items = this.$root.navItems[this.currentExtension]

      if (!items) {
        return []
      }

      items.filter(item => {
        if (this.capabilities === undefined) {
          return false
        }

        if (item.enabled === undefined) {
          return true
        }

        return item.enabled(this.capabilities)
      })

      return items.map(item => {
        item.name = this.$gettext(item.name)
        item.active = this.$route.name === item.route.name

        return item
      })
    },

    sidebarClasses() {
      if (this.appNavigationVisible) {
        return ''
      }

      return 'uk-visible@l'
    },

    isSidebarFixed() {
      return this.windowWidth <= 960
    },

    isSidebarVisible() {
      return this.windowWidth >= 1200 || this.appNavigationVisible
    },

    appNavigationAnimation() {
      if (this.windowWidth > 1200) {
        return null
      }

      if (this.windowWidth > 960) {
        return 'push-right'
      }

      return 'fade'
    }
  },
  watch: {
    $route() {
      this.appNavigationVisible = false
    },
    capabilities(caps) {
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

  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },

  destroyed() {
    if (this.$_notificationsInterval) {
      clearInterval(this.$_notificationsInterval)
    }
  },

  metaInfo() {
    const metaInfo = {
      title: this.configuration.theme.general.name
    }
    if (this.favicon) {
      metaInfo.link = [{ rel: 'icon', href: this.favicon }]
    }
    return metaInfo
  },

  mounted() {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      this.onResize()
    })
  },

  beforeMount() {
    this.initAuth()
  },

  methods: {
    ...mapActions(['initAuth', 'fetchNotifications', 'deleteMessage']),

    hideAppNavigation() {
      this.appNavigationVisible = false
    },

    toggleAppNavigationVisibility() {
      this.appNavigationVisible = !this.appNavigationVisible
    },

    $_updateNotifications() {
      this.fetchNotifications(this.$client).catch(error => {
        console.error('Error while loading notifications: ', error)
        clearInterval(this.$_notificationsInterval)
      })
    },

    $_deleteMessage(item) {
      this.deleteMessage(item)
    },

    onResize() {
      const width = window.innerWidth

      // Reset navigation visibility in case of switching back to permanently visible sidebar
      if (width >= 1200) {
        this.appNavigationVisible = false
      }

      this.windowWidth = width
    },

    handleNavSwipe() {
      if (this.windowWidth <= 960 || this.windowWidth > 1200) {
        return
      }

      this.appNavigationVisible = false
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
