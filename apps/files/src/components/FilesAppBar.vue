<template>
  <div id="files-app-bar" class="oc-app-bar">
    <file-drop v-if="!isIE11()" :rootPath='item' :path='currentPath' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress" />
    <oc-grid flex gutter="small">
      <div class="uk-width-expand">
        <div class="uk-flex">
          <oc-breadcrumb id="files-breadcrumb" :items="breadcrumbs" v-if="showBreadcrumb" home></oc-breadcrumb>
        </div>
        <span class="uk-flex uk-flex-middle" v-if="!showBreadcrumb">
          <oc-icon v-if="pageIcon" :name="pageIcon" class="uk-margin-small-right" />
          <h1 class="oc-page-title" v-text="pageTitle" />
        </span>
        <span v-else-if="showBreadcrumb">
          <h1 class="oc-visually-hidden" v-text="pageTitle" />
        </span>
      </div>
      <div v-if="!publicPage()" class="uk-width-auto uk-visible@m">
        <oc-search-bar
          @search="onFileSearch"
          :value="searchTerm"
          :label="$_searchLabel"
          :loading="isLoadingSearch"
          :buttonHidden="true"
          :button="false"
          @clear="onSearchClear"
          :key="searchBarKey"
          ref="globalSearchBar"
        />
      </div>
      <div class="uk-width-auto">
        <div class="uk-button-group" :key="actionsKey">
          <template v-if="$_ocFilesAppBar_showActions">
            <oc-button v-if="canUpload && hasFreeSpace" variation="primary" id="new-file-menu-btn"><translate>+ New</translate></oc-button>
            <oc-button v-else disabled id="new-file-menu-btn" :uk-tooltip="_cannotCreateDialogText"><translate>+ New</translate></oc-button>
            <oc-drop drop-id="new-file-menu-drop" toggle="#new-file-menu-btn" mode="click" closeOnClick>
              <oc-nav>
                <file-upload :path='currentPath' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress"></file-upload>
                <folder-upload v-if="!isIE11()" :rootPath='item' :path='currentPath' :headers="headers" @success="onFileSuccess" @error="onFileError" @progress="onFileProgress"></folder-upload>
                <oc-nav-item @click="showCreateFolderDialog" id="new-folder-btn" icon="create_new_folder"><translate>New folder…</translate></oc-nav-item>
                <oc-nav-item v-for="(newFileHandler, key) in newFileHandlers"
                  :key="key"
                  @click="showCreateFileDialog(newFileHandler.ext, newFileHandler.action)"
                  :class="'new-file-btn-' + newFileHandler.ext"
                  icon="save"
                >{{ newFileHandler.menuTitle($gettext) }}</oc-nav-item>
              </oc-nav>
            </oc-drop>
          </template>
          <template v-if="$route.name === 'files-trashbin'">
            <oc-button v-if="selectedFiles.length > 0" icon="restore" @click="$_ocTrashbin_restoreFiles()">
              <translate>Restore selected</translate>
            </oc-button>
            <oc-button id="delete-selected-btn" icon="delete" @click="selectedFiles.length < 1 ? $_ocTrashbin_empty() : $_ocTrashbin_deleteSelected()">
              {{ $_ocAppBar_clearTrashbinButtonText }}
            </oc-button>
          </template>
          <template v-if="$route.meta.hasBulkActions && selectedFiles.length > 0">
            <oc-button id="delete-selected-btn" icon="delete" @click="$_ocFiles_deleteSelected()">
              <translate>Delete selected</translate>
            </oc-button>
          </template>
          <oc-button v-if="!publicPage()" class="uk-hidden@m" icon="search" aria-label="search" id="files-open-search-btn" @click="focusMobileSearchInput()"/>
          <oc-drop toggle="#files-open-search-btn" boundary="#files-app-bar" pos="bottom-right" mode="click" class="uk-margin-remove">
            <oc-search-bar
              ref="mobileSearch"
              @search="onFileSearch"
              :label="$_searchLabel"
              :loading="isLoadingSearch"
              @clear="onSearchClear"
              :key="searchBarKey"
            />
          </oc-drop>
          <oc-button id="oc-filter-list-btn" icon="filter_list" />
          <file-filter-menu />
        </div>
      </div>
    </oc-grid>
    <oc-dialog-prompt
      name="overwrite-dialog"
      :oc-active="overwriteDialogMessage !== null"
      :oc-has-input="false"
      ocCancelId="files-overwrite-cancel"
      ocConfirmId="files-overwrite-confirm"
      :ocTitle="overwriteDialogTitle"
      :oc-content="overwriteDialogMessage"
      @oc-confirm="$_ocUpload_confirmOverwrite(true)"
      @oc-cancel="$_ocUpload_confirmOverwrite(false)"
    />
    <oc-dialog-prompt
      name="new-folder-dialog"
      :oc-active="createFolder"
      v-model="newFolderName"
      ocInputId="new-folder-input"
      ocConfirmId="new-folder-ok"
      :ocLoading="fileFolderCreationLoading"
      :ocError="newFolderErrorMessage"
      :ocTitle="$_createFolderDialogTitle"
      :ocInputPlaceholder="$_createFolderDialogPlaceholder"
      :ocInputLabel="$_createFolderDialogLabel"
      @oc-confirm="addNewFolder"
      @oc-cancel="createFolder = false"
    />
    <oc-dialog-prompt
      name="new-file-dialog"
      :oc-active="createFile"
      v-model="newFileName"
      :ocLoading="fileFolderCreationLoading"
      :ocError="newFileErrorMessage"
      :ocTitle="$_createFileDialogTitle"
      :ocInputPlaceholder="$_createFileDialogPlaceholder"
      :ocInputLabel="$_createFileDialogLabel"
      @oc-confirm="addNewFile"
      @oc-cancel="createFile = false"
    />
  </div>
</template>

<script>
import FileUpload from './FileUpload.vue'
import FolderUpload from './FolderUpload.vue'
import FileFilterMenu from './FileFilterMenu.vue'
import OcDialogPrompt from './ocDialogPrompt.vue'
import FileDrop from './FileDrop.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import Mixins from '../mixins'
import FileActions from '../fileactions'
import join from 'join-path'

export default {
  components: {
    FileUpload,
    FolderUpload,
    OcDialogPrompt,
    FileFilterMenu,
    FileDrop
  },
  mixins: [
    Mixins,
    FileActions
  ],
  data: () => ({
    createFolder: false,
    isLoadingSearch: false,
    newFolderName: '',
    newFileName: '',
    createFile: false,
    newFileAction: null,
    path: '',
    searchedFiles: [],
    fileFolderCreationLoading: false,
    actionsKey: Math.floor(Math.random() * 20),
    // In case of change of search value to empty string
    // searchBarKey can be changed to force re-render of the component
    searchBarKey: 0
  }),
  computed: {
    ...mapGetters(['getToken', 'configuration', 'newFileHandlers']),
    ...mapGetters('Files', ['activeFiles', 'inProgress', 'searchTerm', 'atSearchPage', 'currentFolder', 'davProperties', 'quota', 'selectedFiles', 'overwriteDialogTitle', 'overwriteDialogMessage', 'publicLinkPassword']),
    ...mapState(['route']),
    $_searchLabel () {
      return this.$gettext('Search')
    },
    $_createFolderDialogPlaceholder () {
      return this.$gettext('Enter new folder name…')
    },
    $_createFolderDialogLabel () {
      return this.$gettext('Folder name')
    },
    $_createFolderDialogTitle () {
      return this.$gettext('New folder…')
    },
    $_createFileDialogPlaceholder () {
      return this.$gettext('Enter new file name…')
    },
    $_createFileDialogLabel () {
      return this.$gettext('File name')
    },
    $_createFileDialogTitle () {
      return this.$gettext('New file…')
    },
    _cannotCreateDialogText () {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to upload!')
      }
      if (!this.hasFreeSpace) {
        return this.$gettext('You have not enough space left to upload!')
      }
      return null
    },
    item () {
      return this.$route.params.item === undefined ? (this.configuration.rootFolder !== '/' ? `${this.configuration.rootFolder}/` : '/') : this.$route.params.item + '/'
    },
    currentPath () {
      return this.item === '/' ? '' : this.item
    },
    newFolderErrorMessage () {
      return this.checkNewFolderName(this.newFolderName)
    },
    newFileErrorMessage () {
      return this.checkNewFileName(this.newFileName)
    },
    headers () {
      if (this.publicPage()) {
        const password = this.publicLinkPassword

        if (password) {
          return { Authorization: 'Basic ' + Buffer.from('public:' + password).toString('base64') }
        }

        return {}
      }
      return {
        Authorization: 'Bearer ' + this.getToken
      }
    },
    canUpload () {
      if (this.currentFolder === null) {
        return false
      }
      return this.currentFolder.canUpload()
    },
    $_ocFilesAppBar_showActions () {
      return this.$route.meta.hideFilelistActions !== true
    },

    $_ocAppBar_clearTrashbinButtonText () {
      return this.selectedFiles.length < 1 ? this.$gettext('Clear trash bin') : this.$gettext('Delete selected')
    },

    showBreadcrumb () {
      return (this.$route.name === 'public-files' || this.$route.name === 'files-list')
    },
    pageIcon () {
      return this.$route.meta.pageIcon
    },
    pageTitle () {
      const title = this.route.meta.pageTitle
      return this.$gettext(title)
    },

    breadcrumbs () {
      let breadcrumbs = [{
        index: 0,
        text: this.$gettext('Home'),
        to: '/files/list'
      }]

      if (!this.currentFolder) return breadcrumbs

      const rootFolder = this.configuration.rootFolder
      let baseUrl = '/files/list/'

      const pathSplit = this.currentFolder.path
        ? this.currentFolder.path.split('/').filter((val) => {
          if (rootFolder === '/') return val

          return val !== rootFolder
        })
        : []

      if (rootFolder && rootFolder !== '/') {
        pathSplit.splice(0, 1)
        baseUrl = `/files/list/${rootFolder}%2F`
      }

      let startIndex = 0

      if (this.publicPage()) {
        baseUrl = '/files/public-files/'
        startIndex = 1
        breadcrumbs = [{
          index: 0,
          text: this.$gettext('Home'),
          to: baseUrl + pathSplit[0]
        }]
      }

      for (let i = startIndex; i < pathSplit.length; i++) {
        let clickHandler = null
        let itemPath = baseUrl + encodeURIComponent(pathSplit.slice(0, i + 1).join('/'))
        if (i === pathSplit.length - 1) {
          itemPath = null
          clickHandler = () => this.$router.go()
        }

        breadcrumbs.push({
          index: i,
          text: pathSplit.slice(0, i + 1)[i],
          to: itemPath,
          onClick: clickHandler
        })
      }

      return breadcrumbs
    },

    hasFreeSpace () {
      return (this.quota && this.quota.free > 0) ||
        (this.currentFolder && this.currentFolder.permissions.indexOf('M') >= 0) ||
        this.publicPage()
    }
  },
  watch: {
    // This ensures buttons will display with its right icons, values, etc.
    // TODO: Find a better solution
    $route (to, from) {
      this.actionsKey = Math.floor(Math.random() * 20)
      this.$refs.mobileSearch.value = null
      this.$refs.globalSearchBar.query = ''
    }
  },
  methods: {
    ...mapActions('Files', ['resetFileSelection', 'loadFiles', 'addFiles', 'updateFileProgress', 'searchForFile',
      'loadFolder', 'setTrashbinDeleteMessage', 'removeFilesFromTrashbin', 'setFilterTerm', 'resetSearch']),
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
      })
        .catch(e => {
          this.showMessage({
            title: this.$gettext('Search failed'),
            desc: e.message,
            status: 'danger'
          })
        })
        .finally(() => {
          this.isLoadingSearch = false
        })
    },
    focusMobileSearchInput () {
      this.$refs.mobileSearch.$el.querySelector('input').focus()
      // nested vuetify VList animation will block native autofocus, so we use this workaround...

      setTimeout(() => {
        // ...to set focus after the element is rendered visible
        this.$refs.mobileSearch.$el.querySelector('input').focus()
      }, 50)
    },
    $_ocFilesFolder_getFolder () {
      this.path = []

      const absolutePath = this.$route.params.item === '' || this.$route.params.item === undefined ? this.configuration.rootFolder : this.route.params.item

      this.loadFolder({
        client: this.$client,
        absolutePath: absolutePath,
        $gettext: this.$gettext,
        routeName: this.$route.name
      }).catch((error) => {
        // TODO: 401 public link handling necessary???
        this.showMessage({
          title: this.$gettext('Loading folder failed…'),
          desc: error.message,
          status: 'danger'
        })
      })
    },
    showCreateFolderDialog () {
      this.createFolder = true
      this.newFolderName = this.$gettext('New folder')
    },
    addNewFolder (folderName) {
      if (folderName !== '') {
        this.fileFolderCreationLoading = true
        const path = this.item === '' ? (this.configuration.rootFolder ? `${this.configuration.rootFolder}/` : '/') : `${this.item}/`
        let p = this.$client.files.createFolder(path + folderName)
        if (this.publicPage()) {
          p = this.$client.publicFiles.createFolder(path + folderName, null, this.publicLinkPassword)
        }

        p.then(() => {
          this.createFolder = false
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
      if (folderName === '') {
        return this.$gettext('Folder name cannot be empty')
      }

      if (/[/]/.test(folderName)) {
        return this.$gettext('Folder name cannot contain "/"')
      }

      if (folderName === '.') {
        return this.$gettext('Folder name cannot be equal to "."')
      }

      if (folderName === '..') {
        return this.$gettext('Folder name cannot be equal to ".."')
      }

      if (/\s+$/.test(folderName)) {
        return this.$gettext('Folder name cannot end with whitespace')
      }

      const exists = this.activeFiles.find(file => file.name === folderName)

      if (exists) {
        const translated = this.$gettext('%{name} already exists')
        return this.$gettextInterpolate(translated, { name: folderName }, true)
      }

      return null
    },
    showCreateFileDialog (ext = 'txt', openAction = null) {
      this.createFile = true
      this.newFileAction = openAction
      this.newFileName = this.$gettext('New file') + '.' + ext
    },
    addNewFile (fileName) {
      if (fileName !== '') {
        this.fileFolderCreationLoading = true
        const path = this.item === '' ? (this.configuration.rootFolder ? `${this.configuration.rootFolder}/` : '/') : `${this.item}/`
        let p = this.$client.files.putFileContents(path + fileName, '')
        if (this.publicPage()) {
          p = this.$client.publicFiles.putFileContents(path + fileName, null, this.publicLinkPassword, '')
        }
        p.then(() => {
          this.createFile = false
          this.$_ocFilesFolder_getFolder()
          this.fileFolderCreationLoading = false
          if (this.newFileAction) {
            // not cool - needs refactoring
            this.$nextTick(() => {
              this.openFile({
                filePath: path + fileName
              })
              this.openFileAction(this.newFileAction, path + fileName)
            })
          }
        })
          .catch(error => {
            this.fileFolderCreationLoading = false
            this.showMessage({
              title: this.$gettext('Creating file failed…'),
              desc: error,
              status: 'danger'
            })
          })
      }
    },
    checkNewFileName (fileName) {
      if (fileName === '') {
        return this.$gettext('File name cannot be empty')
      }

      if (/[/]/.test(fileName)) {
        return this.$gettext('File name cannot contain "/"')
      }

      if (fileName === '.') {
        return this.$gettext('File name cannot be equal to "."')
      }

      if (fileName === '..') {
        return this.$gettext('File name cannot be equal to ".."')
      }

      if (/\s+$/.test(fileName)) {
        return this.$gettext('File name cannot end with whitespace')
      }

      const exists = this.activeFiles.find(file => file.name === fileName)

      if (exists) {
        const translated = this.$gettext('%{name} already exists')
        return this.$gettextInterpolate(translated, { name: fileName }, true)
      }

      return null
    },
    onFileSuccess (event, file) {
      if (file.name) {
        file = file.name
      }
      this.$nextTick().then(() => {
        const path = this.item === '' ? (this.configuration.rootFolder ? `${this.configuration.rootFolder}/` : '/') : `${this.item}/`
        const filePath = join(path + file)
        if (this.publicPage()) {
          this.$client.publicFiles.list(filePath, this.publicLinkPassword, this.davProperties, '0').then(files => {
            this.addFiles({
              files: files
            })
          }).catch(() => {
            this.$_ocFilesFolder_getFolder()
          })
        } else {
          this.$client.files.fileInfo(filePath, this.davProperties).then(fileInfo => {
            this.addFiles({
              files: [fileInfo]
            })
          }).catch(() => {
            this.$_ocFilesFolder_getFolder()
          })
        }
      })
    },

    onFileError (error) {
      this.showMessage({
        title: this.$gettext('File upload failed…'),
        desc: error.message,
        status: 'danger'
      })
    },

    onFileProgress (progress) {
      this.updateFileProgress(progress)
    },

    $_ocTrashbin_deleteSelected () {
      const translated = this.$gettext('%{numberOfFiles} items will be deleted immediately. You can’t undo this action.')
      this.setTrashbinDeleteMessage(this.$gettextInterpolate(translated, { numberOfFiles: this.selectedFiles.length }, true))
    },

    $_ocFiles_deleteSelected () {
      const translated = this.$gettext('%{numberOfFiles} items will be deleted.')
      this.promptFileDelete({
        message: this.$gettextInterpolate(translated, { numberOfFiles: this.selectedFiles.length }, true),
        items: this.selectedFiles
      })
    },

    $_ocTrashbin_empty () {
      this.$client.fileTrash.clearTrashBin()
        .then(() => {
          this.showMessage({
            title: this.$gettext('Trash bin was successfully emptied')
          })
          this.removeFilesFromTrashbin(this.activeFiles)
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext("Trash bin couldn't be emptied"),
            desc: error.message,
            status: 'danger'
          })
        })
    },

    $_ocTrashbin_restoreFiles (files = this.selectedFiles) {
      for (const file of files) {
        this.$client.fileTrash.restore(file.id, file.originalLocation)
          .then(() => {
            const translated = this.$gettext('%{file} was restored successfully')
            this.showMessage({
              title: this.$gettextInterpolate(translated, { file: file.name }, true)
            })
            this.removeFilesFromTrashbin([file])
          })
          .catch(error => {
            const translated = this.$gettext('Restoration of %{file} failed')
            this.showMessage({
              title: this.$gettextInterpolate(translated, { file: file.name }, true),
              desc: error.message,
              status: 'danger'
            })
          })
      }
      this.resetFileSelection()
      this.setHighlightedFile(null)
    },

    onSearchClear () {
      this.resetSearch()
      // Forces update of search bar
      this.searchBarKey++
    }
  }
}
</script>
