<template>
  <div id="oc-nav" uk-offcanvas="mode: reveal">
    <div class="uk-offcanvas-bar uk-background-muted">
      <ul class="uk-nav-default uk-nav-parent-icon" uk-nav="">
        <li v-for="(n, nid) in nav" :key="nid">
          <router-link :to="n.route">
            <i v-if="n.iconMaterial" class="material-icons uk-margin-small-right" v-text="n.iconMaterial"></i>
            <span v-text="n.name"></span>
          </router-link>
        </li>
        <li class="uk-nav-divider"></li>
        <li class="uk-parent uk-margin-medium-top"><a href="#" uk-height-match=""><i class="material-icons uk-margin-small-right">account_circle</i><span v-translate>Personal</span></a>
          <ul class="uk-nav-sub">
            <li><a @click="notImplemented()"><span v-translate>About Me</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Sessions</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>App passwords</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Sync clients</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Activity</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Federated Cloud</span></a></li>
          </ul>
        </li>
        <li class="uk-nav-divider"></li>
        <li class="uk-parent"><a href="#"><i class="material-icons uk-margin-small-right">help</i><span v-translate>Help</span></a>
          <ul class="uk-nav-sub">
            <li><a @click="notImplemented()"><span v-translate>User documentation</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Online documentation</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Forum</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Issue tracker</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Commercial support</span></a></li>
          </ul>
        </li>
        <li class="uk-parent uk-margin-medium-top"><a href="#"><i class="material-icons uk-margin-small-right">settings</i><span v-translate>Administration</span></a>
          <ul class="uk-nav-sub">
            <li><a @click="notImplemented()"><span v-translate>Sharing</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>External storage</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>Federation</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>File handling</span></a></li>
            <li><a @click="notImplemented()"><span v-translate>EMail-templates</span></a></li>
          </ul>
        </li>
        <li class="uk-margin-medium-top"><a @click="logout()"><i class="material-icons uk-margin-small-right">exit_to_app</i><span v-translate>Exit ownCloud</span></a></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    nav () {
      return this.$root.navItems
    }
  },
  methods: {
    notImplemented () {
      let OC = this.$parent
      OC.$uikit.notification({
        message: 'Not implemented yet.',
        status: 'primary'
      })
    },

    logout () {
      this.$store.dispatch('logout', {}).then(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>
