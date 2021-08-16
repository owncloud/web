<template>
  <main id="files" class="uk-flex uk-height-1-1">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper uk-width-expand"
      @dragover="$_ocApp_dragOver"
    >
      <app-bar id="files-app-bar" />
      <progress-bar v-show="$_uploadProgressVisible" id="files-upload-progress" class="oc-p-s" />
      <router-view id="files-view" />
    </div>
    <side-bar
      v-if="showSidebar"
      id="files-sidebar"
      ref="filesSidebar"
      tabindex="-1"
      class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl"
      @beforeDestroy="focusSideBar"
      @mounted="focusSideBar"
      @fileChanged="focusSideBar"
    />
  </main>
</template>
<script>
import Mixins from './mixins'
import MixinRoutes from './mixins/routes'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import AppBar from './components/AppBar/AppBar.vue'
import ProgressBar from './components/Upload/ProgressBar.vue'
import SideBar from './components/SideBar/SideBar.vue'
import { bus } from 'web-pkg/src/instance'

export default {
  components: {
    AppBar,
    ProgressBar,
    SideBar
  },
  mixins: [Mixins, MixinRoutes],
  data() {
    return {
      createFolder: false,
      fileUploadName: '',
      fileUploadProgress: 0,
      upload: false,
      fileName: '',
      selected: [],
      breadcrumbs: [],
      sidebarClosed: true
    }
  },
  computed: {
    ...mapGetters('Files', ['dropzone', 'inProgress', 'selectedFiles']),

    $_uploadProgressVisible() {
      return this.inProgress.length > 0
    },
    showSidebar() {
      return this.selectedFiles && this.selectedFiles.length > 0 && !this.sidebarClosed
    }
  },
  watch: {
    $route() {
      this.resetFileSelection()
    },
    showSidebar(visible) {
      if (visible) return
      this.SET_APP_SIDEBAR_ACTIVE_PANEL(null)
    }
  },
  created() {
    this.$root.$on('upload-end', () => {
      this.delayForScreenreader(() => this.$refs.filesListWrapper.focus())
    })
    bus.on('app.files.sidebar.close', () => {
      this.sidebarClosed = true
    })
    bus.on('app.files.sidebar.show', () => {
      this.sidebarClosed = false
    })
  },

  beforeDestroy() {
    this.SET_SIDEBAR_FOOTER_CONTENT_COMPONENT(null)
  },

  methods: {
    ...mapActions('Files', ['dragOver', 'resetFileSelection']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'SET_SIDEBAR_FOOTER_CONTENT_COMPONENT',
      'SET_APP_SIDEBAR_ACTIVE_PANEL'
    ]),

    trace() {
      console.info('trace', arguments)
    },

    focusSideBar(component, event) {
      this.focus({
        from: document.activeElement,
        to: this.$refs.filesSidebar?.$el,
        revert: event === 'beforeDestroy'
      })
    },

    $_ocApp_dragOver() {
      this.dragOver(true)
    }
  }
}
</script>

<style lang="scss" scoped>
main {
  height: 100%;
  max-height: 100%;
}

.files-list-wrapper {
  height: 100%;
  max-height: 100%;
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

#files-app-bar {
  position: sticky;
  height: auto;
  z-index: 1;
  grid-area: header;
  top: 0;
}

#files-view {
  grid-area: main;
  z-index: 0;
}

#files-upload-progress {
  grid-area: upload;
}
</style>

<style lang="scss">
// Hide files table columns
.files-table {
  .oc-table-header-cell-mdate,
  .oc-table-data-cell-mdate,
  .oc-table-header-cell-sdate,
  .oc-table-data-cell-sdate,
  .oc-table-header-cell-ddate,
  .oc-table-data-cell-ddate,
  .oc-table-header-cell-size,
  .oc-table-data-cell-size,
  .oc-table-header-cell-sharedWith,
  .oc-table-data-cell-sharedWith,
  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner,
  .oc-table-header-cell-status,
  .oc-table-data-cell-status {
    display: none;

    @media only screen and (min-width: 640px) {
      display: table-cell;
    }
  }

  .oc-table-header-cell-owner,
  .oc-table-data-cell-owner {
    display: none;

    @media only screen and (min-width: 960px) {
      display: table-cell;
    }
  }

  &-squashed {
    .oc-table-header-cell-mdate,
    .oc-table-data-cell-mdate,
    .oc-table-header-cell-sdate,
    .oc-table-data-cell-sdate,
    .oc-table-header-cell-ddate,
    .oc-table-data-cell-ddate,
    .oc-table-header-cell-size,
    .oc-table-data-cell-size,
    .oc-table-header-cell-sharedWith,
    .oc-table-data-cell-sharedWith,
    .oc-table-header-cell-owner,
    .oc-table-data-cell-owner,
    .oc-table-header-cell-status,
    .oc-table-data-cell-status {
      display: none;

      @media only screen and (min-width: 1600px) {
        display: table-cell;
      }
    }
  }
}
</style>
