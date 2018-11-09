<template>
    <v-layout class="background primary">
        <v-img
          :src='`${this.$store.state.config.theme.logo.big}`'
          width="50%"
          aspect-ratio="1.96">
          <v-flex class="theme--light grey lighten-2 pa-3 ma-3" xs4>
            <h2 class="pa-2" v-translate>
                Ooppss... Something went wrong.
            </h2>
            <v-flex class="pa-2" v-translate>
                Please click the button below to authenticate with ownCloud and get access to your data.
            </v-flex>
            <v-btn class="pa-2" color="info" @click="authenticate" v-translate>Authenticate</v-btn>
          </v-flex>
        </v-img>
    </v-layout>
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
      this.$store.dispatch('authenticate', { provider: 'oauth2' })
        .then(() => {
          this.$router.push({ path: '/' })
        })
        .catch(() => {
          this.$router.push('/error')
        })
    }
  }
}
</script>

<style scoped="true">
  .background{
    height: "100%";
  }
</style>
