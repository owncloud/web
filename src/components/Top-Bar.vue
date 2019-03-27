<template>
  <oc-topbar variation="primary">
    <oc-topbar-logo icon="menu" title="Files" slot="left" @click="toggleSidebar(!isSidebarVisible)"></oc-topbar-logo>
    <oc-topbar-item slot="title">
      <oc-img :src="configuration.theme.logo.big" style="height: 60px" />
    </oc-topbar-item>
    <oc-topbar-item slot="right">
      <Avatar class="uk-margin-small-right" :userid="user.id" />
      <span>{{ user.displayname }}</span>
    </oc-topbar-item>
  </oc-topbar>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import pluginHelper from '../mixins/pluginHelper.js'
import Avatar from './Avatar.vue'

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
  components: { Avatar },
  methods: {
    ...mapActions(['toggleSidebar']),
    parseApp (app) {
      const regex = /([^/]+[.js$])\w/g
      let matched = regex.exec(app)
      return matched[0]
    }
  },
  computed: {
    ...mapGetters(['configuration', 'isSidebarVisible']),
    ...mapState(['user']),
    extendNavbarRight () {
      return this.getPlugins('phoenixNavbarRight')
    }
  }
}
</script>
