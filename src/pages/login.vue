<template>
    <div class="oc-login" uk-height-viewport>
        <div class="oc-login-card uk-position-center">
            <h1 class="oc-login-logo" v-translate>
                ownCloud
            </h1>
            <div class="oc-login-card-body">
                <h3 class="oc-login-card-title">
                    <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
                </h3>
                <p v-translate>
                    Please click the button below to authenticate and get access to your data.
                </p>
                <oc-button size="large" variation="primary" class="oc-login-authorize-button" id="authenticate" @click.native="login()" :text="$_login_authorizeButtonText"/>
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
  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    $_login_authorizeButtonText () {
      return this.$gettext('Authorize')
    }
  },
  methods: {
    ...mapActions(['login'])
  }
}
</script>
