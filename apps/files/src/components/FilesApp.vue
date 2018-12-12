  <template>
    <v-container id="files-app" fluid pa-0>
      <v-toolbar class="elevation-1">
        <v-btn v-if="!createFile" @click="createFolder ? addNewFolder(newFolderName) : createFolder = !createFolder" flat>
          <v-icon v-if="!createFolder" large>create_new_folder</v-icon>
          <v-icon v-if="createFolder" large>add</v-icon>
        </v-btn>
        <v-btn v-if="!createFolder" @click="createFile ? addNewFile(newFileName, item) : createFile = !createFile" flat>
          <v-icon v-if="!createFile" large>file_copy</v-icon>
          <v-icon v-if="createFile" large>add</v-icon>
        </v-btn>
        <v-flex v-if="createFolder || createFile" xs2>
          <v-text-field
          v-if="createFolder"
          @keydown.enter="addNewFolder(newFolderName)"
          :placeholder="$gettext('Enter foldername here')"
          v-model="newFolderName"
          hide-details
          single-line
          ></v-text-field>
          <v-text-field
          v-if="createFile"
          @keydown.enter="addNewFile(newFileName)"
          :placeholder="$gettext('Enter filename here')"
          v-model="newFileName"
          hide-details
          single-line
          ></v-text-field>
        </v-flex>
        <v-flex align-self-center>
          <file-upload :url='url' :headers="headers" @success="onFileSuccess" @error="onFileError"></file-upload>
        </v-flex>
        <v-flex align-self-center>
          <v-breadcrumbs class="pa-0" :items="activeRoute">
            <template slot="item" slot-scope="props">
              <drop >
                <v-icon @click="navigateTo('files-list', props.item.route)" v-if="props.item.text === 'home'" large>
                  home
                </v-icon>
                <span @click="navigateTo('files-list', props.item.route)" v-else class="heading font-weight-bold">
                  {{ props.item.text }}
                </span>
              </drop>
            </template>
          </v-breadcrumbs>
        </v-flex>
        <v-flex align-self-center class="text-xs-right" xs1>
          <span>
            <translate :translate-n="filteredFiles.length" translate-plural="%{ filteredFiles.length } Results">
              %{ filteredFiles.length } Result
            </translate>
          </span>
        </v-flex>
        <v-menu transition="scale-transition">
          <v-btn slot="activator" flat><v-icon large>filter_list</v-icon></v-btn>
          <v-list>
            <v-list-tile v-for="(filter, fid) in filters" :key="fid">
              <v-list-tile-title v-text="filter.name"></v-list-tile-title>
              <v-checkbox v-model="filter.value"></v-checkbox>
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>
      <v-layout row fill-height>
        <v-flex :class="{'xs12': selectedFiles.length === 0, 'xs6': selectedFiles.length > 0 }" pa-0 fill-height>
          <dir-table @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="filteredFiles" />
        </v-flex>
        <v-flex v-if="selectedFiles.length > 0" xs6 pa-0>
          <file-details :items="selectedFiles" :starsEnabled="false" :checkboxEnabled="false"/>
        </v-flex>
      </v-layout>
      <fileactions-tab :sheet="showActionBar" :file="fileAction" @close="showActionBar = !showActionBar"/>
    </v-container>
  </template>

<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import FileactionsTab from './FileactionsTab.vue'
import DirTable from './DirTable.vue'
import FileUpload from './FileUpload.vue'
import { filter } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'

const _includes = require('lodash/includes')

const davProperties = [
  '{http://owncloud.org/ns}favorite',
  '{DAV:}getcontentlength',
  '{http://owncloud.org/ns}size',
  '{DAV:}getlastmodified',
  '{DAV:}resourcetype'
]

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    FileactionsTab,
    DirTable,
    FileUpload
  },
  data () {
    return {
      showActionBar: false,
      createFolder: false,
      createFile: false,
      fileAction: {},
      fileName: '',
      selected: [],
      loading: false,
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
      self: {},
      newFolderName: '',
      newFileName: ''
    }
  },
  mounted () {
    this.getFolder()
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'addFileSelection', 'removeFileSelection', 'loadFiles', 'markFavorite', 'addFiles']),
    ...mapActions(['openFile']),
    trace () {
      console.info('trace', arguments)
    },

    onFileSuccess (event, file) {
      this.$client.files.fileInfo(file.name, davProperties).then(fileInfo => {
        this.addFiles({
          files: [fileInfo]
        })
      })
    },

    onFileError (error) {
      console.log('file error ' + error)
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
      this.showActionBar = true
      this.fileAction = file
    },

    addNewFile (fileName, path) {
      this.createFile = !this.createFile
      if (fileName !== '') {
        if (path === 'home') {
          path = '/'
        }
        console.log('addNewFile', fileName, 'pathToAddto', path)
      }
    },

    addNewFolder (folderName) {
      this.createFolder = !this.createFolder
      if (folderName !== '') {
        this.createFolder = !this.createFolder
        this.$client.files.createFolder(((this.item === 'home') ? '' : this.item) + '/' + folderName)
          .then(() => {
            this.getFolder()
            this.newFolderName = ''
          })
          .catch(console.error)
      }
    },

    ifFiltered (item) {
      for (let filter of this.filters) {
        if (item.type === filter.tag) {
          return filter.value
        } else if (item.name.startsWith('.')) {
          return this.filters[2].value
        }
      }
    },

    getFolder () {
      if (!this.iAmActive) {
        return false
      }
      this.path = []
      let absolutePath = this.$route.params.item === 'home' ? '/' : this.route.params.item
      this.$client.files.list(absolutePath, 1, davProperties).then(res => {
        let files = res.splice(1)

        this.loadFiles(files)

        this.self = files.self

        this.resetFileSelection()
      })
    },
    getRoutes () {
      this.breadcrumbs = []
      let breadcrumb = {}
      let absolutePath = this.route.params.item
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
    ...mapGetters('Files', ['selectedFiles', 'files']),
    ...mapGetters(['getToken']),

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
    },

    url () {
      let path = this.item === 'home' ? '/' : this.item + '/'
      return this.$client.files.getFileUrl(path)
    },
    headers () {
      return {
        'Authorization': 'Bearer ' + this.getToken
      }
    }
  }
}
</script>
