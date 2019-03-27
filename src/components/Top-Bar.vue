<template>
  <oc-topbar variation="primary">
    <oc-topbar-logo icon="menu" title="Files" slot="left" @click="onClick"></oc-topbar-logo>

    <oc-topbar-item slot="title">
      <oc-img :src="configuration.theme.logo.big" />
    </oc-topbar-item>

    <oc-topbar-item slot="right">
      <oc-icon name="account_circle" color="white"></oc-icon>
      <span>{{ user.displayname }}</span>
      <!--<v-menu offset-y v-if="configuration.state !== 'working'">-->
        <!--<v-icon slot="activator" color="error" x-large>info</v-icon>-->
        <!--<v-list-->
          <!--class="primary white&#45;&#45;text text-xs-center"-->
          <!--v-for="app in configuration.corrupted"-->
          <!--:key="app">-->
          <!--<h4 class="pa-3">Corrupted apps</h4>-->
          <!--<v-list-tile>-->
            <!--<v-list-tile-title class="text-xs-center">-->
              <!--{{ parseApp(app) }}-->
            <!--</v-list-tile-title>-->
          <!--</v-list-tile>-->
        <!--</v-list>-->
      <!--</v-menu>-->

    </oc-topbar-item>
  </oc-topbar>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import pluginHelper from '../mixins/pluginHelper.js'

export default {
  data () {
    return {
      drawer: false,
      items: [
        { title: 'Home', icon: 'dashboard' },
        { title: 'About', icon: 'question_answer' }
      ]
    }
  },
  mixins: [
    pluginHelper
  ],
  methods: {
    ...mapActions(['toggleSidebar']),
    parseApp (app) {
      const regex = /([^/]+[.js$])\w/g
      let matched = regex.exec(app)
      return matched[0]
    }
  },
  computed: {
    ...mapGetters(['configuration']),
    ...mapState(['user']),
    extendNavbarRight () {
      return this.getPlugins('phoenixNavbarRight')
    }
  }
}
</script>
