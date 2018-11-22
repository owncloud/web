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
          <v-btn color="primary" id="authenticate" @click="authenticate"><span v-translate>Authenticate</span></v-btn>
        </v-flex>
      </v-img>
    </v-flex>
  </v-layout>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
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
    ...mapActions(['showNotification']),

    authenticate () {
      this.$store.dispatch('authenticate', { provider: 'oauth2' })
        .then(() => {
          this.$router.push({ path: '/' })
        })
        .catch((error) => {
          this.showNotification({
            title: this.$gettext('Could not login'),
            desc: error.message,
            type: 'error'
          })
        })
    }
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
