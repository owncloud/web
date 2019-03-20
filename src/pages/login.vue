<template>
    <v-container pa-0 fill-height>
      <v-layout
        align-content-center
      >
        <v-flex v-if="configuration.state === 'working' || configuration.state === 'corrupt'">
          <oc-img
          v-if="configuration.theme.logo.big"
          :src="configuration.theme.logo.big"
          ></oc-img>
          <h2 class="accent--text">
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <v-flex v-translate class="accent--text">
            Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </v-flex>
          <oc-button variation="primary" id="authenticate" @click.native="login()" text="Authenticate"></oc-button>
        </v-flex>
        <v-flex v-if="configuration.state === 'missing'" class="text-xs-center white--text">
          <v-img
          v-if="configuration.theme.logo.big"
          :src="configuration.theme.logo.big"
          max-height="40%"
          height="40%"
          contain
          ></v-img>
              <div class="pa-5">
                <h2> {{ configuration.state }} config.json </h2>
              </div>
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
