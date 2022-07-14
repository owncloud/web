<template>
  <main id="files" class="oc-flex oc-height-1-1">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper oc-width-expand"
      @click="unselectOnClick"
    >
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
import { usePublicLinkPassword, useStore } from 'web-pkg/src/composables'

export default defineComponent({
  components: {
    SideBar
  },
  mixins: [Mixins],
  setup() {
    const store = useStore()
    return {
      publicLinkPassword: usePublicLinkPassword({ store })
    }
  },
  computed: {
    ...mapState('Files/sidebar', {
      sidebarClosed: 'closed',
      sidebarActivePanel: 'activePanel'
    }),

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
    }
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
    ...mapActions('Files', ['resetFileSelection']),
    ...mapActions('Files/sidebar', {
      closeSidebar: 'close',
      setActiveSidebarPanel: 'setActivePanel'
    }),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapActions('Files', ['copySelectedFiles', 'cutSelectedFiles', 'pasteSelectedFiles']),
    ...mapMutations('Files', ['UPSERT_RESOURCE']),

    handleShortcut(event) {
      const key = event.keyCode || event.which
      const ctr = window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey
      if (!ctr /* CTRL | CMD */) return
      const isCopyAction = key === 67
      const isPasteAction = key === 86
      const isCutAction = key === 88
      if (isCopyAction) {
        this.copySelectedFiles()
      } else if (isPasteAction) {
        this.pasteSelectedFiles({
          client: this.$client,
          createModal: this.createModal,
          hideModal: this.hideModal,
          showMessage: this.showMessage,
          $gettext: this.$gettext,
          $gettextInterpolate: this.$gettextInterpolate,
          $ngettext: this.$ngettext,
          routeContext: this.$route.name,
          publicLinkPassword: this.publicLinkPassword,
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
    },
    /* on click instead of on focus since child element got the higher tabindex and focuses first */
    unselectOnClick(e) {
      if (
        e.target?.id === 'files-view' ||
        e.target?.className.includes('oc-files-appbar-batch-actions') ||
        e.target?.className === 'oc-flex oc-flex-between'
      )
        this.resetFileSelection()
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
