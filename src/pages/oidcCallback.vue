<template>
    <div class="oc-login" uk-height-viewport>
        <div class="oc-login-card uk-position-center">
            <h1 class="oc-login-logo" v-translate>
                ownCloud
            </h1>
            <div class="oc-login-card-body">
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
  mounted () {
    this.$nextTick(() => {
      this.callback()
    })
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['configuration'])
  },
  methods: {
    ...mapActions(['callback'])
  }
}
</script>
