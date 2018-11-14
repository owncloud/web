<template>
  <div>
    <v-layout class="background primary">
      <v-flex xs12>
        <v-img
        v-if="configuration.theme.logo.big"
        :src="configuration.theme.logo.big"
        :aspect-ratio="1"
        height="100vh">
        <v-flex class="theme--light grey lighten-2 pa-4 ma-3 center-dialog" md4 xs8>
          <h2 class="pa-2">
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <v-flex class="pa-2" v-translate>
            Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </v-flex>
          <v-btn class="pa-2" color="primary" id="authenticate" @click="authenticate"><span v-translate>Authenticate</span></v-btn>
        </v-flex>
      </v-img>
    </v-flex>
  </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'loginPage',

  data () {
    return {
      loading: false,
      username: '',
      password: ''
    }
  },
  computed: {
    ...mapGetters(['configuration'])
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
  .center-dialog {
    /* FIXME General center class */
    margin-left: auto!important;
    margin-right: auto!important;
    margin-top: 32vh!important;
  }
</style>
