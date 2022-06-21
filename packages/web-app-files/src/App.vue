<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div ref="filesListWrapper" tabindex="-1" class="files-list-wrapper oc-width-expand">
      <router-view id="files-view" />
    </div>
    <side-bar
      v-if="showSidebar"
      id="files-sidebar"
      ref="filesSidebar"
      tabindex="-1"
      class="oc-width-1-1 oc-width-2-5@m oc-width-1-4@xl"
      :sidebar-active-panel="sidebarActivePanel"
      @beforeDestroy="focusSideBar"
      @mounted="focusSideBar"
      @fileChanged="focusSideBar"
      @selectPanel="setActiveSidebarPanel"
      @close="closeSidebar"
    />
  </main>
</template>
<script lang="ts">
import Mixins from './mixins'
import { mapActions, mapState, mapMutations } from 'vuex'
import SideBar from './components/SideBar/SideBar.vue'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    SideBar
  },
  mixins: [Mixins],
  computed: {
    ...mapState('Files/sidebar', {
      sidebarClosed: 'closed',
      sidebarActivePanel: 'activePanel'
    }),
    ...mapState('Files', ['latestSelectedId']),

    showSidebar() {
      return !this.sidebarClosed
    }
  },
  watch: {
    $route: {
      handler: function (to, from) {
        this.resetFileSelection()
        if (from?.name !== to.name) {
          this.closeSidebar()
        }
      }
    },

  },
  created() {
    this.$root.$on('upload-end', () => {
      this.delayForScreenreader(() => this.$refs.filesListWrapper.focus())
    })
  },

  mounted() {
    document.addEventListener('keydown', this.handleShortcut, false)
  },

  beforeDestroy() {
    document.removeEventListener('keydown', this.handleShortcut)
  },

  methods: {
    ...mapActions('Files', ['resetFileSelection', 'toggleFileSelection']),
    ...mapActions('Files/sidebar', {
      closeSidebar: 'close',
      setActiveSidebarPanel: 'setActivePanel'
    }),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', ['copySelectedFiles', 'cutSelectedFiles', 'pasteSelectedFiles']),
    ...mapMutations('Files', ['UPSERT_RESOURCE']),

    handleShortcut(event) {
      this.handleFileActionsShortcuts(event)
      this.handleFileSelectionShortcuts(event)
    },

    handleFileSelectionShortcuts(event) {
      const key = event.keyCode || event.which
      const isShiftPressed = event.shiftKey
      if(!isShiftPressed) return
      const isUpPressed = key === 38
      const isDownPressed = key === 40
      if(isDownPressed) {
        const latestSelectedRow = document.querySelectorAll(`[data-item-id='${this.latestSelectedId}']`)[0]
        const nextRow = latestSelectedRow.nextSibling as HTMLElement
        const nextResourceId = nextRow.getAttribute("data-item-id")

        console.log(nextRow)
        console.log(nextResourceId)
        this.toggleFileSelection({id: nextResourceId})
      }
      if(isUpPressed) {
        const latestSelectedRow = document.querySelectorAll(`[data-item-id='${this.latestSelectedId}']`)[0]
        const nextRow = latestSelectedRow.previousSibling as HTMLElement
        const nextResourceId = nextRow.getAttribute("data-item-id")

        console.log(nextRow)
        console.log(nextResourceId)
        this.toggleFileSelection({id: nextResourceId})
      }
      // get last selected id
      // find index in dom
      // get id from dom index + 1 or  - 1
      
      //document.getElementsByClassName("oc-table-highlighted")[0].parentElement.childNodes[0]
    },

    handleFileActionsShortcuts(event) {
      const key = event.keyCode || event.which
      const ctr = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      if (!ctr /* CTRL | CMD */) return
      const isCopyAction = key === 67
      const isPaseAction = key === 86
      const isCutAction = key === 88
      if (isCopyAction) {
        this.copySelectedFiles()
      } else if (isPaseAction) {
        this.pasteSelectedFiles({
          client: this.$client,
          createModal: this.createModal,
          hideModal: this.hideModal,
          showMessage: this.showMessage,
          $gettext: this.$gettext,
          $gettextInterpolate: this.$gettextInterpolate,
          $ngettext: this.$ngettext,
          upsertResource: this.UPSERT_RESOURCE
        })
      } else if (isCutAction) {
        this.cutSelectedFiles()
      }
    },

    focusSideBar(component, event) {
      this.focus({
        from: document.activeElement,
        to: this.$refs.filesSidebar?.$el,
        revert: event === 'beforeDestroy'
      })
    }
  }
})
</script>

<style lang="scss" scoped>
main {
  max-height: 100%;
}

.files-list-wrapper {
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content max-content 1fr;
  gap: 0 0;
  grid-template-areas:
    'header'
    'upload'
    'main';

  &:focus {
    outline: none;
  }
}

#files-sidebar {
  position: relative;
  overflow: hidden;
}

#files-view {
  grid-area: main;
  z-index: 0;
}
</style>
