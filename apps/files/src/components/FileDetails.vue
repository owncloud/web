<template>
  <oc-app-side-bar :disableAction="false" @close="close()">
    <template slot="title">
      <span class="uk-text-lead uk-margin-bottom">{{ getTabName }}</span>
    </template>
    <template slot="content">
      <oc-tabs>
          <oc-tab-item :active="key == activeTab" @click="activeTab = key" v-for="(tab, key) of fileSideBars" :title="tab.name" :key="tab.name" />
      </oc-tabs>
      <component v-if="fileSideBars.length > 0" v-bind:is="activeTabComponent.component"></component>
    </template>
  </oc-app-side-bar>
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
      /** String name of the tab that is activated */
      activeTab: 0
    }
  },
  methods: {
    ...mapActions('Files', ['deleteFiles']),
    close () {
      this.$emit('reset')
    },
    showSidebar (app) {
      this.activeTab = app
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
    },
    activeTabComponent () {
      return this.fileSideBars[this.activeTab]
    }
  }
}
</script>
