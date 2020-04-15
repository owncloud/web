<template>
  <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 v-translate class="oc-login-logo">
        ownCloud
      </h1>
      <div v-show="error" class="oc-login-card-body">
        <h3 class="oc-login-card-title">
          <translate>Authentication failed</translate>
        </h3>
        <p v-translate>
          Please contact the administrator if this error persists.
        </p>
      </div>
      <div v-show="!error" class="oc-login-card-body">
        <h3 class="oc-login-card-title">
          <translate>Redirecting</translate>
        </h3>
        <p v-translate>
          Please wait a while. You are being redirected.
        </p>
      </div>
      <div class="oc-login-card-footer">
        <p>
          {{ configuration.theme.general.slogan }}
        </p>
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
    ...mapGetters(['configuration'])
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
