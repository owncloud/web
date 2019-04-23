<template>
    <v-container pa-0 fill-height>
      <v-layout
        align-center
      >
        <v-flex>
          <h2 class="accent--text">
            <span v-translate>Redirecting…</span>
          </h2>
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
  name: 'OidcCallbackPage',
  mounted () {
    this.$nextTick(() => {
      this.signinSilentCallback()
    })
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['configuration'])
  },
  methods: {
    ...mapActions(['signinSilentCallback'])
  }
}
</script>
