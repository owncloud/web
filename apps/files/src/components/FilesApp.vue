  <template>
    <v-container id="files-app" fluid pa-0>
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
import { filter } from 'lodash'
import { mapActions, mapGetters, mapState } from 'vuex'

// import FileUpload from './FileUpload.vue'

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
    DirTable
    // FileUpload
  },
  data () {
    return {
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
      showActionBar: false,
      createFolder: false,
      createFile: false,
      fileAction: {},
      fileName: '',
      selected: [],
      loading: false,
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
