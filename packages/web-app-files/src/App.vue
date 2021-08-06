<template>
  <main id="files" class="uk-flex uk-height-1-1">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper uk-width-expand"
      :class="{ 'uk-visible@m': _sidebarOpen }"
      @dragover="$_ocApp_dragOver"
    >
      <app-bar id="files-app-bar" />
      <progress-bar v-show="$_uploadProgressVisible" id="files-upload-progress" class="oc-p-s" />
      <router-view id="files-view" />
    </div>
    <side-bar
      v-if="_sidebarOpen"
      id="files-sidebar"
      ref="filesSidebar"
      tabindex="-1"
      class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl"
      @reset="$_destroySideBar_hideDetails"
      @beforeDestroy="focusSideBar"
      @mounted="focusSideBar"
      @fileChanged="focusSideBar"
    />
  </main>
</template>
<script>
import Mixins from './mixins'
import MixinRoutes from './mixins/routes'
import MixinDestroySideBar from './mixins/sidebar/destroySideBar'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import AppBar from './components/AppBar/AppBar.vue'
import ProgressBar from './components/Upload/ProgressBar.vue'
import SideBar from './components/SideBar/SideBar.vue'

export default {
  components: {
    AppBar,
    ProgressBar,
    SideBar
  },
  mixins: [Mixins, MixinRoutes, MixinDestroySideBar],
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

    $_uploadProgressVisible() {
      return this.inProgress.length > 0
    }
  },
  watch: {
    $route() {
      this.$_destroySideBar_hideDetails()
      this.resetFileSelection()
    },
    highlightedFile(file) {
      if (file !== null) {
        return
      }
      this.$_destroySideBar_hideDetails()
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
    ...mapActions('Files', ['dragOver', 'resetFileSelection']),
    ...mapActions(['showMessage']),
    ...mapMutations(['SET_SIDEBAR_FOOTER_CONTENT_COMPONENT']),

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
