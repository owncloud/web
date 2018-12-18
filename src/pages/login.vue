<template>
    <v-container pa-0 fill-height>
      <v-layout
        align-center
      >
        <v-flex>
          <v-img
            v-if="configuration.theme.logo.big"
            :src="configuration.theme.logo.big"
            max-height="40%"
            height="40%"
            contain
          ></v-img>
          <h2 class="accent--text">
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <v-flex v-translate class="accent--text">
            Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </v-flex>
          <v-btn color="primary" id="authenticate" @click="login()"><span v-translate>Authenticate</span></v-btn>
        </v-flex>
      </v-layout>
      <v-footer app>
        <v-layout
          justify-center
          row
          wrap
        >
          <v-flex
            primary
            lighten-2
            py-3
            text-xs-center
            white--text
            xs12
          >
            {{ configuration.theme.general.slogan }}
          </v-flex>
        </v-layout>
      </v-footer>
    </v-container>
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
