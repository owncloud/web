<template>
  <div id="web">
    <oc-hidden-announcer :announcement="announcement" level="polite" />
    <skip-to target="main">
      <translate>Skip to main</translate>
    </skip-to>
    <div
      v-if="user.isAuthenticated && !user.userReady"
      class="loading-overlay uk-flex uk-flex-middle uk-flex-center"
      :style="{
        backgroundImage: 'url(' + configuration.theme.loginPage.backgroundImg + ')'
      }"
    >
      <oc-spinner size="xlarge" :aria-label="$gettext('Loading')" />
    </div>
    <template v-else-if="!showHeader">
      <router-view name="fullscreen" />
    </template>
    <div v-else id="web-content" key="core-content" class="uk-width-expand web-content-container">
      <top-bar
        v-if="!publicPage() && !$route.meta.verbose"
        :applications-list="applicationsList"
        :active-notifications="activeNotifications"
        :user-id="user.username || user.id"
        :user-display-name="user.displayname"
      />
      <div id="main" class="oc-my-l oc-mx-l">
        <message-bar :active-messages="activeMessages" @deleteMessage="$_deleteMessage" />
        <router-view class="oc-app-container" name="app" />
      </div>
    </div>
    <transition name="custom-classes-transition">
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

export default {
  components: {
    MessageBar,
    TopBar,
    SkipTo
  },
  data() {
    return {
      $_notificationsInterval: null,
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
      'getExtensionsWithNavItems'
    ]),
    applicationsList() {
      const list = []

      // Get extensions which have at least one nav item
      this.getExtensionsWithNavItems.forEach((extensionId) => {
        list.push({
          ...this.apps[extensionId],
          type: 'extension'
        })
      })

      // Get extensions manually added into config
      this.configuration.applications.forEach((application) => {
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
      handler: function (to) {
        this.announceRouteChange(to)
        document.title = this.extractPageTitleFromRoute(to)
      }
    },
    capabilities: {
      immediate: true,
      handler: function (caps) {
        if (!caps?.notifications) {
          return
        }

        // setup periodic loading of notifications if the server supports them
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

  methods: {
    ...mapActions(['fetchNotifications', 'deleteMessage']),

    focusModal(event) {
      this.focus({
        revert: event === 'beforeDestroy'
      })
    },

    $_updateNotifications() {
      this.fetchNotifications(this.$client).catch((error) => {
        console.error('Error while loading notifications: ', error)
        clearInterval(this.$_notificationsInterval)
      })
    },

    $_deleteMessage(item) {
      this.deleteMessage(item)
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
          const fileTree = route.params.item.split('/').filter((el) => el.length)

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
<style lang="scss">
body {
  background-color: var(--oc-color-swatch-brand-default);
}

html,
body,
#web,
#web-content {
  height: 100%;
  overflow-y: hidden;
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
  background-color: var(--oc-color-swatch-brand-default);
  border-radius: 2rem;
  grid-area: main;
  overflow-y: auto;
  main {
    background-color: var(--oc-color-background-default);
  }
}

.loading-overlay {
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  height: 100%;
  width: 100%;

  .oc-spinner {
    color: #0a264e;
    display: inline-block;
    &::after {
      border: 10px solid;
      border-bottom: 10px solid transparent;
    }
  }
}
</style>
