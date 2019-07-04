  <template>
    <div id="files">
      <files-app-bar />
      <oc-grid class="uk-height-1-1" oc-scroll-offset=".oc-app-bar">
        <div class="uk-width-expand uk-overflow-auto uk-height-1-1" @dragover="$_ocApp_dragOver" :class="{ 'uk-visible@m' : _sidebarOpen }">
          <oc-loader id="files-list-progress" v-if="loadingFolder"></oc-loader>
          <trashbin v-if="$route.name === 'files-trashbin'" :fileData="activeFiles" />
          <file-list v-else @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="activeFiles" @sideBarOpen="openSideBar" />
        </div>
        <div class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl uk-height-1-1" v-if="_sidebarOpen && $route.name !== 'files-trashbin'">
          <file-details ref="fileDetails" @reset="setHighlightedFile(null)"/>
        </div>
    </oc-grid>
    <oc-file-actions />
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FilesAppBar from './FilesAppBar.vue'
import FileList from './FileList.vue'
import Trashbin from './Trashbin.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    FileList,
    FilesAppBar,
    Trashbin
  },
  data () {
    return {
      createFolder: false,
      fileUploadName: '',
      fileUploadProgress: 0,
      upload: false,
      fileName: '',
      selected: [],
      breadcrumbs: [],
      self: {}
    }
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'addFileSelection', 'removeFileSelection', 'dragOver', 'setHighlightedFile', 'toggleFileSelect']),
    ...mapActions(['openFile', 'showMessage']),

    trace () {
      console.info('trace', arguments)
    },

    toggleFileSelect (item) {
      if (this.selectedFiles.includes(item)) {
        this.removeFileSelection(item)
      } else {
        this.addFileSelection(item)
      }
    },

    openFileAction (appId) {
      this.$emit('open', appId)
      // TODO path to state
      this.$router.push({
        name: appId
      })
    },

    openFileActionBar (file) {
      this.openFile({
        filePath: file.path
      })
      let actions = this.extensions(file.extension)
      actions = actions.map(action => {
        return {
          label: action.name,
          icon: action.icon,
          onClick: () => {
            this.openFileAction(action.app)
          }
        }
      })
      actions.push({
        label: this.$gettext('Download'),
        icon: 'file_download',
        onClick: () => {
          this.downloadFile(file)
        }
      })

      this.$root.$emit('oc-file-actions:open', {
        filename: file.name,
        actions: actions
      })
    },

    openSideBar (file, sideBarName) {
      this.setHighlightedFile(file)
      const self = this
      this.$nextTick().then(() => {
        self.$refs.fileDetails.showSidebar(sideBarName)
      })
    },

    $_ocApp_dragOver () {
      this.dragOver(true)
    },

    $_ocAppSideBar_onReload () {
      this.$refs.filesList.$_ocFilesFolder_getFolder()
    }
  },

  computed: {
    ...mapGetters('Files', ['selectedFiles', 'activeFiles', 'dropzone', 'loadingFolder', 'highlightedFile']),
    ...mapGetters(['extensions']),

    _sidebarOpen () {
      return this.highlightedFile !== null
    }
  }
}
</script>
