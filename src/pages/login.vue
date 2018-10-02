<template>
    <div class=".uk-padding">
        <div>
            <div>
                <h2 v-translate>
                    Login
                </h2>
                <button class="uk-button uk-button-primary" @click="authenticate" v-translate>Authenticate with OAuth</button>
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
