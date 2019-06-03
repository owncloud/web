<template>
  <div>
    <v-layout background primary :style="backgroundStyle">
      <v-flex class="pa-0" xs12>
        <v-img
        v-if="configuration.theme.logo.big"
        :src="configuration.theme.logo.big"
        :aspect-ratio="1"
        height="100vh">
        <v-flex class="grey lighten-2 pa-4 ma-auto elevation-5 center-dialog" md4 xs8>
          <h2>
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <v-flex v-translate>
            Please click the button below again to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </v-flex>
          <v-btn color="primary" id="authenticate" @click="authenticate"><span v-translate>Authenticate</span></v-btn>
        </v-flex>
      </v-img>
    </v-flex>
  </v-layout>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'errorPage',

  data () {
    return {
      loading: false
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    backgroundStyle () {
      return `background-image: linear-gradient(${this.configuration.theme.colors.primary}, ${this.configuration.theme.colors.secondary});`
    }
  }
}
</script>
