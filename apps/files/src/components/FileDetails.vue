<template>
  <div class="uk-width-1-5" :disableAction="false">
    <oc-button class="uk-float-right" icon="close" @click="close()"/>
    <span class="uk-text-lead">{{ getTabName }}</span>
    <oc-tabs>
      <oc-tab-item v-for="tab of fileSideBars" :title="tab.name" :key="tab.name">
        <component :is="tab.component" @reload="$emit('reload')"></component>
      </oc-tab-item>
    </oc-tabs>
  </div>
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
