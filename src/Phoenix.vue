<template>
  <div>
    <skip-to target="main">Skip to main</skip-to>
    <div id="Phoenix" class="uk-height-1-1">
      <template v-if="!showHeader">
        <router-view name="fullscreen"></router-view>
      </template>
      <template v-else>
        <message-bar :active-messages="activeMessages" @deleteMessage="$_deleteMessage" />
        <top-bar
          :applications-list="$_applicationsList"
          :active-notifications="activeNotifications"
          :user-id="user.id"
          :user-display-name="user.displayname"
          :has-app-navigation="appNavigationEntries.length > 1"
          @toggleAppNavigationVisibility="toggleAppNavigationVisibility"
        />
        <side-menu
          v-if="appNavigationEntries.length > 1"
          :visible="appNavigationVisible"
          :entries="appNavigationEntries"
          @closed="hideAppNavigation"
        />
        <main id="main">
          <router-view id="oc-app-container" name="app" class="uk-height-1-1"></router-view>
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
              @type="modal.onType"
            />
          </transition>
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
  data() {
    return {
      appNavigationVisible: false,
      $_notificationsInterval: null
    }
  },
  computed: {
    ...mapState(['route', 'user', 'modal']),
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

    appNavigationEntries() {
      if (this.publicPage()) {
        return []
      }

      // FIXME: use store or other ways, not $root
      const items = this.$root.navItems[this.currentExtension]

      if (!items) {
        return []
      }

      return items.filter(item => {
        if (item.enabled === undefined) {
          return true
        }

        if (this.capabilities === undefined) {
          return false
        }

        return item.enabled(this.capabilities)
      })
    },

    showHeader() {
      return this.$route.meta.hideHeadbar !== true
    },
    favicon() {
      return this.configuration.theme.logo.favicon
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
    }
  }
}
</script>
<style>
body {
  height: 100vh;
  overflow: hidden;
}

.oc-modal-background {
  position: fixed;
  top: 0;
  left: 0;
}
</style>
