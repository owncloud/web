<template>
  <div id="web">
    <oc-hidden-announcer :announcement="announcement" level="polite" />
    <skip-to target="main">
      <translate>Skip to main</translate>
    </skip-to>
    <div
      v-if="user.isAuthenticated && !user.userReady"
      class="loading-overlay"
      :style="{
        backgroundImage: 'url(' + configuration.theme.loginPage.backgroundImg + ')'
      }"
    >
      <oc-spinner size="xlarge" :aria-label="$gettext('Loading')" class="uk-position-center" />
    </div>
    <template v-else-if="!showHeader">
      <router-view name="fullscreen" />
    </template>
    <div v-else id="web-content" key="core-content" class="uk-flex uk-flex-stretch">
      <transition :name="appNavigationAnimation">
        <focus-trap v-if="isSidebarVisible" :active="isSidebarFixed && appNavigationVisible">
          <oc-sidebar-nav
            v-show="isSidebarVisible"
            id="web-nav-sidebar"
            v-touch:swipe.left="handleNavSwipe"
            class="oc-app-navigation"
            :accessible-label-header="$gettext('Sidebar header')"
            :accessible-label-nav="$gettext('Sidebar navigation menu')"
            :accessible-label-footer="$gettext('Sidebar footer')"
            :class="sidebarClasses"
          >
            <template #header>
              <div class="uk-text-center">
                <oc-button
                  v-if="isSidebarFixed"
                  variation="inverse"
                  appearance="raw"
                  class="web-sidebar-btn-close"
                  :aria-label="$gettext('Close sidebar')"
                  @click="toggleAppNavigationVisibility"
                >
                  <oc-icon name="close" />
                </oc-button>
                <router-link ref="navigationSidebarLogo" to="/">
                  <oc-logo :src="logoImage" :alt="sidebarLogoAlt" />
                </router-link>
              </div>
            </template>
            <template #nav>
              <oc-list>
                <oc-sidebar-nav-item
                  v-for="link in sidebarNavItems"
                  :key="link.route.path"
                  :active="link.active"
                  :target="link.route.path"
                  :icon="link.icon || link.iconMaterial"
                >
                  {{ link.name }}
                </oc-sidebar-nav-item>
              </oc-list>
            </template>
            <template v-if="sidebar.sidebarFooterContentComponent" #footer>
              <component :is="sidebar.sidebarFooterContentComponent" />
            </template>
          </oc-sidebar-nav>
        </focus-trap>
      </transition>
      <div class="uk-width-expand web-content-container">
        <top-bar
          v-if="!publicPage() && !$route.meta.verbose"
          id="oc-topbar"
          class="uk-width-expand"
          :applications-list="applicationsList"
          :active-notifications="activeNotifications"
          :user-id="user.username || user.id"
          :user-display-name="user.displayname"
          @toggleAppNavigationVisibility="toggleAppNavigationVisibility"
        />
        <div id="main">
          <message-bar :active-messages="activeMessages" @deleteMessage="$_deleteMessage" />
          <router-view class="oc-app-container" name="app" />
        </div>
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
        :focus-trap-active="true"
        :input-label="modal.inputLabel"
        :input-disabled="modal.inputDisabled"
        :input-value="modal.inputValue"
        :input-description="modal.inputDescription"
        :input-error="modal.inputError"
        :button-cancel-text="modal.cancelText"
        :button-confirm-text="modal.confirmText"
        :button-confirm-disabled="modal.confirmDisabled || !!modal.inputError"
        @cancel="modal.onCancel"
        @confirm="modal.onConfirm"
        @input="modal.onInput"
        @mounted="focusModal"
        @beforeDestroy="focusModal"
      />
    </transition>
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import TopBar from './components/TopBar.vue'
import MessageBar from './components/MessageBar.vue'
import SkipTo from './components/SkipTo.vue'
import { FocusTrap } from 'focus-trap-vue'

export default {
  components: {
    MessageBar,
    TopBar,
    SkipTo,
    FocusTrap
  },
  data() {
    return {
      appNavigationVisible: false,
      $_notificationsInterval: null,
      windowWidth: 0,
      announcement: ''
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

    sidebarLogoAlt() {
      return this.$gettext('Navigate to all files page')
    },

    sidebarNavItems() {
      if (!this.user.token) {
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
      if (this.sidebarNavItems.length === 0) {
        return false
      }
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
        this.announceRouteChange(to)
        document.title = this.extractPageTitleFromRoute(to)
        this.appNavigationVisible = false
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

    focusModal(component, event) {
      this.focus({
        revert: event === 'beforeDestroy'
      })
    },

    hideAppNavigation() {
      this.appNavigationVisible = false
    },

    toggleAppNavigationVisibility() {
      this.appNavigationVisible = !this.appNavigationVisible

      if (this.appNavigationVisible) {
        this.$nextTick(() => {
          this.$refs.navigationSidebarLogo.$el.focus()
        })
      }
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

    announceRouteChange(route) {
      const pageTitle = this.extractPageTitleFromRoute(route, false)
      const translated = this.$gettext('Navigated to %{ pageTitle }')
      this.announcement = this.$gettextInterpolate(translated, { pageTitle })
    },

    extractPageTitleFromRoute(route, includeGeneralName = true) {
      const routeTitle = route.meta.title ? this.$gettext(route.meta.title) : route.name
      const titleSegments = [routeTitle]

      if (includeGeneralName) {
        titleSegments.push(this.configuration.theme.general.name)
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
html,
body,
#web,
#web-content {
  height: 100%;
  overflow-y: hidden;
}

#web {
  background-color: var(--oc-color-background-default);
}

#oc-topbar {
  position: sticky;
  top: 0;
  height: 60px;
  z-index: 2;
  background-color: var(--oc-color-background-default);
}

.web-content-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content 1fr;
  gap: 0px 0px;
  grid-template-areas:
    'header'
    'main';
}

#main {
  position: relative;
  grid-area: main;
  overflow-y: auto;
}

#oc-header {
  grid-area: header;
}

.oc-app-navigation {
  position: sticky;
  top: 0;
  z-index: 1;
}

.loading-overlay {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: 50%;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.loading-overlay .oc-spinner {
  color: #0a264e;
}

.loading-overlay .oc-spinner:after {
  border: 10px solid;
  border-bottom: 10px solid transparent;
}

@media only screen and (max-width: 960px) {
  #web-nav-sidebar {
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 3;
  }
}

.web-sidebar-btn-close {
  position: absolute;
  right: var(--oc-space-medium);
  top: var(--oc-space-medium);
  z-index: 3;
}
</style>
