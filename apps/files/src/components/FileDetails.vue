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
      <oc-tabbed :initial="defaultTab" @activeTab="handleActiveTab">
        <template slot="tabs">
          <oc-tabbed-tab :name="tab.app" @click="activeTab = tab.app" :key="tab.app" v-for="tab of fileSideBarsEnabled">
            {{ tab.component.title($gettext) }} {{ tab.name }}
          </oc-tabbed-tab>
        </template>
        <template slot="panels">
          <oc-tabbed-panel :name="tab.app" :key="tab.app" v-for="tab of fileSideBarsEnabled">
            <component v-if="isTabActive(tab.app)" v-bind:is="activeTabComponent.component" @reload="$emit('reload')"></component>
          </oc-tabbed-panel>
        </template>
      </oc-tabbed>
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
      activeTab: null,
      activeTabFromComponent: null,
      linkCopied: false
    }
  },
  methods: {
    ...mapActions('Files', ['deleteFiles']),
    ...mapActions(['showMessage']),
    close () {
      this.$emit('reset')
    },
    handleActiveTab (payload) {
      this.activeTab = this.activeTabFromComponent = payload
    },
    showSidebar (app) {
      this.activeTab = app
    },
    isTabActive (name) {
      return this.activeTabFromComponent === name
    },
    clipboardSuccessHandler () {
      this.linkCopied = true

      // Use copy icon after some time
      setTimeout(() => {
        this.linkCopied = false
      }, 1000)
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
