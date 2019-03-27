<template>
  <div></div>
  <!--<v-navigation-drawer-->
        <!--v-model="sidebarIsVisible"-->
        <!--absolute-->
        <!--temporary-->
        <!--clipped-->
        <!--style='top: 50px;z-index: 999;'>-->
        <!--<v-list class="pt-0" dense>-->
          <!--<v-list-tile-->
            <!--v-for="(n, nid) in nav"-->
            <!--:key="nid"-->
            <!--@click="navigateTo(n.route)">-->
              <!--<v-list-tile-action>-->
                <!--<v-icon>{{ n.iconMaterial }}</v-icon>-->
              <!--</v-list-tile-action>-->
              <!--<v-list-tile-content>-->
                <!--<v-list-tile-title>{{ n.name }}</v-list-tile-title>-->
              <!--</v-list-tile-content>-->
          <!--</v-list-tile>-->

          <!--<v-divider></v-divider>-->

          <!--<v-list-group-->
                      <!--v-for="item in menuData"-->
                      <!--v-model="item.active"-->
                      <!--:key="item.title"-->
                      <!--no-action-->
                    <!--&gt;-->

                      <!--<v-list-tile slot="activator">-->
                        <!--<v-list-tile-action>-->
                          <!--<v-icon>{{ item.icon }}</v-icon>-->
                        <!--</v-list-tile-action>-->
                        <!--<v-list-tile-content>-->
                          <!--<v-list-tile-title>{{ item.title }}</v-list-tile-title>-->
                        <!--</v-list-tile-content>-->
                      <!--</v-list-tile>-->
                      <!--<v-list-tile-->
                        <!--v-for="subItem in item.subItems"-->
                        <!--:key="subItem.title"-->
                        <!--@click="notImplemented()"-->
                      <!--&gt;-->
                        <!--<v-list-tile-content>-->
                          <!--<v-list-tile-title>{{ subItem.title }}</v-list-tile-title>-->
                        <!--</v-list-tile-content>-->

                        <!--<v-list-tile-action>-->
                          <!--<v-icon>{{ subItem.action }}</v-icon>-->
                        <!--</v-list-tile-action>-->
                      <!--</v-list-tile>-->
                    <!--</v-list-group>-->

            <!--<v-divider ></v-divider>-->

            <!--<v-list-tile-->
              <!--@click="logout()">-->
              <!--<v-list-tile-action>-->
                <!--<v-icon>exit_to_app</v-icon>-->
              <!--</v-list-tile-action>-->
              <!--<v-list-tile-content>-->
                <!--<v-list-tile-title><translate :translate-params="{name: configuration.theme.general.name}">Exit %{name}</translate></v-list-tile-title>-->
              <!--</v-list-tile-content>-->
            <!--</v-list-tile>-->

        <!--</v-list>-->
      <!--</v-navigation-drawer>-->
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data () {
    return {
      menuData: {
      }
    }
  },
  computed: {
    nav () {
      return this.$root.navItems
    },
    ...mapGetters(['isSidebarVisible']),
    ...mapGetters(['configuration']),
    sidebarIsVisible: {
      get () {
        return this.isSidebarVisible
      },
      set (newVal) {
        if (newVal) {
          return
        }
        this.toggleSidebar(newVal)
      }
    }
  },
  methods: {
    ...mapActions(['toggleSidebar']),
    notImplemented () {
      // TODO: tempelgogo's snackbarQueue
      console.log('snackbar should be here')
    },
    logout () {
      this.sidebarIsVisible = false
      this.$store.dispatch('logout')
    },
    navigateTo (route) {
      this.$router.push(route)
    }

  }

}
</script>
