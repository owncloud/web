<template>
  <div id="files" class="uk-flex">
    <div
      ref="filesListWrapper"
      tabindex="-1"
      class="uk-width-expand uk-height-1-1 uk-flex uk-flex-column files-list-wrapper uk-overflow-hidden"
      :class="{ 'uk-visible@m': _sidebarOpen }"
      @dragover="$_ocApp_dragOver"
    >
      <files-app-bar />
      <upload-progress v-show="$_uploadProgressVisible" class="oc-p-s uk-background-muted" />
      <trash-bin
        v-if="$route.name === 'files-trashbin'"
        class="uk-flex-1 uk-overflow-hidden"
        :file-data="activeFiles"
      />
      <shared-files-list
        v-else-if="sharedList"
        class="uk-flex-1 uk-overflow-hidden"
        :file-data="activeFiles"
        @sideBarOpen="openSideBar"
      />
      <all-files-list
        v-else
        class="uk-flex-1 uk-overflow-hidden"
        :file-data="activeFiles"
        :parent-folder="currentFolder"
        @sideBarOpen="openSideBar"
      />
    </div>
    <file-details
      v-if="_sidebarOpen && $route.name !== 'files-trashbin'"
      class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl uk-height-1-1"
      @reset="setHighlightedFile(null)"
    />
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FilesAppBar from './FilesAppBar.vue'
import AllFilesList from './AllFilesList.vue'
import TrashBin from './Trashbin.vue'
import SharedFilesList from './Collaborators/SharedFilesList.vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
const UploadProgress = () => import('./UploadProgress.vue')

export default {
  components: {
    FileDetails,
    AllFilesList,
    FilesAppBar,
    TrashBin,
    SharedFilesList,
    UploadProgress
  },
  mixins: [Mixins],
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

    sharedList() {
      return (
        this.$route.name === 'files-shared-with-me' ||
        this.$route.name === 'files-shared-with-others'
      )
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
.files-list-wrapper:focus {
  outline: none;
}
</style>
