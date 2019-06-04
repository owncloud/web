  <template>
    <div id="files">
      <files-app-bar></files-app-bar>
      <oc-grid class="uk-height-1-1" @dragover="$_ocApp_dragOver">
        <div class="uk-width-expand uk-overflow-auto uk-height-1-1" :class="{ 'uk-visible@s' : _sidebarOpen }">
          <oc-loader id="files-list-progress" v-if="loadingFolder"></oc-loader>
          <file-list @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="activeFiles" @sideBarOpen="openSideBar"/>
        </div>
        <div class="uk-width-1-1 uk-width-medium@s uk-width-large@l" v-show="_sidebarOpen">
          <file-details :items="selectedFiles" :starsEnabled="false" :checkboxEnabled="false" ref="fileDetails" @reload="$_ocFilesFolder_getFolder" @reset="resetFileSelection"/>
        </div>
      <oc-file-actions></oc-file-actions>
    </oc-grid>
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FilesAppBar from './FilesAppBar.vue'
import FileList from './FileList.vue'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    FileList,
    FilesAppBar
  },
  data () {
    return {
      createFolder: false,
      fileUploadName: '',
      fileUploadProgress: 0,
      upload: false,
      fileName: '',
      selected: [],
      fileFilterQuery: '',
      breadcrumbs: [],
      self: {}
    }
  },
  mounted () {
    this.$_ocFilesFolder_getFolder()
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'addFileSelection', 'removeFileSelection', 'loadFiles', 'markFavorite', 'addFiles', 'updateFileProgress', 'resetSearch', 'dragOver', 'loadFolder']),
    ...mapActions(['openFile', 'showNotification']),

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
      this.resetFileSelection()
      this.addFileSelection(file)
      const self = this
      this.$nextTick().then(() => {
        self.$refs.fileDetails.showSidebar(sideBarName)
      })
    },

    ifFiltered (item) {
      for (let filter of this.fileFilter) {
        if (item.type === filter.tag) {
          if (!filter.value) return false
        } else if (item.name.startsWith('.')) {
          // show hidden files ?
          if (this.fileFilter[2].value) return false
        }
      }
      // respect filename filter for local 'search' in open folder
      if (this.fileFilterQuery && !item.name.toLowerCase().includes(this.fileFilterQuery.toLowerCase())) return false
      return true
    },
    onFilenameFilter (query) {
      this.fileFilterQuery = query
    },
    focusFilenameFilter () {
      this.$refs.filenameFilter.$el.querySelector('input').focus()
      // nested vuetify VList animation will block native autofocus, so we use this workaround...
      setTimeout(() => {
        // ...to set focus after the element is rendered visible
        this.$refs.filenameFilter.$el.querySelector('input').focus()
      }, 50)
    },
    $_ocFilesFolder_getFolder () {
      // clear file filter search query when folder changes
      this.fileFilterQuery = ''

      this.loadFolder({
        client: this.$client,
        absolutePath: this.$route.params.item === '' ? '/' : this.route.params.item,
        $gettext: this.$gettext,
        routeName: this.$route.name
      })
    },
    $_ocApp_dragOver () {
      this.dragOver(true)
    }
  },

  watch: {
    item () {
      this.$_ocFilesFolder_getFolder()
    }
  },

  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', ['selectedFiles', 'inProgress', 'activeFiles', 'fileFilter', 'davProperties', 'searchTerm', 'dropzone', 'loadingFolder']),
    ...mapGetters(['getToken', 'extensions']),

    item () {
      return this.$route.params.item
    },

    _sidebarOpen () {
      return this.selectedFiles.length > 0
    }
  }
}
</script>
