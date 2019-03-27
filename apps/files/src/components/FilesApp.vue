  <template>
    <div class="oc-app" id="files-app">
      <oc-app-content>
        <template slot="content">
          <oc-loader id="files-list-progress" v-if="loading"></oc-loader>
          <file-list @toggle="toggleFileSelect" @FileAction="openFileActionBar" :fileData="activeFiles" @sideBarOpen="openSideBar"/>
        </template>
      </oc-app-content>
      <oc-file-actions></oc-file-actions>
      <file-details v-if="selectedFiles.length > 0" :items="selectedFiles" :starsEnabled="false" :checkboxEnabled="false" ref="fileDetails" @reload="getFolder" @reset="resetFileSelection"/>
  </div>
</template>
<script>
import Mixins from '../mixins'
import FileDetails from './FileDetails.vue'
import OcAppContent from 'oc_components/OcAppContent.vue'
import FileList from './FileList.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
const _includes = require('lodash/includes')

export default {
  mixins: [
    Mixins
  ],
  components: {
    FileDetails,
    OcAppContent,
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
      loading: false,
      fileFilterQuery: '',
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

    openFileAction (appId) {
      this.$emit('open', appId)
      // TODO path to state
      this.$router.push({
        name: appId
      })
    },

    openFileActionBar (file) {
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
    getFolder () {
      if (!this.iAmActive) {
        return false
      }
      this.loading = true
      this.path = []
      // clear file filter search query when folder changes
      this.fileFilterQuery = ''
      let absolutePath = this.$route.params.item === 'home' ? '/' : this.route.params.item
      this.$client.files.list(absolutePath, 1, this.davProperties).then(res => {
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
    ...mapGetters('Files', ['selectedFiles', 'inProgress', 'activeFiles', 'fileFilter', 'davProperties']),
    ...mapGetters(['getToken', 'extensions']),
    activeRoute () {
      return this.getRoutes()
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
