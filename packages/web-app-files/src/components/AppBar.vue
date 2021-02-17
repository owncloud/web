<template>
  <div class="files-app-bar oc-p-s">
    <file-drop
      v-if="!isIE11() && canUpload && hasFreeSpace"
      :root-path="currentPath"
      :path="currentPath"
      :headers="headers"
      @success="onFileSuccess"
      @error="onFileError"
      @progress="onFileProgress"
    />
    <div>
      <oc-breadcrumb
        v-if="showBreadcrumb"
        id="files-breadcrumb"
        class="oc-mb-s"
        :items="breadcrumbs"
        home
      />
      <div class="uk-flex uk-flex-middle">
        <template v-if="$_ocFilesAppBar_showActions">
          <template v-if="areDefaultActionsVisible">
            <oc-button
              id="new-file-menu-btn"
              key="new-file-menu-btn-enabled"
              variation="primary"
              :uk-tooltip="_cannotCreateDialogText"
              :disabled="isNewBtnDisabled"
            >
              <oc-icon name="add" aria-hidden="true" />
              <translate>New</translate>
            </oc-button>
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
                />
                <folder-upload
                  v-if="!isIE11()"
                  :root-path="currentPath"
                  :path="currentPath"
                  :headers="headers"
                  @success="onFileSuccess"
                  @error="onFileError"
                  @progress="onFileProgress"
                />
                <oc-nav-item
                  id="new-folder-btn"
                  icon="create_new_folder"
                  @click="showCreateResourceModal"
                >
                  <translate>New folder…</translate>
                </oc-nav-item>
                <oc-nav-item
                  v-for="(newFileHandler, key) in newFileHandlers"
                  :key="key"
                  :class="'new-file-btn-' + newFileHandler.ext"
                  :icon="newFileHandler.icon || 'save'"
                  @click="showCreateResourceModal(false, newFileHandler.ext, newFileHandler.action)"
                >
                  {{ newFileHandler.menuTitle($gettext) }}
                </oc-nav-item>
              </oc-nav>
            </oc-drop>
          </template>
        </template>
        <info-selected-resources v-if="selectedFiles.length > 0" class="oc-mr-s uk-visible@l" />
        <batch-actions />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import pathUtil from 'path'
import isEmpty from 'lodash-es/isEmpty'

import Mixins from '../mixins'
import MixinFileActions from '../mixins/fileActions'
import MixinRoutes from '../mixins/routes'
import { buildResource } from '../helpers/resources'

import FileUpload from './FileUpload.vue'
import FolderUpload from './FolderUpload.vue'
import FileDrop from './FileDrop.vue'
import BatchActions from './BatchActions.vue'
import InfoSelectedResources from './InfoSelectedResources.vue'

export default {
  components: {
    FileUpload,
    FolderUpload,
    FileDrop,
    BatchActions,
    InfoSelectedResources
  },
  mixins: [Mixins, MixinFileActions, MixinRoutes],
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
    currentPath() {
      const path = this.$route.params.item || ''
      if (path.endsWith('/')) {
        return path
      }
      return path + '/'
    },
    currentPathSegments() {
      // remove potential leading and trailing slash from current path (so that the resulting array doesn't start with an empty string)
      const s = this.currentPath.replace(/^\/+/, '').replace(/\/+$/, '')
      return isEmpty(s) ? [] : s.split('/')
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

    showBreadcrumb() {
      return this.isPublicFilesRoute || this.isListRoute
    },
    pageIcon() {
      return this.$route.meta.pageIcon
    },
    pageTitle() {
      const title = this.route.meta.pageTitle
      return this.$gettext(title)
    },

    breadcrumbs() {
      const pathSegments = this.currentPathSegments
      const breadcrumbs = []
      let baseUrl
      const pathItems = []
      if (this.isListRoute) {
        baseUrl = '/files/list/personal/'
        pathItems.push('/') // as of now we need to add the url encoded root path `/`, otherwise we'll land in the configured homeFolder
        breadcrumbs.push({
          text: this.$gettext('Home'),
          to: baseUrl + encodeURIComponent(pathUtil.join(...pathItems))
        })
      } else {
        baseUrl = '/files/public-files/'
        pathItems.push(pathSegments.splice(0, 1)[0])
        breadcrumbs.push({
          text: this.$gettext('Home'),
          to: baseUrl + encodeURIComponent(pathUtil.join(...pathItems))
        })
      }

      for (let i = 0; i < pathSegments.length; i++) {
        pathItems.push(pathSegments[i])
        const to = baseUrl + encodeURIComponent(pathUtil.join(...pathItems))
        breadcrumbs.push({
          text: pathSegments[i],
          to: i + 1 === pathSegments.length ? null : to
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

    areDefaultActionsVisible() {
      return this.selectedFiles.length < 1
    },

    isNewBtnDisabled() {
      return !this.canUpload || !this.hasFreeSpace
    }
  },
  methods: {
    ...mapActions('Files', ['addFiles', 'updateFileProgress', 'removeFilesFromTrashbin']),
    ...mapActions(['openFile', 'showMessage', 'createModal', 'setModalInputErrorMessage']),
    ...mapMutations('Files', ['PUSH_NEW_RESOURCE']),

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

    async addNewFolder(folderName) {
      if (folderName === '') {
        return
      }

      this.fileFolderCreationLoading = true

      try {
        const path = pathUtil.join(this.currentPath, folderName)

        this.isListRoute
          ? await this.$client.files.createFolder(path)
          : await this.$client.publicFiles.createFolder(path, null, this.publicLinkPassword)

        let resource = await this.$client.files.fileInfo(path, this.davProperties)
        resource = buildResource(resource)

        this.PUSH_NEW_RESOURCE(resource)
        this.hideModal()
        this.$scrollTo(`.oc-tbody-tr-${resource.id}`)
      } catch (error) {
        this.showMessage({
          title: this.$gettext('Creating folder failed…'),
          desc: error,
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })
      }

      this.fileFolderCreationLoading = false
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

    async addNewFile(fileName) {
      if (fileName === '') {
        return
      }

      this.fileFolderCreationLoading = true

      try {
        const path = pathUtil.join(this.currentPath, fileName)
        this.isListRoute
          ? await this.$client.files.putFileContents(path, '')
          : await this.$client.publicFiles.putFileContents(path, null, this.publicLinkPassword, '')

        let resource = this.isListRoute
          ? await this.$client.files.fileInfo(path, this.davProperties)
          : await this.$client.publicFiles.getFileInfo(
              path,
              this.publicLinkPassword,
              this.davProperties
            )

        if (this.newFileAction) {
          const fileId = resource.fileInfo['{http://owncloud.org/ns}fileid']

          this.$_fileActions_openEditor(this.newFileAction, path, fileId)
          this.hideModal()

          return
        }

        resource = buildResource(resource)

        this.PUSH_NEW_RESOURCE(resource)
        this.hideModal()
        this.$scrollTo(`.oc-tbody-tr-${resource.id}`)
      } catch (error) {
        this.showMessage({
          title: this.$gettext('Creating file failed…'),
          desc: error,
          status: 'danger',
          autoClose: {
            enabled: true
          }
        })
      }

      this.fileFolderCreationLoading = false
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
        const path = pathUtil.join(this.currentPath, file)
        if (this.isListRoute) {
          this.$client.files
            .fileInfo(path, this.davProperties)
            .then(fileInfo => {
              this.addFiles({ files: [fileInfo] })
            })
            .catch(() => this.$_ocFilesFolder_getFolder())
        } else {
          this.$client.publicFiles
            .list(path, this.publicLinkPassword, this.davProperties, '0')
            .then(files => {
              this.addFiles({ files })
            })
            .catch(() => this.$_ocFilesFolder_getFolder())
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
    }
  }
}
</script>

<style scoped>
.files-app-bar {
  background-color: white;
  box-sizing: border-box;
  z-index: 1;
}
</style>
