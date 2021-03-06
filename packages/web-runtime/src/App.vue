<template>
  <div class="uk-height-1-1">
    <skip-to target="main">Skip to main</skip-to>
    <div id="Web" class="uk-height-1-1">
      <div
        v-if="user.isAuthenticated && !user.userReady"
        class="loading-overlay"
        :style="{
          backgroundImage: 'url(' + configuration.theme.loginPage.backgroundImg + ')'
        }"
        uk-height-viewport
      >
        <oc-spinner size="xlarge" :aria-label="$gettext('Loading')" class="uk-position-center" />
      </div>
      <template v-else-if="!showHeader">
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
            :nav-items="sidebarNavItems"
            :hide-nav="sidebar.navigationHidden"
            :class="sidebarClasses"
            :fixed="isSidebarFixed"
            @close="toggleAppNavigationVisibility"
          >
            <template v-if="sidebar.mainContentComponent" v-slot:mainContent>
              <component :is="sidebar.mainContentComponent" />
            </template>
            <template v-if="sidebar.sidebarFooterContentComponent" v-slot:footer>
              <component :is="sidebar.sidebarFooterContentComponent" />
            </template>
          </oc-sidebar>
        </transition>
        <div class="uk-width-expand">
          <top-bar
            v-if="!publicPage() && !$route.meta.verbose"
            class="uk-width-expand"
            :applications-list="applicationsList"
            :active-notifications="activeNotifications"
            :user-id="user.username || user.id"
            :user-display-name="user.displayname"
            @toggleAppNavigationVisibility="toggleAppNavigationVisibility"
          />
          <main id="main">
            <message-bar :active-messages="activeMessages" @deleteMessage="$_deleteMessage" />
            <router-view id="oc-app-container" name="app" class="uk-height-1-1" />
          </main>
        </div>
      </div>
      <transition
        enter-active-class="uk-animation-fade uk-animation-fast"
        leave-active-class="uk-animation-fade uk-animation-reverse uk-animation-fast"
        name="custom-classes-transition"
      >
        <oc-modal
          v-if="modal.displayed"
          :variation="modal.variation"
          :icon="modal.icon"
          :title="modal.title"
          :message="modal.message"
          :has-input="modal.hasInput"
          :input-label="modal.inputLabel"
          :input-disabled="modal.inputDisabled"
          :input-value="modal.inputValue"
          :input-placeholder="modal.inputPlaceholder"
          :input-error="modal.inputError"
          :button-cancel-text="modal.cancelText"
          :button-confirm-text="modal.confirmText"
          :button-confirm-disabled="modal.confirmDisabled || !!modal.inputError"
          @cancel="modal.onCancel"
          @confirm="modal.onConfirm"
          @input="modal.onInput"
        />
      </transition>
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
    ...mapState(['route', 'user', 'modal', 'sidebar']),
    ...mapGetters([
      'configuration',
      'activeNotifications',
      'activeMessages',
      'capabilities',
      'apps',
      'getSettingsValue',
      'getNavItemsByExtension',
      'getExtensionsWithNavItems'
    ]),
    applicationsList() {
      const list = []

      // Get extensions which have at least one nav item
      this.getExtensionsWithNavItems.forEach(extensionId => {
        list.push({
          ...this.apps[extensionId],
          type: 'extension'
        })
      })

      // Get extensions manually added into config
      this.configuration.applications.forEach(application => {
        list.push({
          ...application,
          type: 'link'
        })
      })

      return list
    },
    showHeader() {
      return this.$route.meta.hideHeadbar !== true
    },
    favicon() {
      return this.configuration.theme.logo.favicon
    },

    logoImage() {
      return this.configuration.theme.logo.sidebar
    },

    productName() {
      return this.configuration.theme.general.name
    },

    sidebarNavItems() {
      if (this.publicPage()) {
        return []
      }

      const items = this.getNavItemsByExtension(this.currentExtension)
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

      return items.map(item => ({
        ...item,
        name: this.$gettext(item.name),
        active: this.$route.name === item.route.name
      }))
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
    },

    selectedLanguage() {
      return this.getSettingsValue({
        extension: 'ocis-accounts',
        bundle: 'profile',
        setting: 'language'
      })
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: function(to) {
        document.title = this.extractPageTitleFromRoute(to)
      }
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
    },
    selectedLanguage: {
      immediate: true,
      handler(language) {
        let languageCode = this.$language.defaultLanguage
        if (language !== null && language.listValue.values.length > 0) {
          languageCode = language.listValue.values[0].stringValue
        }
        if (languageCode) {
          this.$language.current = languageCode
          document.documentElement.lang = languageCode
        }
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
    const metaInfo = {}
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
    },
    extractPageTitleFromRoute(route) {
      const titleSegments = [this.configuration.theme.general.name]

      if (route.meta.pageTitle) {
        titleSegments.unshift(route.meta.pageTitle)
      }

      if (route.params.item) {
        if (route.name.startsWith('files-')) {
          const fileTree = route.params.item.split('/').filter(el => el.length)

          if (fileTree.length) {
            titleSegments.unshift(fileTree.pop())
          }
        } else {
          titleSegments.unshift(route.params.item)
        }
      }

      return titleSegments.join(' - ')
    }
  }
}
</script>
<style>
body {
  height: 100vh;
  overflow: hidden;
}

#main {
  position: relative;
}

.loading-overlay {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50%;
}

.loading-overlay .oc-spinner {
  color: #0a264e;
}

.loading-overlay .oc-spinner:after {
  border: 10px solid;
  border-bottom: 10px solid transparent;
}
</style>
