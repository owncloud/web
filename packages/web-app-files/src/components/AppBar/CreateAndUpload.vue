<template>
  <div v-if="showActions" class="oc-flex-inline oc-width-1-1" style="gap: 15px">
    <template v-if="createFileActionsAvailable">
      <oc-button
        id="new-file-menu-btn"
        key="new-file-menu-btn-enabled"
        v-oc-tooltip="newButtonTooltip"
        :aria-label="newButtonAriaLabel"
        appearance="filled"
        variation="primary"
        :disabled="uploadOrFileCreationBlocked"
      >
        <oc-icon name="add" />
        <translate>New</translate>
      </oc-button>
      <oc-drop
        drop-id="new-file-menu-drop"
        toggle="#new-file-menu-btn"
        mode="click"
        close-on-click
        class="oc-width-auto"
        padding-size="small"
      >
        <oc-list id="create-list">
          <li class="create-list-folder">
            <oc-button id="new-folder-btn" appearance="raw" @click="showCreateResourceModal">
              <oc-resource-icon :resource="{ isFolder: true, extension: '' }" />
              <translate>Folder</translate>
            </oc-button>
          </li>
          <li v-for="(newFileHandler, key) in newFileHandlers" :key="key" class="create-list-file">
            <oc-button
              appearance="raw"
              :class="['new-file-btn-' + newFileHandler.ext]"
              @click="showCreateResourceModal(false, newFileHandler.ext, newFileHandler.action)"
            >
              <oc-resource-icon :resource="{ type: 'file', extension: newFileHandler.ext }" />
              <span>{{ newFileHandler.menuTitle($gettext) }}</span>
            </oc-button>
          </li>
          <template v-if="mimetypesAllowedForCreation">
            <li
              v-for="(mimetype, key) in mimetypesAllowedForCreation"
              :key="key"
              class="create-list-file"
            >
              <oc-button
                appearance="raw"
                @click="showCreateResourceModal(false, mimetype.ext, false, true)"
              >
                <oc-resource-icon :resource="{ type: 'file', extension: mimetype.ext }" />
                <translate :translate-params="{ name: mimetype.name }">%{name}</translate>
              </oc-button>
            </li>
          </template>
        </oc-list>
      </oc-drop>
    </template>
    <template v-else>
      <oc-button
        id="new-folder-btn"
        v-oc-tooltip="newButtonAriaLabel"
        appearance="filled"
        variation="primary"
        :aria-label="newButtonAriaLabel"
        :disabled="uploadOrFileCreationBlocked"
        @click="showCreateResourceModal"
      >
        <oc-icon name="resource-type-folder" />
        <translate>New folder</translate>
      </oc-button>
    </template>
    <oc-button
      id="upload-menu-btn"
      key="upload-menu-btn-enabled"
      v-oc-tooltip="uploadButtonTooltip"
      :aria-label="uploadButtonAriaLabel"
      :disabled="uploadOrFileCreationBlocked"
    >
      <oc-icon name="upload" fill-type="line" />
      <translate>Upload</translate>
    </oc-button>
    <oc-drop
      drop-id="upload-menu-drop"
      toggle="#upload-menu-btn"
      mode="click"
      class="oc-width-auto"
      close-on-click
      padding-size="small"
    >
      <oc-list id="upload-list">
        <li>
          <folder-upload ref="folder-upload" />
        </li>
        <li>
          <file-upload ref="file-upload" btn-class="oc-width-1-1" />
        </li>
      </oc-list>
    </oc-drop>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import pathUtil from 'path'

import MixinFileActions, { EDITOR_MODE_CREATE } from '../../mixins/fileActions'
import { buildResource, buildWebDavFilesPath, buildWebDavSpacesPath } from '../../helpers/resources'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { useActiveLocation } from '../../composables'
import { useAppDefaults } from 'web-pkg/src/composables'

import { DavProperties, DavProperty } from 'web-pkg/src/constants'

// TODO: Simplify to one UploadButton component and fill from here
import FileUpload from './Upload/FileUpload.vue'
import FolderUpload from './Upload/FolderUpload.vue'
import { defineComponent, getCurrentInstance, onMounted, onUnmounted } from '@vue/composition-api'
import { UppyResource, useUpload } from 'web-runtime/src/composables/upload'
import { useUploadHelpers } from '../../composables/upload/useUploadHelpers'

export default defineComponent({
  components: {
    FileUpload,
    FolderUpload
  },
  mixins: [MixinFileActions],
  setup() {
    const instance = getCurrentInstance().proxy
    const uppyService = instance.$uppyService

    onMounted(() => {
      uppyService.$on('filesSelected', instance.onFilesSelected)
      uppyService.$on('uploadSuccess', instance.onFileSuccess)
      uppyService.$on('uploadError', instance.onFileError)

      uppyService.useDropTarget({
        targetSelector: '#files-view',
        uppyService
      })
    })

    onUnmounted(() => {
      uppyService.$off('filesSelected', instance.onFilesSelected)
      uppyService.$off('uploadSuccess', instance.onFileSuccess)
      uppyService.$off('uploadError', instance.onFileError)
    })

    return {
      ...useUpload({
        uppyService
      }),
      ...useUploadHelpers(),
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal-home'),
      isPublicLocation: useActiveLocation(isLocationPublicActive, 'files-public-files'),
      isSpacesProjectsLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-projects'),
      isSpacesProjectLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-project'),
      ...useAppDefaults({
        applicationName: 'files'
      })
    }
  },
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters(['getToken', 'capabilities', 'configuration', 'newFileHandlers', 'user']),
    ...mapGetters('Files', ['files', 'currentFolder', 'publicLinkPassword']),
    ...mapState('Files', ['areFileExtensionsShown']),

    mimetypesAllowedForCreation() {
      // we can't use `mapGetters` here because the External app doesn't exist in all deployments
      const mimeTypes = this.$store.getters['External/mimeTypes']
      if (!mimeTypes) {
        return []
      }
      return mimeTypes.filter((mimetype) => mimetype.allow_creation) || []
    },

    showActions() {
      return !(this.uploadOrFileCreationBlocked && this.isPublicLocation)
    },

    createFileActionsAvailable() {
      return this.newFileHandlers.length > 0 || this.mimetypesAllowedForCreation.length > 0
    },
    newButtonTooltip() {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to create new files!')
      }
      if (!this.hasFreeSpace) {
        return this.$gettext('You have not enough space left to create new files!')
      }
      return null
    },
    newButtonAriaLabel() {
      const tooltip = this.newButtonTooltip
      if (tooltip) {
        return tooltip
      }
      if (!this.createFileActionsAvailable) {
        return this.$gettext('Create a new folder')
      }
      return this.$gettext('Create new files or folders')
    },
    uploadButtonTooltip() {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to upload!')
      }
      if (!this.hasFreeSpace) {
        return this.$gettext('You have not enough space left to upload!')
      }
      return null
    },
    uploadButtonAriaLabel() {
      const tooltip = this.uploadButtonTooltip
      if (tooltip) {
        return tooltip
      }
      return this.$gettext('Upload files or folders')
    },

    uploadOrFileCreationBlocked() {
      return !this.canUpload || !this.hasFreeSpace
    },

    canUpload() {
      if (!this.currentFolder) {
        return false
      }
      return this.currentFolder.canUpload({ user: this.user })
    },

    hasFreeSpace() {
      return (
        !this.quota ||
        this.quota.free > 0 ||
        (this.currentFolder &&
          this.currentFolder.permissions &&
          this.currentFolder.permissions.indexOf('M') >= 0) ||
        this.isPublicLocation
      )
    }
  },
  methods: {
    ...mapActions('Files', ['loadPreview', 'loadIndicators']),
    ...mapActions(['openFile', 'showMessage', 'createModal', 'setModalInputErrorMessage']),
    ...mapMutations('Files', ['UPSERT_RESOURCE']),
    ...mapMutations(['SET_QUOTA']),

    async onFileSuccess(file: UppyResource) {
      try {
        let pathFileWasUploadedTo = file.meta.currentFolder
        if (file.meta.relativeFolder) {
          pathFileWasUploadedTo += file.meta.relativeFolder
        }

        const fileIsInCurrentPath = pathFileWasUploadedTo === this.currentPath

        await this.$nextTick()

        let path = pathUtil.join(pathFileWasUploadedTo, file.name)
        let resource

        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else {
          resource = await this.$client.publicFiles.getFileInfo(
            path,
            this.publicLinkPassword,
            DavProperties.PublicLink
          )
        }

        resource = buildResource(resource)

        // Update table only if the file was uploaded to the current directory
        if (fileIsInCurrentPath) {
          this.UPSERT_RESOURCE(resource)

          if (this.isPersonalLocation) {
            this.loadIndicators({
              client: this.$client,
              currentFolder: this.currentFolder.path,
              encodePath: this.encodePath
            })
          }
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

    showCreateResourceModal(
      isFolder = true,
      ext = 'txt',
      openAction = null,
      addAppProviderFile = false
    ) {
      const defaultName = isFolder
        ? this.$gettext('New folder')
        : this.$gettext('New file') + (this.areFileExtensionsShown ? `.${ext}` : '')
      const checkInputValue = (value) => {
        this.setModalInputErrorMessage(
          isFolder
            ? this.checkNewFolderName(value)
            : this.checkNewFileName(this.areFileExtensionsShown ? value : `${value}.${ext}`)
        )
      }

      // Sets action to be executed after creation of the file
      if (!isFolder) {
        this.newFileAction = openAction
      }

      const inputSelectionRange =
        isFolder || !this.areFileExtensionsShown ? null : [0, defaultName.length - (ext.length + 1)]

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
          : this.checkNewFileName(
              this.areFileExtensionsShown ? defaultName : `${defaultName}.${ext}`
            ),
        inputSelectionRange,
        onCancel: this.hideModal,
        onConfirm: isFolder
          ? this.addNewFolder
          : addAppProviderFile
          ? this.addAppProviderFile
          : (fileName) => {
              if (!this.areFileExtensionsShown) {
                fileName = `${fileName}.${ext}`
              }
              this.addNewFile(fileName)
            },
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
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
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
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
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

        this.UPSERT_RESOURCE(buildResource(resource))

        if (this.newFileAction) {
          const fileId = resource.fileInfo[DavProperty.FileId]

          this.$_fileActions_openEditor(this.newFileAction, path, fileId, EDITOR_MODE_CREATE)
          this.hideModal()

          return
        }

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
        const configUrl = this.configuration.server
        const appNewUrl = this.capabilities.files.app_providers[0].new_url.replace(/^\/+/, '')
        const url =
          configUrl +
          appNewUrl +
          `?parent_container_id=${parent}&filename=${encodeURIComponent(fileName)}`

        const response = await this.makeRequest('POST', url)

        if (response.status !== 200) {
          throw new Error(`An error has occurred: ${response.status}`)
        }

        let resource
        let path = pathUtil.join(this.currentPath, fileName)
        if (this.isPersonalLocation) {
          path = buildWebDavFilesPath(this.user.id, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
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

    onFilesSelected(files: File[]) {
      const conflicts = []
      const uppyResources: UppyResource[] = this.inputFilesToUppyFiles(files)
      for (const file of uppyResources) {
        const relativeFilePath = file.meta.relativePath
        if (relativeFilePath) {
          const rootFolder = relativeFilePath.replace(/^\/+/, '').split('/')[0]
          const exists = this.files.find((f) => f.name === rootFolder)
          if (exists) {
            this.showMessage({
              title: this.$gettextInterpolate(
                this.$gettext('Folder "%{folder}" already exists.'),
                { folder: rootFolder },
                true
              ),
              status: 'danger'
            })
            return
          }

          // Folder does not exist, no need to care about files inside -> continue
          continue
        }
        const exists = this.files.find((f) => f.name === file.name)
        if (exists) {
          conflicts.push(file)
        }
      }

      if (conflicts.length) {
        this.displayOverwriteDialog(uppyResources, conflicts)
      } else {
        this.handleUppyFileUpload(uppyResources)
      }
    },

    async handleUppyFileUpload(files: UppyResource[]) {
      await this.createDirectoryTree(files)
      await this.updateStoreForCreatedFolders(files)
      this.$uppyService.uploadFiles(files)
    },

    displayOverwriteDialog(files: UppyResource[], conflicts) {
      const title = this.$ngettext(
        'File already exists',
        'Some files already exist',
        conflicts.length
      )

      const isVersioningEnabled =
        !this.publicPage() && this.capabilities.files && this.capabilities.files.versioning

      let translatedMsg
      if (isVersioningEnabled) {
        translatedMsg = this.$ngettext(
          'The following resource already exists: %{resources}. Do you want to create a new version for it?',
          'The following resources already exist: %{resources}. Do you want to create a new version for them?',
          conflicts.length
        )
      } else {
        translatedMsg = this.$ngettext(
          'The following resource already exists: %{resources}. Do you want to overwrite it?',
          'The following resources already exist: %{resources}. Do you want to overwrite them?',
          conflicts.length
        )
      }
      const message = this.$gettextInterpolate(translatedMsg, {
        resources: conflicts.map((f) => `${f.name}`).join(', ')
      })

      const modal = {
        variation: isVersioningEnabled ? 'passive' : 'danger',
        icon: 'upload-cloud',
        title,
        message,
        cancelText: this.$gettext('Cancel'),
        confirmText: isVersioningEnabled ? this.$gettext('Create') : this.$gettext('Overwrite'),
        onCancel: this.hideModal,
        onConfirm: () => {
          this.hideModal()
          this.handleUppyFileUpload(files)
        }
      }

      this.createModal(modal)
    }
  }
})
</script>
<style lang="scss" scoped>
#create-list {
  li {
    border: 1px solid transparent;
    button {
      gap: 10px;
      justify-content: left;
      width: 100%;
    }
  }
  .create-list-folder {
    border-bottom: 1px solid var(--oc-color-border);
  }
  .create-list-file button {
    margin: 2px 0;
  }
}
#upload-list,
#new-file-menu-drop {
  min-width: 200px;
}
</style>
