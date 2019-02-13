<template>
  <v-navigation-drawer
  v-model="drawer"
  class="grey lighten-2"
  right
  floating
  permanent
  >
  <v-layout column>
    <v-layout primary row>
      <v-flex>
        <v-icon color="white" class="pl-4" medium>folder</v-icon>
      </v-flex>
      <v-flex white--text align-self-center>
        <span class="subheading"> {{ getTabName }} </span>
      </v-flex>
    </v-layout>
    <v-layout primary row>
      <v-spacer />
      <v-btn @click.native="deleteSelectedFiles" flat><v-icon color="white" medium>delete</v-icon></v-btn>
      <v-spacer />
      <v-btn @click.native="downloadFiles" v-if="items.length <= 1" flat><v-icon color="white" medium>cloud_download</v-icon></v-btn>
      <v-btn disabled v-else flat><v-icon color="white" medium>archive</v-icon></v-btn>
      <v-spacer />
    </v-layout>
    <v-tabs
      v-model="active"
      color="primary lighten-5"
      dark
      slider-color="yellow"
    >
      <v-tab
        v-for="tab of fileSideBars"
        :key="tab.name"
        ripple
      >
        {{ tab.name }}
      </v-tab>
      <v-tab-item
        v-for="tab of fileSideBars"
        :key="tab.name"
      >
        <component :is="tab.component"></component>
      </v-tab-item>
    </v-tabs>
</v-layout>
</v-navigation-drawer>
</template>

<script>
import Mixins from '../mixins'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  props: ['items'],
  name: 'FileDetails',
  data () {
    return {
      drawer: false,
      tabName: '',
      active: 0
    }
  },
  components: {
  },
  methods: {
    ...mapActions('Files', ['deleteFiles']),
    close () {
      this.$emit('reset')
    },
    showSidebar (sideBarName) {
      this.active = Object.keys(this.fileSideBars).indexOf(sideBarName)
    },
    downloadFiles () {
      this.downloadFile(this.items[0])
    },
    deleteSelectedFiles () {
      this.deleteFiles({
        client: this.$client,
        files: this.items
      })
    }
  },
  computed: {
    ...mapGetters(['getToken', 'fileSideBars']),

    getTabName () {
      if (this.items.length === 0) {
        return ''
      }
      return (this.items.length > 1) ? this.$gettext('Multiple Files') : this.items[0].name
    }
  }
}
</script>
