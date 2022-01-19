<template>
  <div
    v-if="initialized"
    class="oc-login oc-height-viewport"
    :style="{ backgroundImage: 'url(' + backgroundImg + ')' }"
  >
    <h1 class="oc-invisible-sr">{{ pageTitle }}</h1>
    <div class="oc-login-card oc-position-center">
      <img class="oc-login-logo" :src="logoImg" alt="" :aria-hidden="true" />
      <div class="oc-login-card-body">
        <h2 class="oc-login-card-title">
          <translate :translate-params="{ productName: $_productName }"
            >Welcome to %{productName}</translate
          >
        </h2>
        <p v-translate>
          Please click the button below to authenticate and get access to your data.
        </p>
        <oc-button
          id="authenticate"
          size="large"
          variation="primary"
          appearance="filled"
          class="oc-login-authorize-button"
          @click="login()"
        >
          <translate>Login</translate>
        </oc-button>
      </div>
      <div class="oc-login-card-footer">
        <p>
          {{ configuration.currentTheme.general.slogan }}
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

    pageTitle() {
      return this.$gettext(this.$route.meta.title)
    },

    $_productName() {
      return this.configuration.currentTheme.general.name
    },

    logoImg() {
      return this.configuration.currentTheme.logo.login
    },

    backgroundImg() {
      return this.configuration.currentTheme.loginPage.backgroundImg
    }
  },

  created() {
    if (this.configuration.currentTheme.loginPage.autoRedirect) {
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
