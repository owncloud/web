<template>
  <v-navigation-drawer
        v-model="sidebarIsVisible"
        absolute
        temporary
        class='mt-5'
        style='top: 16px'>
        <v-list class="pt-0" dense>
          <v-list-tile
            v-for="(n, nid) in nav"
            :key="nid"
            @click="navigateTo(n.route)">
              <v-list-tile-action>
                <v-icon>{{ n.iconMaterial }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ n.name }}</v-list-tile-title>
              </v-list-tile-content>
          </v-list-tile>

          <v-divider></v-divider>

          <v-list-group
                      v-for="item in menuData"
                      v-model="item.active"
                      :key="item.title"
                      no-action
                    >

                      <v-list-tile slot="activator">
                        <v-list-tile-action>
                          <v-icon>{{ item.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                          <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        </v-list-tile-content>
                      </v-list-tile>
                      <v-list-tile
                        v-for="subItem in item.subItems"
                        :key="subItem.title"
                        @click="notImplemented()"
                      >
                        <v-list-tile-content>
                          <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                        </v-list-tile-content>

                        <v-list-tile-action>
                          <v-icon>{{ subItem.action }}</v-icon>
                        </v-list-tile-action>
                      </v-list-tile>
                    </v-list-group>

            <v-divider ></v-divider>

            <v-list-tile
              @click="logout()">
              <v-list-tile-action>
                <v-icon>exit_to_app</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Exit ownCloud</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

        </v-list>
      </v-navigation-drawer>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
export default {
  data () {
    return {
      menuData: {
        personal: {
          title: 'Personal',
          icon: 'account_circle',
          subItems: [
            { title: 'About me' },
            { title: 'Sessions' },
            { title: 'App passwords' },
            { title: 'Sync clients' },
            { title: 'Activity' },
            { title: 'Federated Cloud' }
          ]
        },
        help: {
          title: 'Help',
          icon: 'help',
          subItems: [
            { title: 'User documentation' },
            { title: 'Online documentation' },
            { title: 'Forum' },
            { title: 'Issue Tracker' },
            { title: 'Commercial Support' }
          ]
        },
        admin: {
          title: 'Administration',
          icon: 'settings',
          subItems: [
            { title: 'Sharing' },
            { title: 'External storage' },
            { title: 'Federation' },
            { title: 'File handling' },
            { title: 'Email-templates' }
          ]
        }
      }
    }
  },
  computed: {
    nav () {
      return this.$root.navItems
    },
    ...mapGetters(['isSidebarVisible']),
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
      let OC = this.$parent
      OC.$uikit.offcanvas(this.$el).hide()

      this.$store.dispatch('logout', {}).then(() => {
        this.$router.push('/login')
      })
    },
    navigateTo (route) {
      this.$router.push({
        'name': route.name
      })
    }

  }

}
</script>
