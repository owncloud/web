<template>
  <oc-app-side-bar>
    <template slot="title">
      <span>{{ getTabName }}</span>
    </template>
    <template slot="headerContent">
      <v-layout primary row>
        <v-spacer />
        <v-btn @click.native="deleteSelectedFiles" flat><v-icon color="white" medium>delete</v-icon></v-btn>
        <v-spacer />
        <v-btn @click.native="downloadFiles" v-if="items.length <= 1" flat><v-icon color="white" medium>cloud_download</v-icon></v-btn>
        <v-btn disabled v-else flat><v-icon color="white" medium>archive</v-icon></v-btn>
        <v-spacer />
      </v-layout>
    </template>
    <template slot="content">
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
          <component :is="tab.component" @reload="$emit('reload')"></component>
        </v-tab-item>
      </v-tabs>
    </template>
  </oc-app-side-bar>
</template>

<script>
import Mixins from '../mixins'
import OcAppSideBar from 'oc_components/OcAppSideBar.vue'
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
    OcAppSideBar
  },
  methods: {
    ...mapActions('Files', ['deleteFiles']),
    close () {
      this.$emit('reset')
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
      // return (this.items.length > 1) {
      if (this.items.length > 1) {
        return this.$gettext('Multiple Files')
      } else {
        return (this.items[0].name.length > 16) ? `${this.items[0].name.substr(0, 10)}...` : this.items[0].name
      }
    }
  }
}
</script>
