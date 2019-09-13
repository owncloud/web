  <template>
    <div id="files">
      <files-app-bar />
      <oc-grid class="uk-height-1-1" oc-scroll-offset=".oc-app-bar">
        <div class="uk-width-expand uk-overflow-auto uk-height-1-1" @dragover="$_ocApp_dragOver" :class="{ 'uk-visible@m' : _sidebarOpen }">
          <oc-loader id="files-list-progress" v-if="loadingFolder"></oc-loader>
          <trash-bin v-if="$route.name === 'files-trashbin'" :fileData="activeFiles" />
          <SharedFilesList v-else-if="sharedList" @toggle="toggleFileSelect" :fileData="activeFiles" />
          <file-list v-else @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="activeFiles" @sideBarOpen="openSideBar" />
        </div>
        <file-details
          v-if="_sidebarOpen && $route.name !== 'files-trashbin'"
          ref="fileDetails" class="uk-width-1-1 uk-width-1-2@m uk-width-1-3@xl uk-height-1-1"
          @reset="setHighlightedFile(null)"
        />
    </oc-grid>
    <file-actions/>
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FilesAppBar from './FilesAppBar.vue'
import FileList from './FileList.vue'
import TrashBin from './Trashbin.vue'
import SharedFilesList from './Collaborators/SharedFilesList.vue'
import { mapActions, mapGetters } from 'vuex'
import FileActions from './FileActions.vue'

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    FileList,
    FilesAppBar,
    FileActions,
    TrashBin,
    SharedFilesList
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
    ...mapActions(['openFile', 'showMessage', 'setPrivateLinkUrlPath']),

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
    ...mapGetters(['extensions', 'privateLinkUrlPath']),

    _sidebarOpen () {
      return this.highlightedFile !== null
    },

    sharedList () {
      return this.$route.name === 'files-shared-with-me' || this.$route.name === 'files-shared-with-others'
    }
  },
  watch: {
    $route () {
      this.setHighlightedFile(null)
    }
  },
  beforeMount () {
    // Redirect to private link after authorization
    if (this.privateLinkUrlPath) {
      this.$router.push(this.privateLinkUrlPath)
      // Resets private link path in store
      // Needed due to persistance of that state
      this.setPrivateLinkUrlPath(null)
    }
  }
}
</script>
