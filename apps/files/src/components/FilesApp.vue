  <template>
    <div class="oc-app" id="files-app" @dragover="$_ocApp_dragOver">
      <oc-app-layout :rightHidden="selectedFiles.length === 0">
        <template slot="center">
          <oc-loader id="files-list-progress" v-if="loadingFolder"></oc-loader>
          <file-list @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="activeFiles" @sideBarOpen="openSideBar"/>
        </template>
        <template slot="right">
          <file-details :items="selectedFiles" :starsEnabled="false" :checkboxEnabled="false" ref="fileDetails" @reload="$_ocFilesFolder_getFolder" @reset="resetFileSelection"/>
        </template>
      </oc-app-layout>
      <oc-file-actions></oc-file-actions>
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FileList from './FileList.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
const _includes = require('lodash/includes')

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    FileList
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
      if (_includes(this.selectedFiles, item)) {
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
      if (!this.iAmActive) {
        return false
      }
      // clear file filter search query when folder changes
      this.fileFilterQuery = ''
      this.loadFolder({
        client: this.$client,
        absolutePath: this.$route.params.item === '' ? '/' : this.route.params.item,
        $gettext: this.$gettext
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

    iAmActive () {
      return this.$route.name === 'files-list'
    }
  }
}
</script>
