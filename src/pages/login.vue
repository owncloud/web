<template>
  <div>
    <div v-if="configuration.state === 'working' || configuration.state === 'corrupt'">
          <oc-img
            v-if="configuration.theme.logo.big"
            :src="configuration.theme.logo.big"
          ></oc-img>
          <h2 class="text-color">
            <span v-translate>Welcome to</span> {{ configuration.theme.general.name }}
          </h2>
          <div v-translate class="text-color">
            Please click the button below to authenticate with {{ configuration.theme.general.name }} and get access to your data.
          </div>
          <oc-button variation="primary" id="authenticate" @click.native="login()" text="Authenticate"></oc-button>
        </div>
        <div v-if="configuration.state === 'missing'" class="text-xs-center white--text">
          <oc-img
          v-if="configuration.theme.logo.big"
          :src="configuration.theme.logo.big"
          ></oc-img>
              <div class="text-color">
                <h2 v-translate> {{ configuration.state }} config.json </h2>
              </div>
        </div>
      <div class="uk-flex uk-flex-bottom uk-flex-center text-color">
        {{ configuration.theme.general.slogan }}
      </div>
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

<style scoped>
  .text-color {
    color: white;
  }
</style>
