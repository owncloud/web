<template>
  <v-toolbar app class="theme--dark primary">
  <v-toolbar-side-icon @click.prevent="toggleSidebar(true)" class="theme--dark"></v-toolbar-side-icon>
  <span class="subheading" v-translate>Files</span>
  <v-spacer></v-spacer>
    <v-flex xs1>
      <v-img
        v-if="configuration.theme.logo.big"
        :src="configuration.theme.logo.big"
        contain
      />
    </v-flex>
    <span class="font-weight-medium title">{{ configuration.theme.general.name }}</span>
  <v-spacer></v-spacer>
  <v-toolbar-items class="hidden-sm-and-down">
    <v-menu offset-y v-if="configuration.state !== 'working'">
      <v-icon slot="activator" color="error" x-large>info</v-icon>
      <v-list
        class="primary white--text text-xs-center"
        v-for="app in configuration.corrupted"
        :key="app">
          <h4 class="pa-3">Corrupted apps</h4>
        <v-list-tile>
          <v-list-tile-title class="text-xs-center">
            {{ parseApp(app) }}
          </v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <v-btn class="theme--dark" flat><v-icon class="theme--dark" medium>account_circle</v-icon>&nbsp;<span>{{ user.displayname }}</span></v-btn>
  </v-toolbar-items>
</v-toolbar>
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

<style scoped="true">

</style>
