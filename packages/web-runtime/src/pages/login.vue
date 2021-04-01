<template>
  <div
    v-if="initialized"
    class="oc-login"
    uk-height-viewport
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <div class="oc-login-card uk-position-center">
      <img class="oc-login-logo" :src="logoImg" :alt="configuration.theme.general.name" />
      <div class="oc-login-card-body">
        <h3 class="oc-login-card-title">
          <translate :translate-params="{ productName: $_productName }"
            >Welcome to %{productName}</translate
          >
        </h3>
        <p v-translate>
          Please click the button below to authenticate and get access to your data.
        </p>
        <oc-button
          id="authenticate"
          size="large"
          variation="primary"
          class="oc-login-authorize-button"
          @click="login()"
        >
          <translate>Login</translate>
        </oc-button>
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
  name: 'LoginPage',
  data() {
    return {
      loading: false,
      initialized: false
    }
  },
  computed: {
    ...mapGetters(['configuration']),

    $_productName() {
      return this.configuration.theme.general.name
    },

    logoImg() {
      return this.configuration.theme.logo.login
    },

    backgroundImg() {
      return this.configuration.theme.loginPage.backgroundImg
    }
  },

  created() {
    if (this.configuration.theme.loginPage.autoRedirect) {
      this.login()
    } else {
      this.initialized = true
    }
  },

  methods: {
    ...mapActions(['login'])
  }
}
</script>
