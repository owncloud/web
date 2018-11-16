<template>
  <v-toolbar class="theme--dark primary">
  <v-toolbar-side-icon @click.prevent="toggleSidebar(true)" class="theme--dark"></v-toolbar-side-icon>
  <span class="subheading" v-translate>Files</span>
  <v-spacer></v-spacer>
    <v-flex xs1>
      <v-img
        v-if="configuration.theme.logo.big"
        :src="configuration.theme.logo.big"
        :aspect-ratio="1.8"
        width="60%"
        />
    </v-flex>
    <span class="font-weight-medium title">{{ configuration.theme.general.name }}</span>
  <v-spacer></v-spacer>
  <v-toolbar-items class="hidden-sm-and-down">
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
    ...mapActions(['toggleSidebar'])
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
