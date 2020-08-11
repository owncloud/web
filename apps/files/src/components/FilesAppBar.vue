<template>
  <div id="files-app-bar" class="oc-app-bar">
    <file-drop
      v-if="!isIE11() && canUpload && hasFreeSpace"
      :root-path="item"
      :path="currentPath"
      :headers="headers"
      @success="onFileSuccess"
      @error="onFileError"
      @progress="onFileProgress"
    />
    <oc-grid flex gutter="small">
      <div>
        <div class="uk-flex">
          <oc-breadcrumb
            v-if="showBreadcrumb"
            id="files-breadcrumb"
            :items="breadcrumbs"
            home
          ></oc-breadcrumb>
        </div>
        <span v-if="!showBreadcrumb" class="uk-flex uk-flex-middle">
          <oc-icon v-if="pageIcon" :name="pageIcon" class="uk-margin-small-right" />
          <h1 class="oc-page-title" v-text="pageTitle" />
        </span>
        <span v-else-if="showBreadcrumb">
          <h1 class="oc-visually-hidden" v-text="pageTitle" />
        </span>
      </div>
      <div>
        <template v-if="$_ocFilesAppBar_showActions">
          <template v-if="canUpload && hasFreeSpace">
            <oc-button
              id="new-file-menu-btn"
              key="new-file-menu-btn-enabled"
              variation="primary"
              icon="add"
              ><translate>New</translate></oc-button
            >
            <oc-drop
              drop-id="new-file-menu-drop"
              toggle="#new-file-menu-btn"
              mode="click"
              close-on-click
              :options="{ delayHide: 0 }"
            >
              <oc-nav>
                <file-upload
                  :path="currentPath"
                  :headers="headers"
                  @success="onFileSuccess"
                  @error="onFileError"
                  @progress="onFileProgress"
                ></file-upload>
                <folder-upload
                  v-if="!isIE11()"
                  :root-path="item"
                  :path="currentPath"
                  :headers="headers"
                  @success="onFileSuccess"
                  @error="onFileError"
                  @progress="onFileProgress"
                ></folder-upload>
                <oc-nav-item
                  id="new-folder-btn"
                  icon="create_new_folder"
                  @click="showCreateResourceModal"
                  ><translate>New folder…</translate></oc-nav-item
                >
                <oc-nav-item
                  v-for="(newFileHandler, key) in newFileHandlers"
                  :key="key"
                  :class="'new-file-btn-' + newFileHandler.ext"
                  icon="save"
                  @click="showCreateResourceModal(false, newFileHandler.ext, newFileHandler.action)"
                  >{{ newFileHandler.menuTitle($gettext) }}</oc-nav-item
                >
              </oc-nav>
            </oc-drop>
          </template>
          <!-- FIXME: Unite new file menu btn -->
          <oc-button
            v-else
            id="new-file-menu-btn"
            key="new-file-menu-btn-disabled"
            disabled
            :uk-tooltip="_cannotCreateDialogText"
            ><translate>+ New</translate></oc-button
          >
        </template>
        <template v-if="$route.name === 'files-trashbin'">
          <oc-button
            v-if="selectedFiles.length > 0"
            key="restore-btn"
            icon="restore"
            @click="$_ocTrashbin_restoreFiles()"
          >
            <translate>Restore selected</translate>
          </oc-button>
          <oc-button
            id="delete-selected-btn"
            key="delete-btn"
            icon="delete"
            :disabled="files.length === 0"
            @click="
              selectedFiles.length < 1 ? $_ocTrashbin_empty() : $_deleteResources_displayDialog()
            "
          >
            {{ $_ocAppBar_clearTrashbinButtonText }}
          </oc-button>
        </template>
      </div>
      <oc-grid v-if="displayBulkActions" gutter="small">
        <div>
          <oc-button
            id="delete-selected-btn"
            key="delete-selected-btn"
            icon="delete"
            @click="$_deleteResources_displayDialog()"
          >
            <translate>Delete selected</translate>
          </oc-button>
        </div>
        <div>
          <oc-button
            id="move-selected-btn"
            key="move-selected-btn"
            icon="folder-move"
            :disabled="!canMove"
            @click.native="triggerLocationPicker('move')"
          >
            <translate>Move selected</translate>
          </oc-button>
        </div>
        <div>
          <oc-button
            id="copy-selected-btn"
            key="copy-selected-btn"
            icon="file_copy"
            :disabled="!canCopy"
            @click.native="triggerLocationPicker('copy')"
          >
            <translate>Copy selected</translate>
          </oc-button>
        </div>
      </oc-grid>
    </oc-grid>
  </div>
</template>

<script>
import FileUpload from './FileUpload.vue'
import FolderUpload from './FolderUpload.vue'
import FileDrop from './FileDrop.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import Mixins from '../mixins'
import FileActions from '../fileactions'
import MixinDeleteResources from '../mixins/deleteResources'
import pathUtil from 'path'
import { canBeMoved } from '../helpers/permissions'
import { cloneStateObject } from '../helpers/store'

export default {
  components: {
    FileUpload,
    FolderUpload,
    FileDrop
  },
  mixins: [Mixins, FileActions, MixinDeleteResources],
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters(['getToken', 'configuration', 'newFileHandlers']),
    ...mapGetters('Files', [
      'activeFiles',
      'inProgress',
      'currentFolder',
      'davProperties',
      'quota',
      'selectedFiles',
      'publicLinkPassword'
    ]),
    ...mapState(['route']),

    _cannotCreateDialogText() {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to upload!')
      }
      if (!this.hasFreeSpace) {
        return this.$gettext('You have not enough space left to upload!')
      }
      return null
    },
    item() {
      return this.$route.params.item === undefined
        ? this.configuration.rootFolder !== '/'
          ? `${this.configuration.rootFolder}/`
          : '/'
        : this.$route.params.item + '/'
    },
    currentPath() {
      return this.item === '/' ? '' : this.item
    },
    headers() {
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
    canUpload() {
      if (this.currentFolder === null) {
        return false
      }
      return this.currentFolder.canUpload()
    },
    $_ocFilesAppBar_showActions() {
      return this.$route.meta.hideFilelistActions !== true
    },

    $_ocAppBar_clearTrashbinButtonText() {
      return this.selectedFiles.length < 1
        ? this.$gettext('Empty trash bin')
        : this.$gettext('Delete selected')
    },

    showBreadcrumb() {
      return this.$route.name === 'public-files' || this.$route.name === 'files-list'
    },
    pageIcon() {
      return this.$route.meta.pageIcon
    },
    pageTitle() {
      const title = this.route.meta.pageTitle
      return this.$gettext(title)
    },

    breadcrumbs() {
      let breadcrumbs = [
        {
          index: 0,
          text: this.$gettext('Home'),
          to: '/files/list'
        }
      ]

      if (!this.currentFolder) return breadcrumbs

      const rootFolder = this.configuration.rootFolder
      let baseUrl = '/files/list/'

      const pathSplit = this.currentFolder.path
        ? this.currentFolder.path.split('/').filter(val => {
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
        breadcrumbs = [
          {
            index: 0,
            text: this.$gettext('Home'),
            to: baseUrl + pathSplit[0]
          }
        ]
      }

      for (let i = startIndex; i < pathSplit.length; i++) {
        let itemPath =
          baseUrl + encodeURIComponent(pathUtil.join.apply(null, pathSplit.slice(0, i + 1)))
        if (i === pathSplit.length - 1) {
          itemPath = null
        }

        breadcrumbs.push({
          index: i,
          text: pathSplit.slice(0, i + 1)[i],
          to: itemPath
        })
      }

      return breadcrumbs
    },

    hasFreeSpace() {
      return (
        !this.quota ||
        this.quota.free > 0 ||
        (this.currentFolder &&
          this.currentFolder.permissions &&
          this.currentFolder.permissions.indexOf('M') >= 0) ||
        this.publicPage()
      )
    },

    displayBulkActions() {
      return this.$route.meta.hasBulkActions && this.selectedFiles.length > 0
    },

    canMove() {
      const insufficientPermissions = this.selectedFiles.some(resource => {
        return canBeMoved(resource, this.currentFolder.path) === false
      })

      return insufficientPermissions === false
    },

    canCopy() {
      if (this.publicPage()) {
        return this.currentFolder.canCreate()
      }

      return true
    }
  },
  methods: {
    ...mapActions('Files', [
      'resetFileSelection',
      'loadFiles',
      'addFiles',
      'updateFileProgress',
      'loadFolder',
      'removeFilesFromTrashbin'
    ]),
    ...mapActions(['openFile', 'showMessage', 'createModal', 'setModalInputErrorMessage']),

    $_ocFilesFolder_getFolder() {
      this.path = []

      const absolutePath =
        this.$route.params.item === '' || this.$route.params.item === undefined
          ? this.configuration.rootFolder
          : this.route.params.item

      this.loadFolder({
        client: this.$client,
        absolutePath: absolutePath,
        $gettext: this.$gettext,
        routeName: this.$route.name
      }).catch(error => {
        // TODO: 401 public link handling necessary???
        this.showMessage({
          title: this.$gettext('Loading folder failed…'),
          desc: error.message,
          status: 'danger'
        })
      })
    },

    showCreateResourceModal(isFolder = true, ext = 'txt', openAction = null) {
      const defaultName = isFolder
        ? this.$gettext('New folder')
        : this.$gettext('New file') + '.' + ext
      const checkInputValue = value => {
        this.setModalInputErrorMessage(
          isFolder ? this.checkNewFolderName(value) : this.checkNewFileName(value)
        )
      }

      // Sets action to be executed after creation of the file
      if (!isFolder) {
        this.newFileAction = openAction
      }

      const modal = {
        variation: 'info',
        title: isFolder ? this.$gettext('Create a new folder') : this.$gettext('Create a new file'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Create'),
        hasInput: true,
        inputValue: defaultName,
        inputPlaceholder: isFolder
          ? this.$gettext('Enter new folder name…')
          : this.$gettext('Enter new file name…'),
        inputLabel: isFolder ? this.$gettext('Folder name') : this.$gettext('File name'),
        inputError: isFolder
          ? this.checkNewFolderName(defaultName)
          : this.checkNewFileName(defaultName),
        onCancel: this.hideModal,
        onConfirm: isFolder ? this.addNewFolder : this.addNewFile,
        onInput: checkInputValue
      }

      this.createModal(modal)
    },

    addNewFolder(folderName) {
      if (folderName !== '') {
        this.fileFolderCreationLoading = true
        const path =
          this.item === ''
            ? this.configuration.rootFolder
              ? `${this.configuration.rootFolder}/`
              : '/'
            : `${this.item}/`
        let p = this.$client.files.createFolder(path + folderName)
        if (this.publicPage()) {
          p = this.$client.publicFiles.createFolder(
            path + folderName,
            null,
            this.publicLinkPassword
          )
        }

        p.then(() => {
          this.$_ocFilesFolder_getFolder()
          this.hideModal()
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
    checkNewFolderName(folderName) {
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

    addNewFile(fileName) {
      if (fileName !== '') {
        this.fileFolderCreationLoading = true
        const path =
          this.item === ''
            ? this.configuration.rootFolder
              ? `${this.configuration.rootFolder}/`
              : '/'
            : `${this.item}/`
        const filePath = pathUtil.join(path, fileName)
        let p = this.$client.files.putFileContents(filePath, '')
        if (this.publicPage()) {
          p = this.$client.publicFiles.putFileContents(filePath, null, this.publicLinkPassword, '')
        }
        p.then(() => {
          this.$_ocFilesFolder_getFolder()
          this.fileFolderCreationLoading = false
          if (this.newFileAction) {
            // not cool - needs refactoring
            this.$nextTick(() => {
              this.openFile({
                filePath: filePath
              })
              this.openFileAction(this.newFileAction, filePath)
            })
          }

          this.hideModal()
        }).catch(error => {
          this.fileFolderCreationLoading = false
          this.showMessage({
            title: this.$gettext('Creating file failed…'),
            desc: error,
            status: 'danger'
          })
        })
      }
    },
    checkNewFileName(fileName) {
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
    onFileSuccess(event, file) {
      if (file.name) {
        file = file.name
      }
      this.$nextTick().then(() => {
        const path =
          this.item === ''
            ? this.configuration.rootFolder
              ? `${this.configuration.rootFolder}/`
              : '/'
            : `${this.item}/`
        const filePath = pathUtil.join(path, file)
        if (this.publicPage()) {
          this.$client.publicFiles
            .list(filePath, this.publicLinkPassword, this.davProperties, '0')
            .then(files => {
              this.addFiles({
                files: files
              })
            })
            .catch(() => {
              this.$_ocFilesFolder_getFolder()
            })
        } else {
          this.$client.files
            .fileInfo(filePath, this.davProperties)
            .then(fileInfo => {
              this.addFiles({
                files: [fileInfo]
              })
            })
            .catch(() => {
              this.$_ocFilesFolder_getFolder()
            })
        }
      })
    },

    onFileError(error) {
      this.showMessage({
        title: this.$gettext('File upload failed…'),
        desc: error.message,
        status: 'danger'
      })
    },

    onFileProgress(progress) {
      this.updateFileProgress(progress)
    },

    $_ocTrashbin_empty() {
      this.$client.fileTrash
        .clearTrashBin()
        .then(() => {
          this.showMessage({
            title: this.$gettext('Trash bin was successfully emptied')
          })
          this.removeFilesFromTrashbin(this.activeFiles)
        })
        .catch(error => {
          this.showMessage({
            title: this.$gettext("Trash bin couldn't be emptied"),
            desc: error.message,
            status: 'danger'
          })
        })
    },

    $_ocTrashbin_restoreFiles(files = this.selectedFiles) {
      for (const file of files) {
        this.$client.fileTrash
          .restore(file.id, file.originalLocation)
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

    triggerLocationPicker(action) {
      const resources = cloneStateObject(this.selectedFiles)
      const parent = pathUtil.dirname(this.currentFolder.path)

      this.$router.push({
        name: 'location-picker',
        query: {
          action,
          target: parent,
          resource: resources.map(resource => {
            return resource.path
          })
        }
      })
    }
  }
}
</script>
