<template>
  <div>
    <v-layout class="background primary">
      <v-flex class="pa-0" xs12 style="height: 100vh">
        <v-img
          v-if="configuration.theme.logo.big"
          :src="configuration.theme.logo.big"
          max-height="40%"
          height="40%"
          contain
          ></v-img>
          <v-flex class="center-dialog grey lighten-2 pa-4 ml-auto mr-auto elevation-5" md4 xs8>
          <h2>
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <v-flex v-translate>
            Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </v-flex>
          <v-btn color="primary" id="authenticate" @click="login()"><span v-translate>Authenticate</span></v-btn>
        </v-flex>
      </v-flex>
    </v-layout>
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
    ...mapGetters(['configuration'])
  },
  methods: {
    ...mapActions(['login'])
  }
}
</script>

<style>
</style>
