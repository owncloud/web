<template>
  <div id="web">
    <oc-hidden-announcer :announcement="announcement" level="polite" />
    <skip-to target="web-content-main">
      <translate>Skip to main</translate>
    </skip-to>
    <component :is="layout"></component>
    <portal-target name="app.runtime.modal" multiple></portal-target>
    <oc-modal
      v-if="modal.displayed"
      :variation="modal.variation"
      :icon="modal.icon"
      :title="modal.title"
      :message="modal.message"
      :has-input="modal.hasInput"
      :input-description="modal.inputDescription"
      :input-disabled="modal.inputDisabled"
      :input-error="modal.inputError"
      :input-label="modal.inputLabel"
      :input-selection-range="modal.inputSelectionRange"
      :input-type="modal.inputType"
      :input-value="modal.inputValue"
      :button-secondary-text="modal.buttonSecondaryText"
      :button-cancel-text="modal.cancelText"
      :button-confirm-text="modal.confirmText"
      :button-confirm-disabled="modal.confirmDisabled || !!modal.inputError"
      :checkbox-label="modal.checkboxLabel"
      :contextual-helper-label="modal.contextualHelperLabel"
      :contextual-helper-data="modal.contextualHelperData"
      @cancel="modal.onCancel"
      @confirm="modal.onConfirm"
      @input="modal.onInput"
      @checkbox-changed="modal.onCheckboxValueChanged"
      @confirm-secondary="modal.onConfirmSecondary"
      @mounted="focusModal"
      @beforeDestroy="focusModal"
    >
      <template v-if="modal.customContent" #content>
        <div v-html="modal.customContent"></div>
      </template>
    </oc-modal>
  </div>
</template>
<script lang="ts">
import { mapGetters, mapState, mapActions } from 'vuex'
import SkipTo from './components/SkipTo.vue'
import LayoutApplication from './layouts/Application.vue'
import LayoutLoading from './layouts/Loading.vue'
import LayoutPlain from './layouts/Plain.vue'
import { getBackendVersion, getWebVersion } from './container/versions'
import { defineComponent } from '@vue/composition-api'
import { isPublicLinkContext, isUserContext } from './router'
import { additionalTranslations } from './helpers/additionalTranslations' // eslint-disable-line
import { eventBus } from 'web-pkg/src/services'

export default defineComponent({
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
    ...mapGetters('runtime/auth', ['isUserContextReady', 'isPublicLinkContextReady']),
    layout() {
      const plainLayoutRoutes = [
        'login',
        'logout',
        'oidcCallback',
        'oidcSilentRedirect',
        'resolvePublicLink',
        'accessDenied'
      ]
      if (!this.$route.name || plainLayoutRoutes.includes(this.$route.name)) {
        return LayoutPlain
      }
      if (isPublicLinkContext(this.$router, this.$route)) {
        return this.isPublicLinkContextReady ? LayoutApplication : LayoutLoading
      }
      if (isUserContext(this.$router, this.$route)) {
        return this.isUserContextReady ? LayoutApplication : LayoutLoading
      }
      return LayoutApplication
    },
    favicon() {
      return this.configuration.currentTheme.logo.favicon
    },

    selectedLanguage() {
      return (
        this.getSettingsValue({
          extension: 'ocis-accounts',
          bundle: 'profile',
          setting: 'language'
        }) || this.user.language
      )
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: function (to) {
        const extracted = this.extractPageTitleFromRoute(to)
        if (!extracted) {
          return
        }
        const { shortDocumentTitle, fullDocumentTitle } = extracted
        this.announceRouteChange(shortDocumentTitle)
        document.title = fullDocumentTitle
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
        if (language) {
          if (typeof language === 'object' && language.listValue.values.length > 0) {
            languageCode = language.listValue.values[0].stringValue
          } else {
            languageCode = language
          }
        }
        if (languageCode?.indexOf('_')) {
          languageCode = languageCode.split('_')[0]
        }
        if (languageCode) {
          this.$language.current = languageCode
          document.documentElement.lang = languageCode
        }
      }
    }
  },
  mounted() {
    eventBus.subscribe(
      'runtime.documentTitle.changed',
      ({ shortDocumentTitle, fullDocumentTitle }) => {
        document.title = fullDocumentTitle
        this.announceRouteChange(shortDocumentTitle)
      }
    )
  },
  destroyed() {
    if (this.$_notificationsInterval) {
      clearInterval(this.$_notificationsInterval)
    }
  },

  metaInfo() {
    const metaInfo: any = {}
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

    announceRouteChange(pageTitle) {
      const translated = this.$gettext('Navigated to %{ pageTitle }')
      this.announcement = this.$gettextInterpolate(translated, { pageTitle })
    },

    extractPageTitleFromRoute(route) {
      const routeTitle = route.meta.title ? this.$gettext(route.meta.title) : undefined
      if (!routeTitle) {
        return
      }
      const glue = ' - '
      const titleSegments = [routeTitle]
      const generalName = this.configuration.currentTheme.general.name
      return {
        shortDocumentTitle: titleSegments.join(glue),
        fullDocumentTitle: [...titleSegments, generalName].join(glue)
      }
    }
  }
})
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

iframe {
  border: 0;
}
</style>
