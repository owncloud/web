<template>
  <div>
    <v-layout class="background primary">
      <v-flex class="pa-0" xs12>
        <v-img
        v-if="configuration.theme.logo.big"
        :src="configuration.theme.logo.big"
        :aspect-ratio="1"
        height="100vh">
        <v-flex class="center-dialog grey lighten-2 pa-4 ml-auto mr-auto elevation-5" md4 xs8>
          <h2>
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <v-flex v-translate>
            Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </v-flex>
          <v-btn color="primary" id="authenticate" @click="login()"><span v-translate>Authenticate</span></v-btn>
        </v-flex>
      </v-img>
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
  .v-btn, h2, .flex{
    padding: 8px 8px;
  }
  .center-dialog {
    /* FIXME: use justify-center and align-center */
    margin-top: 32vh!important;
  }
</style>
