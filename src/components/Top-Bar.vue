<template>
  <component :is="'div'" class="nav">
    <div class="menu">
      <v-icon class="icons" @click.prevent="toggleSidebar(true)" color="white">menu</v-icon>
      <span v-translate>Files</span>
    </div>
    <img class="logo" :src="configuration.theme.logo.big" height="50px" />
    <div class="user">
      <v-icon class="icons right" color="white">account_circle</v-icon>
      <span class="right">{{ user.displayname }}</span>
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
    </div>
  </component>
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

<style scoped lang="scss">

.nav {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr;
  grid-template-areas: "menu logo user";
  overflow: hidden;
  background-color: var(--v-primary-base);
  line-height: 50px;
  position: fixed;
  top: 0;
  z-index: 99;
  height: 50px;
  width: 100%;
}
.icons {
  padding: 10px;
  margin-top: .1em;
  float: left;
}
.hamburger:hover {
  background: blue;
  border-radius: 50%;
}
.menu {
  color: white;
  grid-area: menu;
}
.right {
  float: right;
}
.logo {
  margin: 0 auto;
  grid-area: logo;
}

.user {
  color: white;
  grid-area: user;
}
</style>
