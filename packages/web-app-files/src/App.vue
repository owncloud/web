<template>
  <main id="files" class="oc-flex oc-height-1-1" @dragenter="onDragEnter" @mouseleave="onDragLeave">
    <div v-if="dragareaEnabled" class="dragarea" />
    <div ref="filesListWrapper" tabindex="-1" class="files-list-wrapper oc-width-expand">
      <router-view id="files-view" tabindex="0" />
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
import { mapActions, mapState } from 'vuex'
import SideBar from './components/SideBar/SideBar.vue'
import { defineComponent } from '@vue/composition-api'

export default defineComponent({
  components: {
    SideBar
  },
  mixins: [Mixins],
  data: () => ({
    dragareaEnabled: false
  }),
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

  methods: {
    ...mapActions('Files', ['resetFileSelection']),
    ...mapActions('Files/sidebar', {
      closeSidebar: 'close',
      setActiveSidebarPanel: 'setActivePanel'
    }),

    onDragEnter(event) {
      const hasFileInEvent = (event.dataTransfer.types || []).some((e) => e === 'Files')
      this.dragareaEnabled = hasFileInEvent
    },
    onDragLeave() {
      this.dragareaEnabled = false
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

.dragarea {
  background-color: rgba(60, 130, 225, 0.21);
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: absolute;
  z-index: 9;
  border-radius: 14px;
  border: 2px dashed var(--oc-color-swatch-primary-muted);
}
.files-list-wrapper {
  position: relative;
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

#files {
  position: relative;
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
