<template>
  <oc-app-side-bar id="files-sidebar" :key="highlightedFile.id" class="uk-padding-small uk-overflow-auto uk-height-1-1" :disableAction="false" @close="close()">
    <template slot="title" v-if="highlightedFile">
      <div class="uk-inline">
        <oc-icon :name="fileTypeIcon(highlightedFile)" size="large" />
      </div>
      <div class="uk-inline">
        <div class="uk-flex uk-flex-middle">
          <span id="files-sidebar-item-name" class="uk-margin-small-right uk-text-bold" v-text="highlightedFile.name" />
        </div>
        <div v-if="$route.name !== 'files-shared-with-others'">
          <oc-star v-if="!publicPage()" class="uk-inline" :shining="highlightedFile.starred"/>
          <template v-if="highlightedFile.size > -1">
            {{ highlightedFile.size | fileSize }},
          </template>
          {{ formDateFromNow(highlightedFile.mdate) }}
        </div>
      </div>
    </template>
    <template slot="content">
      <div>
        <oc-tabs>
            <oc-tab-item :active="tab.app == activeTab" @click="activeTab = tab.app" v-for="tab of fileSideBarsEnabled" :key="tab.name">
              {{ tab.title || tab.component.title($gettext) }} {{ tab.name }}
            </oc-tab-item>
        </oc-tabs>
        <component v-if="fileSideBars.length > 0 && activeTabComponent"
          v-bind:is="activeTabComponent.component"
           @reload="$emit('reload')"
          :componentName="activeTabComponent.propsData ? activeTabComponent.propsData.componentName : ''"
          :componentUrl="activeTabComponent.propsData ? activeTabComponent.propsData.componentUrl: ''"></component>
      </div>
    </template>
  </oc-app-side-bar>
</template>

<script>
import Mixins from '../mixins'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  name: 'FileDetails',
  data () {
    return {
      /** String name of the tab that is activated */
      activeTab: null
    }
  },
  methods: {
    ...mapActions('Files', ['deleteFiles']),
    ...mapActions(['showMessage']),
    close () {
      this.$emit('reset')
    },
    showSidebar (app) {
      this.activeTab = app
    }
  },
  computed: {
    ...mapGetters(['getToken', 'fileSideBars', 'capabilities']),
    ...mapGetters('Files', ['highlightedFile']),
    fileSideBarsEnabled () {
      return this.fileSideBars.filter(b => b.enabled === undefined || b.enabled(this.capabilities, this.highlightedFile))
    },
    defaultTab () {
      if (this.fileSideBarsEnabled.length < 1) return null

      return this.fileSideBarsEnabled[0].app
    },
    activeTabComponent () {
      return this.fileSideBarsEnabled.find(sidebar => sidebar.app === this.activeTab)
    }
  },
  watch: {
    // Switch back to default tab after selecting different file
    highlightedFile () {
      this.activeTab = this.defaultTab
    }
  },
  mounted () {
    // Ensure default tab is not undefined
    this.activeTab = this.defaultTab
  }
}
</script>
