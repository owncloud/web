<template>
  <div
    class="oc-login oc-height-viewport"
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-login-card oc-position-center">
      <img class="oc-login-logo" :src="logoImg" alt="logo" :aria-hidden="true" />
      <div class="oc-login-card-body oc-width-large">
        <h3 class="oc-login-card-title">
          <span v-translate>Login Error</span>
        </h3>
        <h4 v-translate class="oc-mb-m">Your user session is invalid or has expired.</h4>
        <div v-translate class="oc-mb-m">
          If you like to login with a different user please proceed to
          <router-link id="exitAnchor" :to="{ name: 'login' }">exit</router-link>
        </div>
        <div v-translate class="oc-m-rm">
          <strong>Attention:</strong> this will log you out from all applications you are running in
          this browser with your current user.
        </div>
      </div>
      <div class="oc-login-card-footer oc-width-large">
        <p>
          {{ helpDeskText }}
          <a v-if="helpDeskLink" :href="helpDeskLink" v-text="helpDeskLinkText" />
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/runtime-core'
import { mapGetters } from 'vuex'
export default defineComponent({
  name: 'AccessDeniedPage',
  computed: {
    ...mapGetters(['configuration']),
    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },
    helpDeskText() {
      if (
        this.configuration.currentTheme.general.helpDeskText &&
        this.configuration.currentTheme.general.helpDeskText.en
      ) {
        const lang = this.$language.current
        if (this.configuration.currentTheme.general.helpDeskText[lang]) {
          return this.configuration.currentTheme.general.helpDeskText[lang]
        }
        return this.configuration.currentTheme.general.helpDeskText.en
      }
      return this.$gettext(
        'Please contact your administrator if you think this message shows up in error.'
      )
    },
    helpDeskLink() {
      if (this.configuration.currentTheme.general.helpDeskLink) {
        return this.configuration.currentTheme.general.helpDeskLink
      }
      return ''
    },
    helpDeskLinkText() {
      if (this.configuration.currentTheme.general.helpDeskLinkText) {
        return this.configuration.currentTheme.general.helpDeskLinkText
      }
      return ''
    },

    logoImg() {
      return this.configuration.currentTheme.logo.login
    },

    backgroundImg() {
      return this.configuration.currentTheme.loginPage.backgroundImg
    }
  }
})
</script>
