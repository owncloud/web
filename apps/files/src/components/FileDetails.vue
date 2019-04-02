<template>
  <oc-app-side-bar :disableAction="false" @close="close()">
    <template slot="title">
      <span class="uk-text-lead">{{ getTabName }}</span>
    </template>
    <template slot="content">
      <oc-tabs>
          <oc-tab-item v-for="tab of fileSideBars" :title="tab.name" :key="tab.name" />
      </oc-tabs>
      <p>hello! {{ fileSideBars.length }}</p>
      <component :is="fileSideBars[active]" @reload="$emit('reload')"></component>
    </template>
  </oc-app-side-bar>
</template>

<script>
import Mixins from '../mixins'
import OcAppSideBar from 'oc_components/OcAppSideBar.vue'
import { mapActions, mapGetters } from 'vuex'
import { FileSharingSidebar } from './FileSharingSidebar.vue'

export default {
  mixins: [Mixins],
  props: ['items'],
  name: 'FileDetails',
  data () {
    return {
      drawer: false,
      active: 0,
      sideBarComponent: FileSharingSidebar
    }
  },
  components: {
    OcAppSideBar,
    FileSharingSidebar
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
      if (this.items.length > 1) {
        return this.$gettext('Multiple Files')
      } else {
        // return (this.items[0].name.length > 16) ? `${this.items[0].name.substr(0, 10)}...` : this.items[0].name
        return this.items[0].name
      }
    }
  }
}
</script>
