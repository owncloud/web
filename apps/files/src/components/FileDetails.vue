<template>
  <oc-app-side-bar class="uk-padding-small uk-overflow-auto uk-height-1-1" :disableAction="false" @close="close()">
    <template slot="title" v-if="highlightedFile">
      <div class="uk-inline">
        <oc-icon :name="fileTypeIcon(highlightedFile)" size="large" />
      </div>
      <div class="uk-inline">
        <div class="uk-flex uk-flex-middle">
          <span class="uk-margin-small-right">{{ highlightedFile.name }}</span>
          <oc-icon name="link" v-clipboard="() => highlightedFile.privateLink"
                   v-clipboard:success="clipboardSuccessHandler"
          />
        </div>
        <div>
          <oc-star class="uk-inline" :shining="highlightedFile.starred"/> {{ highlightedFile.size | fileSize }}, {{ formDateFromNow(highlightedFile.mdate) }}
        </div>
      </div>
    </template>
    <template slot="content">
      <oc-tabs>
          <oc-tab-item :active="key == activeTab" @click="activeTab = key" v-for="(tab, key) of fileSideBarsEnabled" :key="tab.name">
            {{ tab.component.title($gettext) }}
          </oc-tab-item>
      </oc-tabs>
      <component v-if="fileSideBars.length > 0" v-bind:is="activeTabComponent.component" @reload="$emit('reload')"></component>
    </template>
  </oc-app-side-bar>
</template>

<script>
import Mixins from '../mixins'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [Mixins],
  name: 'FileDetails',
  data: function () {
    return {
      /** String name of the tab that is activated */
      activeTab: 0
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
    },
    clipboardSuccessHandler () {
      this.showMessage({
        title: this.$gettext('The private link has been copied to your clipboard.')
      })
    }
  },
  computed: {
    ...mapGetters(['getToken', 'fileSideBars', 'capabilities']),
    ...mapGetters('Files', ['highlightedFile']),
    fileSideBarsEnabled () {
      return this.fileSideBars.filter(b => b.enabled === undefined || b.enabled(this.capabilities))
    },
    activeTabComponent () {
      return this.fileSideBarsEnabled[this.activeTab]
    }
  }
}
</script>
