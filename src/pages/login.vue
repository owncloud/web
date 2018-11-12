<template>
  <div>
    <v-layout class="background primary">
      <v-img
      v-if="configuration.theme.logo.big"
      :src="configuration.theme.logo.big"
      width="50%"
      :aspect-ratio="1.96">
      <v-flex class="theme--light grey lighten-2 pa-5 ma-3 center-dialog" xs4>
        <h2 class="pa-2">
          <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
        </h2>
        <v-flex class="pa-2" v-translate>
          Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
        </v-flex>
        <v-btn class="pa-2" color="primary" @click="authenticate"><span v-translate>Authenticate</span></v-btn>
      </v-flex>
    </v-img>
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
    margin-left: auto!important;
    margin-right: auto!important;
    margin-top: 32vh!important;
  }
</style>
