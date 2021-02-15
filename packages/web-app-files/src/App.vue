<template>
  <div id="files">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="files-list-wrapper uk-width-expand"
      :class="{ 'uk-visible@m': _sidebarOpen }"
      @dragover="$_ocApp_dragOver"
    >
      <app-bar id="files-app-bar" />
      <upload-progress
        v-show="$_uploadProgressVisible"
        id="files-upload-progress"
        class="oc-p-s uk-background-muted"
      />
      <router-view id="files-view" />
    </div>
    <sidebar
      v-if="_sidebarOpen"
      id="files-sidebar"
      class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl"
      @reset="setHighlightedFile(null)"
    />
  </div>
</template>
<script>
import Mixins from './mixins'
import MixinRoutes from './mixins/routes'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import Sidebar from './components//Sidebar.vue'
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
    ...mapGetters('Files', [
      'selectedFiles',
      'activeFiles',
      'dropzone',
      'loadingFolder',
      'highlightedFile',
      'currentFolder',
      'inProgress'
    ]),

    _sidebarOpen() {
      return this.highlightedFile !== null
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

    $_ocApp_dragOver() {
      this.dragOver(true)
    },

    $_ocAppSideBar_onReload() {
      this.$refs.filesList.$_ocFilesFolder_getFolder()
    }
  }
}
</script>

<style scoped>
.files-list-wrapper {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: max-content max-content 1fr;
  gap: 0px 0px;
  grid-template-areas:
    'header'
    'upload'
    'main';
}

.files-list-wrapper:focus {
  outline: none;
}

#files-sidebar {
  position: sticky;
  top: 60px;
  max-height: 100vh;
}

#files-app-bar {
  position: sticky;
  top: 60px;
  height: 90px;
  z-index: 1;
  grid-area: header;
}

#files-view {
  grid-area: main;
}

#files-upload-progress {
  grid-area: upload;
}
</style>
