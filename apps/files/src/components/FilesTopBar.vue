<template>
  <div>
    <oc-app-top-bar>
      <template slot="left">
        <v-breadcrumbs style="padding: 12px 12px;" :items="activeRoute" v-if="!atSearchPage">
          <template slot="item" slot-scope="props">
            <drop >
              <v-icon @click="navigateTo('files-list', 'home')" v-if="props.item.text === 'home'" large>
                home
              </v-icon>
              <span @click="navigateTo('files-list', props.item.route)" v-else class="heading font-weight-bold pl-1 pr-1 pt-2 pb-2" style="cursor: pointer">
                {{ props.item.text }}
              </span>
            </drop>
          </template>
        </v-breadcrumbs>
        <div style="padding: 12px 12px; cursor: pointer;"  v-else @click="onFileSearch()">
          <v-icon large>
            home
          </v-icon>
        </div>
      </template>
      <template slot="title">
        <search-bar @search="onFileSearch" :value="searchTerm" :label="$gettext('Search')" :loading="isLoadingSearch"/>
      </template>
      <template slot="action_progress">
        <v-menu offset-y v-show="fileUpload">
          <v-progress-circular
          style="margin: 1em;"
          slot="activator"
          :value="fileUploadProgress"
          color="primary"
          > {{ inProgress.length }} </v-progress-circular>
              <v-list
              v-for="n in inProgress.length"
              :key="n"
              two-line>
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
      </template>
      <template slot="action_new" v-if="this.canUpload">
    <v-menu
    class="mt-2 mr-2"
    offset-y
    v-if="!atSearchPage"
    >
    <v-btn
    slot="activator"
    color="primary"
    dark
    v-translate>
    + New
  </v-btn>
  <v-card>
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
      </template>
      <template slot="action_new" v-if="!this.canUpload">
        <span style="line-height: 65px;" v-translate>You have no permission to upload.</span>
      </template>
      <template slot="action_count">
        <span style="line-height: 65px;">
          <translate :translate-n="activeFiles.length" translate-plural="%{ activeFiles.length } Results">
            %{ activeFiles.length } Result
          </translate>
        </span>
      </template>
      <template slot="action_filter">
        <file-filter-menu />
      </template>
    </oc-app-top-bar>
    <oc-dialog-prompt :oc-active="createFolder" v-model="newFolderName"
                      :ocLoading="fileFolderCreationLoading"
                      ocTitle="Create new folder ..." @oc-confirm="addNewFolder" @oc-cancel="createFolder = false; newFolderName = ''"></oc-dialog-prompt>
    <oc-dialog-prompt :oc-active="createFile" v-model="newFileName"
                      :ocLoading="fileFolderCreationLoading"
                      ocTitle="Create new file ..." @oc-confirm="addNewFile" @oc-cancel="createFile = false; newFileName = ''"></oc-dialog-prompt>
  </div>
</template>
<script>
import FileUpload from './FileUpload.vue'
import FileFilterMenu from './FileFilterMenu.vue'
import SearchBar from 'oc_components/form/SearchBar.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { includes } from 'lodash'
import Mixins from '../mixins'
import OcAppTopBar from 'oc_components/OcAppTopBar.vue'

export default {
  components: {
    OcAppTopBar,
    FileUpload,
    FileFilterMenu,
    SearchBar,
    OcDialogPrompt
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
    ...mapGetters(['getToken', 'extensions']),
    ...mapGetters('Files', ['activeFiles', 'inProgress', 'searchTerm', 'atSearchPage', 'currentFolder', 'davProperties']),
    ...mapState(['route']),
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
      this.isLoadingSearch = true
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
          this.fileUploadName = ''
          this.addFiles({
            files: [fileInfo]
          })
          this.fileUpload = false
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
      this.fileUpload = false
    },

    onFileProgress (progress) {
      this.fileUpload = true
      this.updateFileProgress(progress)
      let progressTotal = 0
      for (let item of this.inProgress) {
        progressTotal = progressTotal + item.progress
      }
      this.fileUploadProgress = progressTotal / this.inProgress.length
      return this.fileUploadProgress
    },
    getRoutes () {
      this.breadcrumbs = []
      let breadcrumb = {}
      let absolutePath = this.$route.params.item
      let pathSplit = absolutePath.split('/').filter((val) => val)
      if (!includes(pathSplit, 'home')) {
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
  }
}
</script>
