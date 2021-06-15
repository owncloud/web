<template>
  <div class="files-app-bar">
    <oc-hidden-announcer :announcement="selectedResourcesAnnouncement" level="polite" />
    <file-drop
      v-if="!isIE11() && canUpload && hasFreeSpace"
      :root-path="currentPath"
      :path="currentPath"
      :headers="headers"
      @success="onFileSuccess"
      @error="onFileError"
      @progress="onFileProgress"
    />
    <div class="files-topbar oc-py-s">
      <oc-breadcrumb
        v-if="showBreadcrumb"
        id="files-breadcrumb"
        class="oc-p-s"
        :items="breadcrumbs"
      />
      <h1 class="oc-invisible-sr" v-text="pageTitle" />
      <div
        v-if="showActions || selectedFiles.length > 0 || isTrashbinRoute"
        class="uk-flex uk-flex-middle oc-p-s"
      >
        <template v-if="showActions && areDefaultActionsVisible">
          <oc-button
            id="new-file-menu-btn"
            key="new-file-menu-btn-enabled"
            v-oc-tooltip="newButtonTooltip"
            :aria-label="newButtonAriaLabel"
            variation="primary"
            appearance="filled"
            :disabled="isNewBtnDisabled"
          >
            <oc-icon name="add" />
            <translate>New</translate>
          </oc-button>
          <oc-drop
            drop-id="new-file-menu-drop"
            toggle="#new-file-menu-btn"
            mode="click"
            close-on-click
            :options="{ delayHide: 0 }"
          >
            <ul class="uk-list">
              <li>
                <file-upload
                  :path="currentPath"
                  :headers="headers"
                  @success="onFileSuccess"
                  @error="onFileError"
                  @progress="onFileProgress"
                />
              </li>
              <li v-if="checkIfBrowserSupportsFolderUpload">
                <folder-upload
                  v-if="!isIE11()"
                  :root-path="currentPath"
                  :path="currentPath"
                  :headers="headers"
                  @success="onFileSuccess"
                  @error="onFileError"
                  @progress="onFileProgress"
                />
              </li>
              <li>
                <div>
                  <oc-button
                    id="new-folder-btn"
                    appearance="raw"
                    class="uk-width-1-1"
                    justify-content="left"
                    @click="showCreateResourceModal"
                  >
                    <oc-icon name="create_new_folder" />
                    <translate>New folder…</translate>
                  </oc-button>
                </div>
              </li>
              <li v-for="(newFileHandler, key) in newFileHandlers" :key="key">
                <div>
                  <oc-button
                    appearance="raw"
                    justify-content="left"
                    :class="['new-file-btn-' + newFileHandler.ext, 'uk-width-1-1']"
                    @click="
                      showCreateResourceModal(false, newFileHandler.ext, newFileHandler.action)
                    "
                  >
                    <oc-icon :name="newFileHandler.icon || 'save'" />
                    <span>{{ newFileHandler.menuTitle($gettext) }}</span>
                  </oc-button>
                </div>
              </li>
            </ul>
          </oc-drop>
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
import MixinFileActions, { EDITOR_MODE_CREATE } from '../mixins/fileActions'
import MixinRoutes from '../mixins/routes'
import MixinScrollToResource from '../mixins/filesListScrolling'
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
  mixins: [Mixins, MixinFileActions, MixinRoutes, MixinScrollToResource],
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters(['getToken', 'configuration', 'newFileHandlers', 'quota', 'user']),
    ...mapGetters('Files', [
      'activeFiles',
      'inProgress',
      'currentFolder',
      'davProperties',
      'selectedFiles',
      'publicLinkPassword'
    ]),
    ...mapState(['route']),

    newButtonTooltip() {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to upload!')
      }
      if (!this.hasFreeSpace) {
        return this.$gettext('You have not enough space left to upload!')
      }
      return null
    },
    newButtonAriaLabel() {
      const tooltip = this.newButtonTooltip
      if (tooltip) {
        return tooltip
      }
      return this.$gettext('Add files or folders')
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
    showActions() {
      return this.$route.meta.hideFilelistActions !== true
    },

    showBreadcrumb() {
      return this.isPublicFilesRoute || this.isPersonalRoute
    },
    pageTitle() {
      const title = this.$route.meta.title
      return this.$gettext(title)
    },

    breadcrumbs() {
      const pathSegments = this.currentPathSegments
      const breadcrumbs = []
      let baseUrl
      const pathItems = []
      if (this.isPersonalRoute) {
        baseUrl = '/files/list/all/'
        pathItems.push('/') // as of now we need to add the url encoded root path `/`, otherwise we'll land in the configured homeFolder
        breadcrumbs.push({
          text: this.$gettext('All files'),
          to: baseUrl + encodeURIComponent(pathUtil.join(...pathItems))
        })
      } else {
        baseUrl = '/files/public/list/'
        pathItems.push(pathSegments.splice(0, 1)[0])
        breadcrumbs.push({
          text: this.$gettext('Public link'),
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
    },

    selectedResourcesAnnouncement() {
      if (this.selectedFiles.length === 0) {
        return this.$gettext('No items selected.')
      }
      const translated = this.$ngettext(
        '%{ amount } item selected. Actions are available above the table.',
        '%{ amount } items selected. Actions are available above the table.',
        this.selectedFiles.length
      )
      return this.$gettextInterpolate(translated, { amount: this.selectedFiles.length })
    }
  },
  methods: {
    ...mapActions('Files', [
      'updateFileProgress',
      'removeFilesFromTrashbin',
      'loadPreviews',
      'loadIndicators'
    ]),
    ...mapActions(['openFile', 'showMessage', 'createModal', 'setModalInputErrorMessage']),
    ...mapMutations('Files', ['UPSERT_RESOURCE']),
    ...mapMutations(['SET_QUOTA']),

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
        variation: 'passive',
        title: isFolder ? this.$gettext('Create a new folder') : this.$gettext('Create a new file'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Create'),
        hasInput: true,
        inputValue: defaultName,
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

        let resource
        if (this.isPersonalRoute) {
          await this.$client.files.createFolder(path)
          resource = await this.$client.files.fileInfo(path, this.davProperties)
        } else {
          await this.$client.publicFiles.createFolder(path, null, this.publicLinkPassword)
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            this.davProperties
          )
        }
        resource = buildResource(resource)

        this.UPSERT_RESOURCE(resource)
        this.hideModal()

        if (this.isPersonalRoute) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path
          })
        }

        setTimeout(() => {
          this.setHighlightedFile(resource)
          this.scrollToResource(resource)
        })
      } catch (error) {
        this.showMessage({
          title: this.$gettext('Creating folder failed…'),
          desc: error,
          status: 'danger'
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
        let resource
        if (this.isPersonalRoute) {
          await this.$client.files.putFileContents(path, '')
          resource = await this.$client.files.fileInfo(path, this.davProperties)
        } else {
          await this.$client.publicFiles.putFileContents(path, null, this.publicLinkPassword, '')
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            this.davProperties
          )
        }

        if (this.newFileAction) {
          const fileId = resource.fileInfo['{http://owncloud.org/ns}fileid']

          this.$_fileActions_openEditor(this.newFileAction, path, fileId, EDITOR_MODE_CREATE)
          this.hideModal()

          return
        }

        resource = buildResource(resource)

        this.UPSERT_RESOURCE(resource)
        this.hideModal()

        if (this.isPersonalRoute) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path
          })
        }

        setTimeout(() => {
          this.setHighlightedFile(resource)
          this.scrollToResource(resource)
        })
      } catch (error) {
        this.showMessage({
          title: this.$gettext('Creating file failed…'),
          desc: error,
          status: 'danger'
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
    async onFileSuccess(event, file) {
      try {
        if (file.name) {
          file = file.name
        }

        await this.$nextTick()

        const path = pathUtil.join(this.currentPath, file)
        let resource = this.isPersonalRoute
          ? await this.$client.files.fileInfo(path, this.davProperties)
          : await this.$client.publicFiles.getFileInfo(
              path,
              this.publicLinkPassword,
              this.davProperties
            )

        resource = buildResource(resource)
        this.UPSERT_RESOURCE(resource)

        if (this.isPersonalRoute) {
          await this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path,
            encodePath: this.encodePath
          })
        }

        this.loadPreviews({
          resources: [resource],
          isPublic: this.publicPage(),
          mediaSource: this.mediaSource,
          encodePath: this.encodePath
        })

        const user = await this.$client.users.getUser(this.user.id)

        this.SET_QUOTA(user.quota)
      } catch (error) {
        console.error(error)
      }
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
  background-color: var(--oc-color-background-default);
  box-sizing: border-box;
  z-index: 2;
}
</style>
