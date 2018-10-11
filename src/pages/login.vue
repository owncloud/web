<template>
    <div class="uk-background-primary background">

        <div>
            <img src="core/gfx/cloud-logo-invert.svg" width="50%">
        </div>
        <div>
            <div class="uk-position-center uk-background-muted uk-border-rounded uk-padding">
                <h2 v-translate>
                    Welcome to ownCloud
                </h2>
                <div v-translate class="uk-text-small">
                    Please click the button below to authenticate with ownCloud and get access to your data.
                </div>
                <div class="uk-padding">
                    <button class="uk-button uk-button-primary" @click="authenticate" v-translate>Authenticate</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'loginPage',

  data () {
    return {
      loading: false,
      username: '',
      password: ''
    }
  },

  methods: {
    authenticate () {
      this.$store.dispatch('authenticate', { provider: 'oauth2' }).then(() => {
        this.$router.push('/')
      })
    }
  }
}
</script>

<style scoped="true">
    .background {
        height: 100%;
    }
</style>
