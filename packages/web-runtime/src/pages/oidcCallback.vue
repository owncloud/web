<template>
  <div
    class="oc-login"
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
    uk-height-viewport
  >
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-login-card uk-position-center">
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
        <p>{{ configuration.theme.general.slogan }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
      return this.configuration.theme.loginPage.backgroundImg
    },

    logoImg() {
      return this.configuration.theme.logo.login
    }
  },

  mounted() {
    this.$nextTick(() => {
      if (this.$route.query.error) {
        this.error = true
        console.warn(
          'OAuth error: ' + this.$route.query.error + ' - ' + this.$route.query.error_description
        )
        return
      }
      if (this.$route.path === '/oidc-silent-redirect') {
        this.signinSilentCallback()
      } else {
        this.callback()
      }
    })
  },
  methods: {
    ...mapActions(['callback', 'signinSilentCallback'])
  }
}
</script>
