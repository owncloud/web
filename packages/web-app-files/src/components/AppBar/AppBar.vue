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
        v-if="breadcrumbs.length"
        id="files-breadcrumb"
        data-testid="files-breadcrumbs"
        class="oc-py-s"
        :items="breadcrumbs"
      >
        <template #contextMenu>
          <context-actions
            v-if="currentFolder && breadcrumbs.length > 1"
            :items="[currentFolder]"
          />
        </template>
      </oc-breadcrumb>
      <h1 class="oc-invisible-sr" v-text="pageTitle" />
      <div class="files-app-bar-actions">
        <div
          v-if="showActions || selectedFiles.length > 0 || hasBulkActions"
          class="oc-flex-1 oc-flex oc-flex-start"
        >
          <template v-if="showActions && areDefaultActionsVisible">
            <oc-button
              id="new-file-menu-btn"
              key="new-file-menu-btn-enabled"
              v-oc-tooltip="newButtonTooltip"
              :aria-label="newButtonAriaLabel"
              variation="inverse"
              :disabled="isNewBtnDisabled"
              class="oc-background-primary-gradient"
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
              padding-size="small"
            >
              <ul class="oc-list">
                <li class="oc-my-xs">
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
                      class="oc-width-1-1"
                      justify-content="left"
                      @click="showCreateResourceModal"
                    >
                      <oc-icon name="folder-add" />
                      <translate>New folder…</translate>
                    </oc-button>
                  </div>
                </li>
                <li v-for="(newFileHandler, key) in newFileHandlersForRoute" :key="key">
                  <div>
                    <oc-button
                      appearance="raw"
                      justify-content="left"
                      :class="['new-file-btn-' + newFileHandler.ext, 'oc-width-1-1']"
                      @click="
                        showCreateResourceModal(false, newFileHandler.ext, newFileHandler.action)
                      "
                    >
                      <oc-icon :name="newFileHandler.icon || 'save'" />
                      <span>{{ newFileHandler.menuTitle($gettext) }}</span>
                    </oc-button>
                  </div>
                </li>
                <template v-if="mimetypesAllowedForCreation">
                  <li v-for="(mimetype, key) in mimetypesAllowedForCreation" :key="key">
                    <div>
                      <oc-button
                        appearance="raw"
                        justify-content="left"
                        :class="['oc-width-1-1']"
                        @click="showCreateResourceModal(false, mimetype.ext, false, true)"
                      >
                        <oc-icon :name="mimetype.icon || 'file'" />
                        <translate :translate-params="{ name: mimetype.name }"
                          >New %{name}</translate
                        >
                      </oc-button>
                    </div>
                  </li>
                </template>
              </ul>
            </oc-drop>
          </template>
          <size-info v-if="hasBulkActions && selectedFiles.length > 0" class="oc-mr oc-visible@l" />
          <batch-actions v-if="hasBulkActions" />
        </div>
        <view-options v-if="!hideViewOptions" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import pathUtil from 'path'

import Mixins from '../../mixins'
import MixinFileActions, { EDITOR_MODE_CREATE } from '../../mixins/fileActions'
import { buildResource, buildWebDavFilesPath, buildWebDavSpacesPath } from '../../helpers/resources'
import { bus } from 'web-pkg/src/instance'
import { isLocationActive, isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { useActiveLocation } from '../../composables'

import BatchActions from './SelectedResources/BatchActions.vue'
import FileDrop from './Upload/FileDrop.vue'
import FileUpload from './Upload/FileUpload.vue'
import FolderUpload from './Upload/FolderUpload.vue'
import SizeInfo from './SelectedResources/SizeInfo.vue'
import ViewOptions from './ViewOptions.vue'
import { DavProperties, DavProperty } from 'web-pkg/src/constants'
import ContextActions from '../FilesList/ContextActions.vue'

export default {
  components: {
    BatchActions,
    FileDrop,
    FileUpload,
    FolderUpload,
    SizeInfo,
    ViewOptions,
    ContextActions
  },
  mixins: [Mixins, MixinFileActions],
  setup() {
    return {
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal-home'),
      isPublicLocation: useActiveLocation(isLocationPublicActive, 'files-public-files'),
      isSpacesProjectsLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-projects'),
      isSpacesProjectLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-project')
    }
  },
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters([
      'getToken',
      'capabilities',
      'configuration',
      'newFileHandlers',
      'quota',
      'user'
    ]),
    ...mapGetters('Files', ['files', 'currentFolder', 'selectedFiles', 'publicLinkPassword']),
    ...mapState('Files', ['areHiddenFilesShown']),

    mimetypesAllowedForCreation() {
      // we can't use `mapGetters` here because the External app doesn't exist in all deployments
      const mimeTypes = this.$store.getters['External/mimeTypes']
      if (!mimeTypes) {
        return []
      }
      return mimeTypes.filter((mimetype) => mimetype.allow_creation) || []
    },
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
      if (!this.currentFolder) {
        return false
      }
      return this.currentFolder.canUpload()
    },
    showActions() {
      return this.$route.meta.hideFilelistActions !== true
    },
    hasBulkActions() {
      return this.$route.meta.hasBulkActions === true
    },
    hideViewOptions() {
      return this.$route.meta.hideViewOptions === true
    },
    pageTitle() {
      const title = this.$route.meta.title
      return this.$gettext(title)
    },

    breadcrumbs: function () {
      if (
        !(
          this.isPublicLocation ||
          this.isPersonalLocation ||
          this.isSpacesProjectsLocation ||
          this.isSpacesProjectLocation
        )
      ) {
        return []
      }

      const { params: routeParams, path: routePath } = this.$route
      const requestedItemPath = routeParams.item || ''
      const basePaths =
        '/' +
        decodeURIComponent(routePath)
          .replace(requestedItemPath, '')
          .split('/')
          .filter(Boolean)
          .join('/')

      return [basePaths, ...requestedItemPath.split('/').filter(Boolean)].reduce(
        (acc, rawItem, i, rawItems) => {
          const to = [(acc[i - 1] || {}).to, rawItem].filter(Boolean).join('/')
          acc.push({
            text: rawItem,
            onClick: () => bus.publish('app.files.list.load', to.replace(basePaths, '') || '/'),
            to
          })

          if (i === rawItems.length - 1) {
            this.isPublicLocation && acc.shift()

            if (acc.length) {
              if (this.isPersonalLocation) {
                acc[0].text = this.$gettext('All files')
                acc[0].to = acc[0].to + '/'
              } else if (this.isSpacesProjectLocation || this.isSpacesProjectsLocation) {
                acc[0] = {
                  text: this.$gettext('Spaces'),
                  to: '/files/spaces/projects'
                }
                if (this.$route.params.spaceId) {
                  acc.splice(1, 0, {
                    text: this.$route.params.spaceId,
                    to: `/files/spaces/projects/${this.$route.params.spaceId}`
                  })
                }
              } else {
                acc[0].text = this.$gettext('Public link')
              }
            }
            acc.length && delete acc[acc.length - 1].to
          } else {
            delete acc[i].onClick
          }

          return acc
        },
        []
      )
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
    },

    newFileHandlersForRoute() {
      return this.newFileHandlers.filter(({ routes = [] }) =>
        isLocationActive(this.$router, ...routes.map((name) => ({ name })))
      )
    }
  },

  created() {
    // Storage returns a string so we need to convert it into a boolean
    const areHiddenFilesShown = window.localStorage.getItem('oc_hiddenFilesShown') || 'false'
    const areHiddenFilesShownBoolean = areHiddenFilesShown === 'true'

    if (areHiddenFilesShownBoolean !== this.areHiddenFilesShown) {
      this.SET_HIDDEN_FILES_VISIBILITY(areHiddenFilesShownBoolean)
    }
  },

  methods: {
    ...mapActions('Files', ['updateFileProgress', 'removeFilesFromTrashbin', 'loadIndicators']),
    ...mapActions(['openFile', 'showMessage', 'createModal', 'setModalInputErrorMessage']),
    ...mapMutations('Files', ['UPSERT_RESOURCE', 'SET_HIDDEN_FILES_VISIBILITY']),
    ...mapMutations(['SET_QUOTA']),

    showCreateResourceModal(
      isFolder = true,
      ext = 'txt',
      openAction = null,
      addAppProviderFile = false
    ) {
      const defaultName = isFolder
        ? this.$gettext('New folder')
        : this.$gettext('New file') + '.' + ext
      const checkInputValue = (value) => {
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
        onConfirm: isFolder
          ? this.addNewFolder
          : addAppProviderFile
          ? this.addAppProviderFile
          : this.addNewFile,
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
        let path = pathUtil.join(this.currentPath, folderName)
        let resource

        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          await this.$client.files.createFolder(path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.spaceId, path)
          await this.$client.files.createFolder(path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else {
          await this.$client.publicFiles.createFolder(path, null, this.publicLinkPassword)
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        }
        resource = buildResource(resource)

        this.UPSERT_RESOURCE(resource)
        this.hideModal()

        if (this.isPersonalLocation) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path
          })
        }

        this.showMessage({
          title: this.$gettextInterpolate(
            this.$gettext('"%{folderName}" was created successfully'),
            {
              folderName
            }
          )
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create folder'),
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

      const exists = this.files.find((file) => file.name === folderName)

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
        let resource
        let path = pathUtil.join(this.currentPath, fileName)

        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          await this.$client.files.putFileContents(path, '')
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.spaceId, path)
          await this.$client.files.putFileContents(path, '')
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else {
          await this.$client.publicFiles.putFileContents('', path, this.publicLinkPassword, '')
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        }

        if (this.newFileAction) {
          const fileId = resource.fileInfo[DavProperty.FileId]

          this.$_fileActions_openEditor(this.newFileAction, path, fileId, EDITOR_MODE_CREATE)
          this.hideModal()

          return
        }

        resource = buildResource(resource)

        this.UPSERT_RESOURCE(resource)
        this.hideModal()

        if (this.isPersonalLocation) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path
          })
        }

        this.showMessage({
          title: this.$gettextInterpolate(this.$gettext('"%{fileName}" was created successfully'), {
            fileName
          })
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create file'),
          status: 'danger'
        })
      }

      this.fileFolderCreationLoading = false
    },
    async addAppProviderFile(fileName) {
      // FIXME: this belongs in web-app-external, but the app provider handles file creation differently than other editor extensions. Needs more refactoring.
      if (fileName === '') {
        return
      }
      try {
        const parent = this.currentFolder.fileId
        const publicToken = (this.$router.currentRoute.params.item || '').split('/')[0]

        const configUrl = this.configuration.server
        const appNewUrl = this.capabilities.files.app_providers[0].new_url.replace(/^\/+/, '')
        const url =
          configUrl +
          appNewUrl +
          `?parent_container_id=${parent}&filename=${encodeURIComponent(fileName)}`

        const headers = {
          'X-Requested-With': 'XMLHttpRequest',
          ...(this.isPublicLocation &&
            publicToken && {
              'public-token': publicToken
            }),
          ...(this.isPublicLocation &&
            this.publicLinkPassword && {
              Authorization:
                'Basic ' +
                Buffer.from(['public', this.publicLinkPassword].join(':')).toString('base64')
            }),
          ...(this.getToken && {
            Authorization: 'Bearer ' + this.getToken
          })
        }

        const response = await fetch(url, {
          method: 'POST',
          headers
        })

        if (response.status !== 200) {
          throw new Error(`An error has occurred: ${response.status}`)
        }

        let resource
        let path = pathUtil.join(this.currentPath, fileName)

        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.spaceId, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else {
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        }
        resource = buildResource(resource)
        this.$_fileActions_triggerDefaultAction(resource)
        this.UPSERT_RESOURCE(resource)
        this.hideModal()

        if (this.isPersonalLocation) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path
          })
        }
        this.showMessage({
          title: this.$gettextInterpolate(this.$gettext('"%{fileName}" was created successfully'), {
            fileName
          })
        })
      } catch (error) {
        console.error(error)
        this.showMessage({
          title: this.$gettext('Failed to create file'),
          status: 'danger'
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

      const exists = this.files.find((file) => file.name === fileName)

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

        let path = pathUtil.join(this.currentPath, file)
        let resource

        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.spaceId, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else {
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        }

        resource = buildResource(resource)

        this.UPSERT_RESOURCE(resource)

        if (this.isPersonalLocation) {
          this.loadIndicators({
            client: this.$client,
            currentFolder: this.currentFolder.path,
            encodePath: this.encodePath
          })
        }

        const user = await this.$client.users.getUser(this.user.id)

        this.SET_QUOTA(user.quota)
      } catch (error) {
        console.error(error)
      }
    },

    onFileError(error) {
      console.error(error)
      this.showMessage({
        title: this.$gettext('Failed to upload'),
        status: 'danger'
      })
    },

    onFileProgress(progress) {
      this.updateFileProgress(progress)
    }
  }
}
</script>

<style lang="scss" scoped>
.files-app-bar {
  background-color: var(--oc-color-background-default);
  box-sizing: border-box;
  z-index: 2;
  padding: 0 var(--oc-space-medium);
  border-top-right-radius: 15px;

  &-actions {
    align-items: center;
    display: flex;
    gap: var(--oc-space-small);
    justify-content: flex-end;
  }
}
</style>
