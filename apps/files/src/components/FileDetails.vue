<template>
  <oc-app-side-bar
    id="files-sidebar"
    :key="highlightedFile.id"
    class="uk-padding-small uk-overflow-auto uk-height-1-1"
    :disable-action="false"
    @close="close()"
  >
    <template v-if="highlightedFile" slot="title">
      <div class="uk-inline">
        <oc-icon :name="fileTypeIcon(highlightedFile)" size="large" />
      </div>
      <div class="uk-inline">
        <div class="uk-flex uk-flex-middle">
          <span
            id="files-sidebar-item-name"
            class="uk-margin-small-right uk-text-bold"
            v-text="highlightedFile.name"
          />
        </div>
        <div v-if="$route.name !== 'files-shared-with-others'">
          <oc-star
            v-if="!publicPage()"
            id="files-sidebar-star-icon"
            class="uk-inline"
            :shining="highlightedFile.starred"
            @click.native.stop="toggleFileFavorite(highlightedFile)"
          />
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
          <oc-tab-item
            v-for="tab of fileSideBarsEnabled"
            :key="tab.name"
            :active="tab.app === currentTab"
            @click="setCurrentTab(tab.app)"
          >
            {{ tab.title || tab.component.title($gettext) }} {{ tab.name }}
          </oc-tab-item>
        </oc-tabs>
        <component
          :is="activeTabComponent.component"
          v-if="fileSideBars.length > 0 && activeTabComponent"
          :component-name="
            activeTabComponent.propsData ? activeTabComponent.propsData.componentName : ''
          "
          :component-url="
            activeTabComponent.propsData ? activeTabComponent.propsData.componentUrl : ''
          "
          @reload="$emit('reload')"
        ></component>
      </div>
    </template>
  </oc-app-side-bar>
</template>

<script>
import Mixins from '../mixins'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'

export default {
  name: 'FileDetails',
  mixins: [Mixins],
  computed: {
    ...mapGetters(['getToken', 'fileSideBars', 'capabilities']),
    ...mapGetters('Files', ['highlightedFile']),
    ...mapState('Files', ['currentSidebarTab']),

    fileSideBarsEnabled() {
      return this.fileSideBars.filter(
        b => b.enabled === undefined || b.enabled(this.capabilities, this.highlightedFile)
      )
    },
    defaultTab() {
      if (this.fileSideBarsEnabled.length < 1) return null

      return this.fileSideBarsEnabled[0].app
    },

    currentTab() {
      return this.currentSidebarTab?.tab || this.defaultTab
    },

    activeTabComponent() {
      return this.fileSideBarsEnabled.find(sidebar => sidebar.app === this.currentTab)
    }
  },
  watch: {
    // Switch back to default tab after selecting different file
    highlightedFile() {
      this.SET_CURRENT_SIDEBAR_TAB({ tab: this.defaultTab })
    }
  },

  created() {
    this.SET_CURRENT_SIDEBAR_TAB({ tab: this.currentTab })
  },

  beforeDestroy() {
    this.SET_CURRENT_SIDEBAR_TAB(null)
  },

  methods: {
    ...mapActions('Files', ['deleteFiles', 'markFavorite']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['SET_CURRENT_SIDEBAR_TAB']),

    close() {
      this.$emit('reset')
    },

    setCurrentTab(app) {
      this.SET_CURRENT_SIDEBAR_TAB({ tab: app })
    },

    toggleFileFavorite(file) {
      this.markFavorite({
        client: this.$client,
        file: file
      })
    }
  }
}
</script>
