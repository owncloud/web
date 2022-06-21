<template>
  <div
    class="oc-login oc-height-viewport"
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-login-card oc-position-center">
      <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
      <div v-show="error" class="oc-login-card-body">
        <h2 v-translate class="oc-login-card-title">Authentication failed</h2>
        <p v-translate>Please contact the administrator if this error persists.</p>
      </div>
      <div v-show="!error" class="oc-login-card-body">
        <h3 v-translate class="oc-login-card-title">Logging you in</h3>
        <p v-translate>Please wait, you are being redirected.</p>
      </div>
      <div class="oc-login-card-footer">
        <p>{{ configuration.currentTheme.general.slogan }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { authService } from '../services/auth'

export default {
  name: 'OidcCallbackPage',
  data() {
    return {
      error: false
    }
  },

  computed: {
    ...mapGetters(['configuration']),

    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },

    backgroundImg() {
      return this.configuration.currentTheme.loginPage.backgroundImg
    },

    logoImg() {
      return this.configuration.currentTheme.logo.login
    }
  },

  mounted() {
    if (this.$route.query.error) {
      this.error = true
      console.warn(
        'OAuth error: ' + this.$route.query.error + ' - ' + this.$route.query.error_description
      )
      return
    }
    console.log('oidcCallback mounted', this.$route)
    if (this.$route.path === '/oidc-silent-redirect') {
      authService.signInSilentCallback()
    } else {
      authService.signInCallback()
    }
  }
}
</script>
