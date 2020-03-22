<template>
  <div class="oc-login" uk-height-viewport>
    <div class="oc-login-card uk-position-center">
      <h1 v-translate class="oc-login-logo">
        ownCloud
      </h1>
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
          @click.native="login()"
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
      loading: false
    }
  },
  computed: {
    ...mapGetters(['configuration']),

    $_productName() {
      return this.configuration.theme.general.name
    }
  },
  methods: {
    ...mapActions(['login'])
  }
}
</script>
