<template>
  <main id="files" class="uk-flex uk-height-1-1">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper uk-width-expand"
      :class="{ 'uk-visible@m': _sidebarOpen }"
      @dragover="$_ocApp_dragOver"
    >
      <app-bar id="files-app-bar" :style="{ top: $_topBarVisible ? '60px' : '0' }" />
      <upload-progress v-show="$_uploadProgressVisible" id="files-upload-progress" class="oc-p-s" />
      <router-view id="files-view" />
    </div>
    <sidebar
      v-if="_sidebarOpen"
      id="files-sidebar"
      ref="filesSidebar"
      tabindex="-1"
      class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl"
      @reset="setHighlightedFile(null)"
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
import Sidebar from './components/Sidebar.vue'
import AppBar from './components/AppBar.vue'
import UploadProgress from './components/UploadProgress.vue'

export default {
  components: {
    Sidebar,
    AppBar,
    UploadProgress
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
      breadcrumbs: []
    }
  },
  computed: {
    ...mapGetters('Files', ['dropzone', 'highlightedFile', 'inProgress']),

    _sidebarOpen() {
      return this.highlightedFile !== null
    },

    $_topBarVisible() {
      return !this.publicPage() && !this.$route.meta.verbose
    },

    $_uploadProgressVisible() {
      return this.inProgress.length > 0
    }
  },
  watch: {
    $route() {
      this.setHighlightedFile(null)
      this.resetFileSelection()
    }
  },
  created() {
    this.$root.$on('upload-end', () => {
      this.delayForScreenreader(() => this.$refs.filesListWrapper.focus())
    })
  },

  beforeDestroy() {
    this.SET_SIDEBAR_FOOTER_CONTENT_COMPONENT(null)
  },

  methods: {
    ...mapActions('Files', ['dragOver', 'setHighlightedFile', 'resetFileSelection']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', ['SET_APP_SIDEBAR_EXPANDED_ACCORDION']),
    ...mapMutations(['SET_SIDEBAR_FOOTER_CONTENT_COMPONENT']),

    trace() {
      console.info('trace', arguments)
    },

    openSideBar(file, sideBarName) {
      this.setHighlightedFile(file)
      this.SET_APP_SIDEBAR_EXPANDED_ACCORDION(sideBarName)
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
    },

    $_ocAppSideBar_onReload() {
      this.$refs.filesList.$_ocFilesFolder_getFolder()
    }
  }
}
</script>

<style lang="scss" scoped>
.files-list-wrapper {
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
  position: sticky;
  top: 60px;
  max-height: calc(100vh - 60px);
}

#files-app-bar {
  position: sticky;
  height: auto;
  z-index: 1;
  grid-area: header;
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
