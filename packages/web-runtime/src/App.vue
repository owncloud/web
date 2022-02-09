<template>
  <div id="web">
    <oc-hidden-announcer :announcement="announcement" level="polite" />
    <skip-to target="web-content-main">
      <translate>Skip to main</translate>
    </skip-to>
    <component :is="layout"></component>
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
  </div>
</template>
<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import SkipTo from './components/SkipTo.vue'
import LayoutApplication from './layouts/Application.vue'
import LayoutLoading from './layouts/Loading.vue'
import LayoutPlain from './layouts/Plain.vue'
import { getBackendVersion, getWebVersion } from './container/versions'

export default {
  components: {
    SkipTo
  },
  data() {
    return {
      $_notificationsInterval: null,
      windowWidth: 0,
      announcement: '',
      activeBlobStyle: {}
    }
  },
  computed: {
    ...mapState(['route', 'user', 'modal', 'sidebar']),
    ...mapGetters(['configuration', 'capabilities', 'getSettingsValue']),
    layout() {
      if (this.user.isAuthenticated && !this.user.userReady) {
        return LayoutLoading
      }

      if (
        [
          'login',
          'oidcCallback',
          'oidcSilentRedirect',
          'privateLink',
          'publicLink',
          'accessDenied'
        ].includes(this.$route.name)
      ) {
        return LayoutPlain
      }

      return LayoutApplication
    },
    favicon() {
      return this.configuration.currentTheme.logo.favicon
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
    const metaGenerator = {
      name: 'generator',
      content: [getWebVersion(), getBackendVersion({ store: this.$store })]
        .filter(Boolean)
        .join(', ')
    }
    metaInfo.meta = [metaGenerator]
    return metaInfo
  },

  methods: {
    ...mapActions(['fetchNotifications']),

    focusModal(component, event) {
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

    announceRouteChange(route) {
      const pageTitle = this.extractPageTitleFromRoute(route, false)
      const translated = this.$gettext('Navigated to %{ pageTitle }')
      this.announcement = this.$gettextInterpolate(translated, { pageTitle })
    },

    extractPageTitleFromRoute(route, includeGeneralName = true) {
      const routeTitle = route.meta.title ? this.$gettext(route.meta.title) : route.name
      const titleSegments = [routeTitle]

      if (includeGeneralName) {
        titleSegments.push(this.configuration.currentTheme.general.name)
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
  margin: 0;
}

#web {
  background-color: var(--oc-color-swatch-brand-default);
  height: 100vh;
  max-height: 100vh;
  overflow-y: hidden;
}
</style>
