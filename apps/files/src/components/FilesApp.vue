  <template>
    <v-content>
      <v-container id="files-app" fluid pa-0 style="height: 100vh">
      <v-toolbar class="elevation-1">
        <v-flex align-self-center>
          <v-breadcrumbs class="pa-0" :items="activeRoute">
            <template slot="item" slot-scope="props">
              <drop >
                <v-icon @click="navigateTo('files-list', 'home')" v-if="props.item.text === 'home'" large>
                  home
                </v-icon>
                <span @click="navigateTo('files-list', props.item.route)" v-else class="heading font-weight-bold" style="cursor: pointer">
                  {{ props.item.text }}
                </span>
              </drop>
            </template>
          </v-breadcrumbs>
        </v-flex>
        <oc-dialog-prompt :oc-active="createFolder" v-model="newFolderName"
                          ocTitle="Create new folder ..." @oc-confirm="addNewFolder" @oc-cancel="createFolder = false; newFolderName = ''"></oc-dialog-prompt>
        <oc-dialog-prompt :oc-active="createFile" v-model="newFileName"
                          ocTitle="Create new file ..." @oc-confirm="addNewFile" @oc-cancel="createFile = false; newFileName = ''"></oc-dialog-prompt>
                          <v-flex xs2>
                          </v-flex>
          <v-menu offset-y >
          <v-progress-circular
             slot="activator"
             :value="fileUploadProgress"
             color="primary"
           > {{ inProgress.length }} </v-progress-circular>
           <v-list
           v-for="n in inProgress.length"
           :key="n"
           two-line
           >
            <v-list-tile
            avatar
            ripple>
                 <v-list-tile-avatar>
                  <v-icon color="primary">file_copy</v-icon>
                </v-list-tile-avatar>
                 <v-list-tile-title>{{ inProgress[n - 1].name }}</v-list-tile-title>
                 <v-list-tile-sub-title class="text--primary">{{ inProgress[n - 1].size| fileSize}}</v-list-tile-sub-title>
                 <v-progress-linear color="primary" :value="inProgress[n - 1].progress"></v-progress-linear>
             </v-list-tile>
           </v-list>
       </v-menu>
        <v-menu
          offset-y
        >
          <v-btn
            slot="activator"
            color="primary"
            dark
            v-translate
          >
            + New
          </v-btn>
          <v-card>
            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0" v-translate>Create and upload files and folder</h3>
                <div>You can upload files and folders<br>And create folders and various files ...</div>
              </div>
            </v-card-title>

            <v-divider></v-divider>

            <v-list>
              <file-upload :url='url' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress"></file-upload>
              <v-divider></v-divider>
              <v-list-tile @click="createFolder = true">
                <v-list-tile-action>
                  <v-icon>create_new_folder</v-icon>
                </v-list-tile-action>
                <v-list-tile-title v-translate>New folder</v-list-tile-title>
              </v-list-tile>
              <v-list-tile @click="createFile = true">
                <v-list-tile-action>
                  <v-icon>file_copy</v-icon>
                </v-list-tile-action>
                <v-list-tile-title v-translate>New file</v-list-tile-title>
              </v-list-tile>
            </v-list>

          </v-card>
        </v-menu>
        <v-flex align-self-center class="text-xs-right" xs1>
          <span>
            <translate :translate-n="filteredFiles.length" translate-plural="%{ filteredFiles.length } Results">
              %{ filteredFiles.length } Result
            </translate>
          </span>
        </v-flex>
        <v-menu transition="scale-transition">
          <v-btn slot="activator" flat @click="focusFilenameFilter"><v-icon large>filter_list</v-icon></v-btn>
          <v-list>
            <v-list-tile v-for="(filter, fid) in filters" :key="fid">
              <v-list-tile-title v-text="filter.name"></v-list-tile-title>
              <v-checkbox v-model="filter.value"></v-checkbox>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-title>
                <span v-translate>Name</span>
              </v-list-tile-title>
              <search-bar @search="onFilenameFilter" :value="fileFilterQuery" ref="filenameFilter" autofocus />
            </v-list-tile>
          </v-list>
        </v-menu>
      </v-toolbar>
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
import FileUpload from './FileUpload.vue'
import SearchBar from 'oc_components/form/SearchBar.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
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
    FileActionsTab,
    FileList,
    FileUpload,
    SearchBar,
    OcDialogPrompt
  },
  data () {
    return {
      showActionBar: false,
      createFolder: false,
      createFile: false,
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
      self: {},
      newFolderName: '',
      newFileName: ''
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
    onFileSuccess (event, file) {
      this.$nextTick().then(() => {
        const filePath = ((this.item === 'home') ? '' : this.item) + '/' + file.name
        this.$client.files.fileInfo(filePath, davProperties).then(fileInfo => {
          this.fileUploadProgress = 0
          this.fileUploadName = ''
          this.addFiles({
            files: [fileInfo]
          })
        }).catch(() => {
          this.fileUploadProgress = 0
          this.fileUploadName = ''
          this.getFolder()
        })
      })
    },

    onFileError (error) {
      this.fileUploadProgress = 0
      this.fileUploadName = ''
      this.showNotification({
        title: this.$gettext('File upload failed ....'),
        desc: error,
        type: 'error'
      })
    },

    onFileProgress (progress) {
      this.updateFileProgress(progress)
      let progressTotal = 0
      for (let item of this.inProgress) {
        progressTotal = progressTotal + item.progress
      }
      this.fileUploadProgress = progressTotal / this.inProgress.length
      return this.fileUploadProgress
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

    openSideBar (file, sideBarName) {
      this.resetFileSelection()
      this.addFileSelection(file)
      this.$nextTick().then(() => {
        this.$refs.fileDetails.showSidebar(sideBarName)
      })
    },

    addNewFile (fileName) {
      this.createFile = !this.createFile
      if (fileName !== '') {
        this.$client.files.putFileContents(((this.item === 'home') ? '' : this.item) + '/' + fileName, '')
          .then(() => {
            this.getFolder()
            this.createFile = false
            this.newFileName = ''
          })
          .catch(error => {
            this.showNotification({
              title: this.$gettext('Creating folder failed ....'),
              desc: error,
              type: 'error'
            })
          })
      }
    },

    addNewFolder (folderName) {
      if (folderName !== '') {
        this.$client.files.createFolder(((this.item === 'home') ? '' : this.item) + '/' + folderName)
          .then(() => {
            this.getFolder()
            this.createFolder = false
            this.newFolderName = ''
          })
          .catch(error => {
            this.showNotification({
              title: this.$gettext('Creating folder failed ....'),
              desc: error,
              type: 'error'
            })
          })
      }
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
        if (res === null) {
          this.showNotification({
            title: this.$gettext('Loading folder failed ....'),
            type: 'error'
          })
        } else {
          files = res.splice(1)
        }

        this.loadFiles(files)

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
