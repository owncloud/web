  <template>
    <v-content>
      <v-container id="files-app" fluid pa-0>
      <v-layout row fill-height>
        <v-flex :class="{'xs12': selectedFiles.length === 0, 'xs6': selectedFiles.length > 0 }" pa-0 fill-height>
          <v-progress-linear v-if="loading" :indeterminate="true"></v-progress-linear>
          <file-list @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="filteredFiles" @sideBarOpen="openSideBar"/>
        </v-flex>
        <v-flex v-if="selectedFiles.length > 0" xs6 pa-0>
          <file-details :items="selectedFiles" :starsEnabled="false" :checkboxEnabled="false" ref="fileDetails"/>
        </v-flex>
        <file-actions-tab :sheet="showActionBar" :file="fileAction" @close="showActionBar = !showActionBar"/>
      </v-layout>
    </v-container>
    </v-content>
  </template>

<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FileActionsTab from './FileactionsTab.vue'
import FileList from './FileList.vue'
import { filter } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'

const _includes = require('lodash/includes')

const davProperties = [
  '{http://owncloud.org/ns}permissions',
  '{http://owncloud.org/ns}favorite',
  '{http://owncloud.org/ns}id',
  '{http://owncloud.org/ns}owner-id',
  '{http://owncloud.org/ns}owner-display-name',
  '{DAV:}getcontentlength',
  '{http://owncloud.org/ns}size',
  '{DAV:}getlastmodified',
  '{DAV:}getetag',
  '{DAV:}resourcetype'
]

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    FileActionsTab,
    FileList
  },
  data () {
    return {
      showActionBar: false,
      createFolder: false,
      fileUploadName: '',
      fileUploadProgress: 0,
      upload: false,
      fileAction: {},
      fileName: '',
      selected: [],
      loading: false,
      fileFilterQuery: '',
      filters: [
        {
          name: 'Files',
          tag: 'file',
          value: true
        }, {
          name: 'Folders',
          tag: 'folder',
          value: true
        }, {
          name: 'Hidden',
          tag: 'hidden',
          value: false
        }
      ],
      path: [],
      breadcrumbs: [],
      self: {}
    }
  },
  mounted () {
    this.getFolder()
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'addFileSelection', 'removeFileSelection', 'loadFiles', 'markFavorite', 'addFiles', 'updateFileProgress']),
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

    openFileActionBar (file) {
      this.openFile({
        client: this.$client,
        filePath: file.path
      })
      if (this.extensions) {
        this.showActionBar = true
        this.fileAction = file
      } else {
        this.downloadFile(file)
      }
    },

    openSideBar (file, sideBarName) {
      this.resetFileSelection()
      this.addFileSelection(file)
      this.$nextTick().then(() => {
        this.$refs.fileDetails.showSidebar(sideBarName)
      })
    },

    ifFiltered (item) {
      for (let filter of this.filters) {
        if (item.type === filter.tag) {
          if (!filter.value) return false
        } else if (item.name.startsWith('.')) {
          // show hidden files ?
          if (this.filters[2].value) return false
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
    getFolder () {
      if (!this.iAmActive) {
        return false
      }
      this.loading = true
      this.path = []
      // clear file filter search query when folder changes
      this.fileFilterQuery = ''
      let absolutePath = this.$route.params.item === 'home' ? '/' : this.route.params.item
      this.$client.files.list(absolutePath, 1, davProperties).then(res => {
        let files = []
        let currentFolder = null
        if (res === null) {
          this.showNotification({
            title: this.$gettext('Loading folder failed ....'),
            type: 'error'
          })
        } else {
          currentFolder = res[0]
          files = res.splice(1)
        }
        this.loadFiles({ currentFolder, files })
        this.self = files.self
        this.resetFileSelection()
      }).catch(error => {
        this.showNotification({
          title: this.$gettext('Loading folder failed ....'),
          desc: error.message,
          type: 'error'
        })
      }).finally(() => {
        this.loading = false
      })
    },
    getRoutes () {
      this.breadcrumbs = []
      let breadcrumb = {}
      let absolutePath = this.$route.params.item
      let pathSplit = absolutePath.split('/').filter((val) => val)
      if (!_includes(pathSplit, 'home')) {
        breadcrumb.text = 'home'
        breadcrumb.route = breadcrumb.text
        this.breadcrumbs.push(breadcrumb)
        breadcrumb = {}
      }
      for (let i = 0; i < pathSplit.length; i++) {
        breadcrumb.text = pathSplit.slice(0, i + 1)[i]
        breadcrumb.route = '/' + pathSplit.slice(0, i + 1).join('/')
        this.breadcrumbs.push(breadcrumb)
        breadcrumb = {}
      }
      return this.breadcrumbs
    }
  },

  watch: {
    item () {
      this.getFolder()
    }
  },

  computed: {
    ...mapState(['route']),
    ...mapGetters('Files', ['selectedFiles', 'files', 'inProgress']),
    ...mapGetters(['getToken', 'extensions']),
    activeRoute () {
      return this.getRoutes()
    },

    filteredFiles () {
      return filter(this.files, (file) => {
        return this.ifFiltered(file)
      })
    },

    item () {
      return this.$route.params.item
    },

    iAmActive () {
      return this.$route.name === 'files-list'
    }
  }
}
</script>
