<template>
  <div id="files-app-bar" class="oc-app-bar">
    <file-drop :url='url' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress" />
    <oc-grid flex gutter="small">
      <div class="uk-width-expand">
        <oc-breadcrumb id="files-breadcrumb" :items="breadcrumbs" v-if="!atSearchPage" home></oc-breadcrumb>
      </div>
      <div class="uk-width-auto uk-visible@m">
        <span class="uk-text-meta"><translate :translate-n="activeFiles.length" translate-plural="%{ activeFiles.length } Results">%{ activeFiles.length } Result</translate></span>
      </div>
      <div class="uk-width-auto uk-visible@m">
        <oc-search-bar @search="onFileSearch" :value="searchTerm" :label="searchLabel" :loading="isLoadingSearch" :button="false"/>
      </div>
      <div class="uk-width-auto">
        <template v-if="$route.name === 'files-trashbin'">
          <oc-button v-if="selectedFiles.length > 0" icon="restore" @click="$_ocTrashbin_restoreFiles()">
            <translate>Restore selected</translate>
          </oc-button>
          <oc-button icon="delete" @click="selectedFiles.length < 1 ? $_ocTrashbin_empty() : $_ocTrashbin_deleteSelected()">
            {{ $_ocAppBar_clearTrashbinButtonText }}
          </oc-button>
        </template>
        <div class="uk-button-group" v-if="$_ocFilesApp_showActions">
          <oc-button v-if="canUpload" variation="primary" id="new-file-menu-btn"><translate>+ New</translate></oc-button>
          <oc-button v-else disabled id="new-file-menu-btn" :uk-tooltip="_cannotCreateDialogText"><translate>+ New</translate></oc-button>
          <oc-button class="uk-hidden@m" icon="search" aria-label="search" id="files-open-search-btn"></oc-button>
          <oc-button id="oc-filter-list-btn" icon="filter_list" />
        </div>
        <file-filter-menu />
        <oc-drop toggle="#files-open-search-btn" boundary="#files-app-bar" pos="bottom-right" mode="click" class="uk-margin-remove uk-width-large">
          <oc-search-bar @search="onFileSearch" :value="searchTerm" :label="searchLabel" :loading="isLoadingSearch" />
        </oc-drop>
        <oc-drop toggle="#new-file-menu-btn" mode="click">
          <oc-nav>
            <file-upload :url='url' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress"></file-upload>
            <oc-nav-item @click="createFolder = true" id="new-folder-btn" icon="create_new_folder"><translate>Create new folder…</translate></oc-nav-item>
            <oc-nav-item @click="createFile = true" id="new-file-btn" icon="save"><translate>Create new file…</translate></oc-nav-item>
          </oc-nav>
        </oc-drop>
      </div>
      <div v-show="fileUpload" class="uk-width-auto">
        <oc-progress-pie id="oc-progress-pie" :progress="this.fileUploadProgress | roundNumber" :max="100" show-label />
        <oc-drop toggle="#oc-progress-pie" mode="click">
          <oc-upload-menu :items="inProgress" />
        </oc-drop>
      </div>
    </oc-grid>
    <oc-dialog-prompt name="new-folder-dialog" :oc-active="createFolder" v-model="newFolderName" ocInputId="new-folder-input" ocConfirmId="new-folder-ok" :ocLoading="fileFolderCreationLoading" :ocError="newFolderErrorMessage" :ocTitle="_createFolderDialogTitle" @oc-confirm="addNewFolder" @oc-cancel="createFolder = false; newFolderName = ''"></oc-dialog-prompt>
    <oc-dialog-prompt name="new-file-dialog" :oc-active="createFile" v-model="newFileName" :ocLoading="fileFolderCreationLoading" :ocError="newFileErrorMessage" :ocTitle="_createFileDialogTitle" @oc-confirm="addNewFile" @oc-cancel="createFile = false; newFileName = ''"></oc-dialog-prompt>
  </div>
</template>

<script>
import FileUpload from './FileUpload.vue'
import FileFilterMenu from './FileFilterMenu.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
import FileDrop from './FileDrop.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import Mixins from '../mixins'

export default {
  components: {
    FileUpload,
    OcDialogPrompt,
    FileFilterMenu,
    FileDrop
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
    ...mapGetters('Files', ['activeFiles', 'inProgress', 'searchTerm', 'atSearchPage', 'currentFolder', 'davProperties', 'freeSpace', 'selectedFiles']),
    ...mapState(['route']),
    searchLabel () {
      return this.$gettext('Search')
    },
    _createFolderDialogTitle () {
      return this.$gettext('Create new folder…')
    },
    _createFileDialogTitle () {
      return this.$gettext('Create new file…')
    },
    _cannotCreateDialogText () {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to upload!')
      }
      if (!this.freeSpace) {
        return this.$gettext('You have not enough space left to upload!')
      }
      return null
    },
    item () {
      return this.$route.params.item === undefined ? '' : this.$route.params.item
    },
    url () {
      const path = this.item === '' ? '/' : `${this.item}/`
      return this.$client.files.getFileUrl(`/${path}`)
    },
    newFolderErrorMessage () {
      return this.checkNewFolderName(this.newFolderName)
    },
    newFileErrorMessage () {
      return this.checkNewFileName(this.newFileName)
    },
    headers () {
      return {
        // will trigger 412 precondition failed if a file already exists
        'If-None-Match': '*',
        'Authorization': 'Bearer ' + this.getToken
      }
    },
    canUpload () {
      if (this.currentFolder === null) {
        return false
      }
      return this.currentFolder.canUpload()
    },

    $_ocFilesApp_showActions () {
      return this.$route.meta.hideFilelistActions !== true
    },

    $_ocAppBar_clearTrashbinButtonText () {
      return this.selectedFiles.length < 1 ? this.$gettext('Clear trash bin') : this.$gettext('Delete selected')
    },

    breadcrumbs () {
      let breadcrumbs = [{
        index: 0,
        text: this.$gettext('Home'),
        to: '/files/list'
      }]

      if (this.$route.params.item) {
        let absolutePath = this.$route.params.item
        const pathSplit = absolutePath.split('/').filter((val) => val)
        for (let i = 0; i < pathSplit.length; i++) {
          breadcrumbs.push({
            index: i,
            text: pathSplit.slice(0, i + 1)[i],
            to: '/files/list/' + encodeURIComponent(pathSplit.slice(0, i + 1).join('/'))
          })
        }
      }
      return breadcrumbs
    }
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'loadFiles', 'addFiles', 'updateFileProgress', 'searchForFile', 'loadFolder', 'setTrashbinDeleteMessage', 'removeFilesFromTrashbin']),
    ...mapActions(['openFile', 'showMessage']),
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
    $_ocFilesFolder_getFolder () {
      this.path = []
      this.loadFolder({
        client: this.$client,
        absolutePath: this.$route.params.item === '' ? '/' : this.route.params.item,
        $gettext: this.$gettext
      })
    },
    addNewFolder (folderName) {
      if (folderName !== '') {
        this.fileFolderCreationLoading = true
        const path = this.item === '' ? '/' : `${this.item}/`
        this.$client.files.createFolder(path + folderName)
          .then(() => {
            this.createFolder = false
            this.newFolderName = ''
            this.$_ocFilesFolder_getFolder()
          })
          .catch(error => {
            this.showMessage({
              title: this.$gettext('Creating folder failed…'),
              desc: error,
              status: 'danger'
            })
          })
          .finally(() => {
            this.fileFolderCreationLoading = false
          })
      }
    },
    checkNewFolderName (folderName) {
      if (/[/]/.test(folderName)) {
        return this.$gettext('Folder name cannot contain "/"')
      }

      if (folderName === '.') {
        return this.$gettext('Folder name cannot be equal to "."')
      }

      if (folderName === '..') {
        return this.$gettext('Folder name cannot be equal to ".."')
      }

      return null
    },
    addNewFile (fileName) {
      if (fileName !== '') {
        this.fileFolderCreationLoading = true
        const path = this.item === '' ? '/' : `${this.item}/`
        this.$client.files.putFileContents(path + fileName, '')
          .then(() => {
            this.createFile = false
            this.newFileName = ''
            this.$_ocFilesFolder_getFolder()
          })
          .catch(error => {
            this.showMessage({
              title: this.$gettext('Creating file failed…'),
              desc: error,
              status: 'danger'
            })
          })
          .finally(() => {
            this.fileFolderCreationLoading = false
          })
      }
    },
    checkNewFileName (fileName) {
      if (/[/]/.test(fileName)) {
        return this.$gettext('File name cannot contain "/"')
      }

      if (fileName === '.') {
        return this.$gettext('File name cannot be equal to "."')
      }

      if (fileName === '..') {
        return this.$gettext('File name cannot be equal to ".."')
      }

      return null
    },
    onFileSuccess (event, file) {
      this.$nextTick().then(() => {
        const path = this.item === '' ? '/' : `${this.item}/`
        const filePath = path + file.name
        this.$client.files.fileInfo(filePath, this.davProperties).then(fileInfo => {
          this.fileUploadProgress = 0
          this.addFiles({
            files: [fileInfo]
          })
          this.fileUpload = false
        }).catch(() => {
          this.fileUploadProgress = 0
          this.$_ocFilesFolder_getFolder()
        })
      })
    },

    onFileError (error) {
      this.fileUploadProgress = 0
      this.showMessage({
        title: this.$gettext('File upload failed…'),
        desc: error.message,
        status: 'danger'
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

    $_ocTrashbin_deleteSelected () {
      let translated = this.$gettext('%{numberOfFiles} items will be deleted immediately. You can’t undo this action.')
      this.setTrashbinDeleteMessage(this.$gettextInterpolate(translated, { numberOfFiles: this.selectedFiles.length }, true))
    },

    $_ocTrashbin_empty () {
      this.$client.fileTrash.clearTrashBin()
        .then(() => {
          this.showNotification({
            title: this.$gettext('Trash bin was successfully emtied')
          })
          this.removeFilesFromTrashbin(this.activeFiles)
        })
        .catch((error) => {
          this.showNotification({
            title: this.$gettext("Trash bin couldn't be emptied"),
            desc: error.message,
            status: 'danger'
          })
        })
    },

    $_ocTrashbin_restoreFiles (files = this.selectedFiles) {
      for (let file of files) {
        this.$client.fileTrash.restore(file.id, file.originalLocation)
          .then(() => {
            let translated = this.$gettext('%{file} was succesfully restored')
            this.showNotification({
              title: this.$gettextInterpolate(translated, { file: file.name }, true)
            })
            this.removeFilesFromTrashbin([file])
          })
          .catch(error => {
            let translated = this.$gettext('Restoration of %{file} failed')
            this.showNotification({
              title: this.$gettextInterpolate(translated, { file: file.name }, true),
              desc: error.message,
              status: 'danger'
            })
          })
      }
      this.resetFileSelection()
    }
  },
  filters: {
    roundNumber (value) {
      return parseInt(value.toFixed(0))
    }
  }
}
</script>
