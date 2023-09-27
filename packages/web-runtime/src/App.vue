<template>
  <portal-target name="app.app-banner" multiple />
  <div id="web">
    <oc-hidden-announcer :announcement="announcement" level="polite" />
    <skip-to target="web-content-main">
      <span v-text="$gettext('Skip to main')" />
    </skip-to>
    <component :is="layout"></component>
    <portal-target name="app.runtime.modal" multiple />
    <oc-modal
      v-if="modal.displayed"
      :variation="modal.variation"
      :icon="modal.icon"
      :title="modal.title"
      :message="modal.message"
      :has-input="modal.hasInput"
      :input-description="modal.inputDescription"
      :input-placeholder="modal.inputPlaceholder"
      :input-password-policy="modal.inputPasswordPolicy"
      :input-generate-password-method="modal.inputGeneratePasswordMethod"
      :input-disabled="modal.inputDisabled"
      :input-error="modal.inputError"
      :input-label="modal.inputLabel"
      :input-selection-range="modal.inputSelectionRange"
      :input-type="modal.inputType"
      :input-value="modal.inputValue"
      :button-secondary-text="modal.buttonSecondaryText"
      :without-button-confirm="modal.withoutButtonConfirm"
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
      @passwordChallengeCompleted="modal.onPasswordChallengeCompleted"
      @passwordChallengeFailed="modal.onPasswordChallengeFailed"
      @mounted="focusModal"
      @before-unmount="focusModal"
    >
      <template v-if="modal.customContent" #content>
        <div v-html="modal.customContent" />
      </template>
    </oc-modal>
  </div>
</template>
<script lang="ts">
import { mapGetters, mapState } from 'vuex'
import SkipTo from './components/SkipTo.vue'
import LayoutApplication from './layouts/Application.vue'
import LayoutLoading from './layouts/Loading.vue'
import LayoutPlain from './layouts/Plain.vue'
import { defineComponent } from 'vue'
import { isPublicLinkContext, isUserContext } from './router'
import { additionalTranslations } from './helpers/additionalTranslations' // eslint-disable-line
import { eventBus } from '@ownclouders/web-pkg'
import { useHead } from './composables/head'
import { useStore } from '@ownclouders/web-pkg'

export default defineComponent({
  components: {
    SkipTo
  },
  setup() {
    const store = useStore()
    useHead({ store })
  },
  data() {
    return {
      windowWidth: 0,
      announcement: '',
      activeBlobStyle: {}
    }
  },
  computed: {
    ...mapState(['modal']),
    ...mapGetters(['configuration']),
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
      if (!this.$route.name || plainLayoutRoutes.includes(this.$route.name as string)) {
        return LayoutPlain
      }
      if (isPublicLinkContext(this.$router, this.$route)) {
        return this.isPublicLinkContextReady ? LayoutApplication : LayoutLoading
      }
      if (isUserContext(this.$router, this.$route)) {
        return this.isUserContextReady ? LayoutApplication : LayoutLoading
      }
      return LayoutApplication
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
  methods: {
    focusModal(component, event) {
      ;(this as any).focus({
        revert: event === 'beforeUnmount'
      })
    },

    announceRouteChange(pageTitle) {
      this.announcement = this.$gettext('Navigated to %{ pageTitle }', { pageTitle })
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
