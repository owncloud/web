<template>
  <div>
  <oc-topbar variation="secondary" uk-sticky="offset: 60">
    <template slot="left">
      <oc-topbar-logo icon="home" @click="navigateTo('files-list', 'home')"></oc-topbar-logo>
      <oc-breadcrumb id="files-breadcrumb" :items="activeRoute" v-if="!atSearchPage"></oc-breadcrumb>
    </template>
    <template slot="title">
      <div class="uk-navbar-item">
        <oc-search-bar @search="onFileSearch" :label="searchLabel" :loading="isLoadingSearch" :button="false"/>
      </div>
    </template>
    <template slot="right">
      <div class="uk-navbar-item">
        <oc-menu v-show="fileUpload">
          <oc-progress-pie slot="activator" :progress="this.fileUploadProgress | roundNumber" :max="100" show-label />
          <oc-upload-menu :items="inProgress" />
        </oc-menu>

        <oc-menu v-if="this.canUpload">
          <oc-button id="new-file-menu-btn" slot="activator" variation="primary" type="button">
            <translate>+ New</translate>
          </oc-button>
          <template slot="subnav">
            <file-upload :url='url' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress"></file-upload>
            <oc-menu-item @click="createFolder = true" id="new-folder-btn" icon="create_new_folder"><translate>Create new folder ...</translate></oc-menu-item>
            <oc-menu-item @click="createFile = true" id="new-file-btn" icon="save"><translate>Create new file ...</translate></oc-menu-item>
          </template>
        </oc-menu>
        <span v-if="!this.canUpload" v-translate>You have no permission to upload.</span>
      </div>
      <div class="uk-navbar-item">
        <translate :translate-n="activeFiles.length" translate-plural="%{ activeFiles.length } Results">
          %{ activeFiles.length } Result
        </translate>
      </div>
      <div class="uk-navbar-item">
        <oc-icon name="filter_list" id="oc-filter-list-btn" />
        <file-filter-menu />
      </div>
    </template>
  </oc-topbar>
  <oc-dialog-prompt name="new-folder-dialog" :oc-active="createFolder" v-model="newFolderName" ocInputId="new-folder-input" ocConfirmId="new-folder-ok"
                    :ocLoading="fileFolderCreationLoading"
                    :ocTitle="_createFolderDialogTitle" @oc-confirm="addNewFolder" @oc-cancel="createFolder = false; newFolderName = ''"></oc-dialog-prompt>
  <oc-dialog-prompt name="new-file-dialog" :oc-active="createFile" v-model="newFileName"
                    :ocLoading="fileFolderCreationLoading"
                    :ocTitle="_createFileDialogTitle" @oc-confirm="addNewFile" @oc-cancel="createFile = false; newFileName = ''"></oc-dialog-prompt>
  </div>
</template>

<script>
import FileUpload from './FileUpload.vue'
import FileFilterMenu from './FileFilterMenu.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import Mixins from '../mixins'

export default {
  components: {
    FileUpload,
    OcDialogPrompt,
    FileFilterMenu
  },
  mixins: [
    Mixins
  ],
  data: () => ({
    createFolder: false,
    isLoadingSearch: false,
    newFolderName: '',
    newFileName: '',
    fileUpload: false,
    fileUploadProgress: 0,
    createFile: false,
    path: '',
    searchedFiles: [],
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters(['getToken']),
    ...mapGetters('Files', ['activeFiles', 'inProgress', 'searchTerm', 'atSearchPage', 'currentFolder', 'davProperties']),
    ...mapState(['route']),
    searchLabel () {
      return this.$gettext('Search')
    },
    _createFolderDialogTitle () {
      return this.$gettext('Create new folder ...')
    },
    _createFileDialogTitle () {
      return this.$gettext('Create new file ...')
    },
    item () {
      return this.$route.params.item
    },
    url () {
      let path = this.item === 'home' ? '/' : `${this.item}/`
      return this.$client.files.getFileUrl(`/${path}`)
    },
    headers () {
      return {
        'Authorization': 'Bearer ' + this.getToken
      }
    },
    activeRoute () {
      return this.getRoutes()
    },
    canUpload () {
      if (this.currentFolder === null) {
        return false
      }
      return this.currentFolder.canUpload()
    }
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'loadFiles', 'addFiles', 'updateFileProgress', 'searchForFile']),
    ...mapActions(['openFile', 'showNotification']),
    onFileSearch (searchTerm = '') {
      if (searchTerm === '') {
        this.isLoadingSearch = false
      } else {
        this.isLoadingSearch = true
      }
      // write search term into files app state
      this.searchForFile({
        searchTerm,
        client: this.$client
      }).then(() => {
        this.isLoadingSearch = false
      })
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
      this.path = []
      // clear file filter search query when folder changes
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
    addNewFolder (folderName) {
      if (folderName !== '') {
        this.fileFolderCreationLoading = true
        this.$client.files.createFolder(((this.item === 'home') ? '' : this.item) + '/' + folderName)
          .then(() => {
            this.createFolder = false
            this.newFolderName = ''
            this.getFolder()
          })
          .catch(error => {
            this.showNotification({
              title: this.$gettext('Creating folder failed ....'),
              desc: error,
              type: 'error'
            })
          })
          .finally(() => {
            this.fileFolderCreationLoading = false
          })
      }
    },
    addNewFile (fileName) {
      if (fileName !== '') {
        this.fileFolderCreationLoading = true
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
          .finally(() => {
            this.fileFolderCreationLoading = false
          })
      }
    },
    onFileSuccess (event, file) {
      this.$nextTick().then(() => {
        const filePath = ((this.item === 'home') ? '' : this.item) + '/' + file.name
        this.$client.files.fileInfo(filePath, this.davProperties).then(fileInfo => {
          this.fileUploadProgress = 0
          this.addFiles({
            files: [fileInfo]
          })
          this.fileUpload = false
        }).catch(() => {
          this.fileUploadProgress = 0
          this.getFolder()
        })
      })
    },

    onFileError () {
      this.fileUploadProgress = 0
      this.showNotification({
        title: this.$gettext('File upload failed ....'),
        type: 'error'
      })
      this.fileUpload = false
    },

    onFileProgress (progress) {
      this.fileUpload = true
      this.updateFileProgress(progress)
      let progressTotal = 0
      for (let item of this.inProgress) {
        progressTotal = progressTotal + item.progress
      }
      if (this.inProgress.length !== 0) {
        this.fileUploadProgress = progressTotal / this.inProgress.length
      } else {
        this.fileUploadProgress = 100
      }
      return this.fileUploadProgress
    },
    getRoutes () {
      this.breadcrumbs = []
      let breadcrumb = {}
      let absolutePath = this.$route.params.item
      let pathSplit = absolutePath.split('/').filter((val) => val)
      for (let i = 0; i < pathSplit.length; i++) {
        breadcrumb.index = i
        breadcrumb.text = pathSplit.slice(0, i + 1)[i]
        breadcrumb.to = '/files/list/' + pathSplit.slice(0, i + 1).join('/')
        if (i === 0 && breadcrumb.text === 'home') {
          continue
        }
        this.breadcrumbs.push(breadcrumb)
        breadcrumb = {}
      }
      return this.breadcrumbs
    }
  },
  filters: {
    roundNumber (value) {
      return parseInt(value.toFixed(0))
    }
  }
}
</script>
