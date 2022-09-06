<template>
  <div v-if="showActions" class="create-and-upload-actions oc-flex-inline oc-width-1-1">
    <template v-if="createFileActionsAvailable">
      <span v-oc-tooltip="newButtonTooltip">
        <oc-button
          id="new-file-menu-btn"
          key="new-file-menu-btn-enabled"
          v-oc-tooltip="hideButtonLabels ? $gettext('New') : ''"
          :aria-label="newButtonAriaLabel"
          appearance="filled"
          variation="primary"
          :disabled="uploadOrFileCreationBlocked"
        >
          <oc-icon name="add" />
          <span v-if="!hideButtonLabels" v-text="$gettext('New')" />
        </oc-button>
      </span>
      <oc-drop
        drop-id="new-file-menu-drop"
        toggle="#new-file-menu-btn"
        mode="click"
        close-on-click
        class="oc-width-auto"
        padding-size="small"
      >
        <oc-list id="create-list">
          <li class="create-list-folder oc-menu-item-hover">
            <oc-button id="new-folder-btn" appearance="raw" @click="showCreateResourceModal">
              <oc-resource-icon :resource="{ isFolder: true, extension: '' }" size="medium" />
              <translate>Folder</translate>
            </oc-button>
          </li>
          <li
            v-for="(newFileHandler, key) in newFileHandlers"
            :key="`file-creation-item-${key}`"
            class="create-list-file oc-menu-item-hover"
          >
            <oc-button
              appearance="raw"
              :class="['new-file-btn-' + newFileHandler.ext]"
              @click="showCreateResourceModal(false, newFileHandler.ext, newFileHandler.action)"
            >
              <oc-resource-icon
                :resource="{ type: 'file', extension: newFileHandler.ext }"
                size="medium"
              />
              <span>{{ newFileHandler.menuTitle($gettext) }}</span>
            </oc-button>
          </li>
          <template v-if="mimetypesAllowedForCreation">
            <li
              v-for="(mimetype, key) in mimetypesAllowedForCreation"
              :key="`file-creation-item-external-${key}`"
              class="create-list-file oc-menu-item-hover"
            >
              <oc-button
                appearance="raw"
                @click="showCreateResourceModal(false, mimetype.ext, false, true)"
              >
                <oc-resource-icon
                  :resource="{ type: 'file', extension: mimetype.ext }"
                  size="medium"
                />
                <translate :translate-params="{ name: mimetype.name }">%{name}</translate>
              </oc-button>
            </li>
          </template>
        </oc-list>
      </oc-drop>
    </template>
    <template v-else>
      <span v-oc-tooltip="newButtonTooltip">
        <oc-button
          id="new-folder-btn"
          v-oc-tooltip="hideButtonLabels ? $gettext('New Folder') : ''"
          appearance="filled"
          variation="primary"
          :aria-label="newButtonAriaLabel"
          :disabled="uploadOrFileCreationBlocked"
          @click="showCreateResourceModal"
        >
          <oc-icon name="resource-type-folder" />
          <span v-if="!hideButtonLabels" v-text="$gettext('New Folder')" />
        </oc-button>
      </span>
    </template>
    <span v-oc-tooltip="uploadButtonTooltip">
      <oc-button
        id="upload-menu-btn"
        key="upload-menu-btn-enabled"
        v-oc-tooltip="hideButtonLabels ? $gettext('Upload') : ''"
        :aria-label="uploadButtonAriaLabel"
        :disabled="uploadOrFileCreationBlocked"
      >
        <oc-icon name="upload" fill-type="line" />
        <span v-if="!hideButtonLabels" v-text="$gettext('Upload')" />
      </oc-button>
    </span>
    <oc-drop
      drop-id="upload-menu-drop"
      toggle="#upload-menu-btn"
      mode="click"
      class="oc-width-auto"
      close-on-click
      padding-size="small"
    >
      <oc-list id="upload-list">
        <li class="oc-menu-item-hover">
          <resource-upload ref="folder-upload" btn-class="oc-width-1-1" />
        </li>
        <li class="oc-menu-item-hover">
          <resource-upload ref="file-upload" btn-class="oc-width-1-1" :is-folder="true" />
        </li>
      </oc-list>
    </oc-drop>
    <div id="clipboard-btns" class="oc-button-group">
      <oc-button v-if="showPasteHereButton" @click="pasteFilesHere">
        <oc-icon fill-type="line" name="clipboard" />
        <span v-translate>Paste here</span>
      </oc-button>
      <oc-button v-if="showPasteHereButton" @click="clearClipboardFiles">
        <oc-icon fill-type="line" name="close" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import pathUtil from 'path'
import filesize from 'filesize'

import MixinFileActions, { EDITOR_MODE_CREATE } from '../../mixins/fileActions'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import { buildResource, buildWebDavFilesPath } from '../../helpers/resources'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { useActiveLocation } from '../../composables'
import { useGraphClient } from 'web-client/src/composables'

import {
  useRequest,
  useCapabilityShareJailEnabled,
  useCapabilitySpacesEnabled,
  useStore,
  usePublicLinkPassword,
  useUserContext,
  usePublicLinkContext
} from 'web-pkg/src/composables'

import { DavProperties, DavProperty } from 'web-pkg/src/constants'

import ResourceUpload from './Upload/ResourceUpload.vue'
import { defineComponent, getCurrentInstance, onMounted } from '@vue/composition-api'
import { UppyResource, useUpload } from 'web-runtime/src/composables/upload'
import { useUploadHelpers } from '../../composables/upload'
import { SHARE_JAIL_ID } from '../../services/folder'
import { bus } from 'web-pkg/src/instance'
import { buildWebDavSpacesPath, Resource } from 'web-client/src/helpers'
import { extractExtensionFromFile, extractNameWithoutExtension } from '../../helpers/resource'
import {
  resolveFileExists,
  ResolveStrategy,
  ResolveConflict,
  resolveFileNameDuplicate,
  FileExistsResolver
} from '../../helpers/resource/copyMove'

export default defineComponent({
  components: {
    ResourceUpload
  },
  mixins: [MixinFileActions, MixinFilesListScrolling],
  props: {
    limitedScreenSpace: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  setup() {
    const instance = getCurrentInstance().proxy
    const uppyService = instance.$uppyService
    const store = useStore()

    onMounted(() => {
      const filesSelectedSub = uppyService.subscribe('filesSelected', instance.onFilesSelected)
      const uploadCompletedSub = uppyService.subscribe('uploadCompleted', instance.onUploadComplete)

      uppyService.useDropTarget({
        targetSelector: '#files-view',
        uppyService
      })

      instance.$on('beforeDestroy', () => {
        uppyService.unsubscribe('filesSelected', filesSelectedSub)
        uppyService.unsubscribe('uploadCompleted', uploadCompletedSub)
        uppyService.removeDropTarget()
      })
    })

    return {
      ...useUpload({
        uppyService
      }),
      ...useUploadHelpers(),
      ...useRequest(),
      ...useGraphClient(),
      isPersonalLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-personal'),
      isPublicLocation: useActiveLocation(isLocationPublicActive, 'files-public-files'),
      isSpacesProjectsLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-projects'),
      isSpacesProjectLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-project'),
      isSpacesShareLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-share'),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasSpaces: useCapabilitySpacesEnabled(),
      publicLinkPassword: usePublicLinkPassword({ store }),
      isUserContext: useUserContext({ store }),
      isPublicLinkContext: usePublicLinkContext({ store })
    }
  },
  data: () => ({
    newFileAction: null,
    path: '',
    fileFolderCreationLoading: false
  }),
  computed: {
    ...mapGetters(['capabilities', 'configuration', 'newFileHandlers', 'user']),
    ...mapGetters('Files', ['files', 'currentFolder', 'selectedFiles', 'clipboardResources']),
    ...mapGetters('runtime/spaces', ['spaces']),
    ...mapState('Files', ['areFileExtensionsShown']),

    showPasteHereButton() {
      return this.clipboardResources && this.clipboardResources.length !== 0
    },
    hideButtonLabels() {
      return this.limitedScreenSpace && this.showPasteHereButton
    },
    mimetypesAllowedForCreation() {
      // we can't use `mapGetters` here because the External app doesn't exist in all deployments
      const mimeTypes = this.$store.getters['External/mimeTypes']
      if (!mimeTypes) {
        return []
      }
      return mimeTypes.filter((mimetype) => mimetype.allow_creation) || []
    },

    showActions() {
      return (
        !this.selectedFiles.length && !(this.uploadOrFileCreationBlocked && this.isPublicLocation)
      )
    },

    createFileActionsAvailable() {
      return this.newFileHandlers.length > 0 || this.mimetypesAllowedForCreation.length > 0
    },
    newButtonTooltip() {
      if (!this.canUpload) {
        return this.$gettext('You have no permission to create new files!')
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
      return !this.canUpload
    },

    canUpload() {
      if (!this.currentFolder) {
        return false
      }
      return this.currentFolder.canUpload({ user: this.user })
    }
  },
  methods: {
    ...mapActions('Files', [
      'loadPreview',
      'loadIndicators',
      'clearClipboardFiles',
      'pasteSelectedFiles'
    ]),
    ...mapActions([
      'openFile',
      'showMessage',
      'createModal',
      'setModalInputErrorMessage',
      'hideModal'
    ]),
    ...mapMutations('Files', ['UPSERT_RESOURCE']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),
    ...mapMutations(['SET_QUOTA']),

    pasteFilesHere() {
      this.pasteSelectedFiles({
        client: this.$client,
        createModal: this.createModal,
        hideModal: this.hideModal,
        showMessage: this.showMessage,
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate,
        $ngettext: this.$ngettext,
        isPublicLinkContext: this.isPublicLinkContext,
        publicLinkPassword: this.publicLinkPassword,
        upsertResource: this.UPSERT_RESOURCE
      }).then(() => {
        ;(document.activeElement as HTMLElement).blur()
      })
    },

    async onUploadComplete(result) {
      if (result.successful) {
        const file = result.successful[0]

        if (!file) {
          return
        }

        if (this.isSpacesProjectLocation || this.isPersonalLocation) {
          if (this.hasSpaces) {
            const driveResponse = await this.graphClient.drives.getDrive(file.meta.routeStorageId)
            this.UPDATE_SPACE_FIELD({
              id: driveResponse.data.id,
              field: 'spaceQuota',
              value: driveResponse.data.quota
            })
          } else {
            const user = await this.$client.users.getUser(this.user.id)
            this.SET_QUOTA(user.quota)
          }
        }

        const fileIsInCurrentPath = file.meta.currentFolder === this.currentPath
        if (fileIsInCurrentPath) {
          bus.publish('app.files.list.load')
        }
      }
    },

    showCreateResourceModal(
      isFolder = true,
      ext = 'txt',
      openAction = null,
      addAppProviderFile = false
    ) {
      const checkInputValue = (value) => {
        this.setModalInputErrorMessage(
          isFolder
            ? this.checkNewFolderName(value)
            : this.checkNewFileName(this.areFileExtensionsShown ? value : `${value}.${ext}`)
        )
      }
      let defaultName = isFolder
        ? this.$gettext('New folder')
        : this.$gettext('New file') + `.${ext}`

      if (this.files.some((f) => f.name === defaultName)) {
        defaultName = resolveFileNameDuplicate(defaultName, isFolder ? '' : ext, this.files)
      }

      if (!this.areFileExtensionsShown) {
        defaultName = extractNameWithoutExtension({ name: defaultName, extension: ext } as any)
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

    addNewFolder(folderName) {
      const addNewFolderInner = async (folderName) => {
        if (folderName === '') {
          return
        }

        this.fileFolderCreationLoading = true

        try {
          let path = pathUtil.join(this.currentPath, folderName)
          let resource

          if (this.isPersonalLocation) {
            if (this.hasShareJail) {
              path = buildWebDavSpacesPath(this.personalDriveId, path || '')
            } else {
              path = buildWebDavFilesPath(this.user.id, path)
            }
            await this.$client.files.createFolder(path)
            resource = await this.$client.files.fileInfo(path, DavProperties.Default)
          } else if (this.isSpacesProjectLocation) {
            path = buildWebDavSpacesPath(this.$route.params.storageId, path)
            await this.$client.files.createFolder(path)
            resource = await this.$client.files.fileInfo(path, DavProperties.Default)
          } else if (this.isSpacesShareLocation) {
            path = buildWebDavSpacesPath([SHARE_JAIL_ID, this.$route.query.shareId].join('!'), path)
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

          return resource
        } catch (error) {
          console.error(error)
          this.showMessage({
            title: this.$gettext('Failed to create folder'),
            status: 'danger'
          })
        }

        this.fileFolderCreationLoading = false
      }

      addNewFolderInner(folderName)
        .then((r) =>
          this.scrollToResource({
            id: r.id
          })
        )
        .catch((error) => console.error(error))
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
          if (this.hasShareJail) {
            path = buildWebDavSpacesPath(this.personalDriveId, path || '')
          } else {
            path = buildWebDavFilesPath(this.user.id, path)
          }
          await this.$client.files.putFileContents(path, '')
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
          await this.$client.files.putFileContents(path, '')
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesShareLocation) {
          path = buildWebDavSpacesPath([SHARE_JAIL_ID, this.$route.query.shareId].join('!'), path)
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
          if (this.hasShareJail) {
            path = buildWebDavSpacesPath(this.personalDriveId, path || '')
          } else {
            path = buildWebDavFilesPath(this.user.id, path)
          }
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesProjectLocation) {
          path = buildWebDavSpacesPath(this.$route.params.storageId, path)
          resource = await this.$client.files.fileInfo(path, DavProperties.Default)
        } else if (this.isSpacesShareLocation) {
          path = buildWebDavSpacesPath([SHARE_JAIL_ID, this.$route.query.shareId].join('!'), path)
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

    async onFilesSelected(files: File[]) {
      const conflicts = []
      const uppyResources: UppyResource[] = this.inputFilesToUppyFiles(files)
      const quotaExceeded = this.checkQuotaExceeded(uppyResources)

      if (quotaExceeded) {
        return this.$uppyService.clearInputs()
      }
      for (const file of uppyResources) {
        const relativeFilePath = file.meta.relativePath
        if (relativeFilePath) {
          // Logic for folders, applies to all files inside folder and subfolders
          const rootFolder = relativeFilePath.replace(/^\/+/, '').split('/')[0]
          const exists = this.files.find((f) => f.name === rootFolder)
          if (exists) {
            if (conflicts.some((conflict) => conflict.name === rootFolder)) continue
            conflicts.push({
              name: rootFolder,
              type: 'folder'
            })
            continue
          }
        }
        // Logic for files
        const exists = this.files.find((f) => f.name === file.name && !file.meta.relativeFolder)
        if (exists) {
          conflicts.push({
            name: file.name,
            type: 'file'
          })
        }
      }
      if (conflicts.length) {
        await this.displayOverwriteDialog(uppyResources, conflicts, resolveFileExists)
      } else {
        this.handleUppyFileUpload(uppyResources)
      }
    },

    checkQuotaExceeded(uppyResources: UppyResource[]) {
      let quotaExceeded = false

      const uploadSizeSpaceMapping = uppyResources.reduce((acc, uppyResource) => {
        let targetUploadSpace

        if (
          uppyResource.meta.routeName === 'files-spaces-share' ||
          uppyResource.meta.routeName === 'files-public-files'
        ) {
          return acc
        }

        if (uppyResource.meta.routeName === 'files-spaces-personal') {
          targetUploadSpace = this.spaces.find((space) => space.driveType === 'personal')
        } else {
          targetUploadSpace = this.spaces.find(
            (space) => space.id === uppyResource.meta.routeStorageId
          )
        }

        if (!targetUploadSpace) {
          return acc
        }

        const matchingMappingRecord = acc.find(
          (mappingRecord) => mappingRecord.space.id === targetUploadSpace.id
        )

        if (!matchingMappingRecord) {
          acc.push({
            space: targetUploadSpace,
            uploadSize: uppyResource.data.size
          })
          return acc
        }

        matchingMappingRecord.uploadSize += uppyResource.data.size

        return acc
      }, [])

      uploadSizeSpaceMapping.forEach(({ space, uploadSize }) => {
        if (space.spaceQuota.remaining && space.spaceQuota.remaining < uploadSize) {
          let spaceName = space.name

          if (space.driveType === 'personal') {
            spaceName = this.$gettext('Personal')
          }

          const translated = this.$gettext(
            'There is not enough quota on %{spaceName}, you need additional %{missingSpace} to upload these files'
          )

          this.showMessage({
            title: this.$gettext('Not enough quota'),
            desc: this.$gettextInterpolate(translated, {
              spaceName,
              missingSpace: filesize((space.spaceQuota.remaining - uploadSize) * -1)
            }),
            status: 'danger'
          })

          quotaExceeded = true
        }
      })

      return quotaExceeded
    },

    async handleUppyFileUpload(files: UppyResource[]) {
      this.$uppyService.publish('uploadStarted')
      await this.createDirectoryTree(files)
      this.$uppyService.publish('addedForUpload', files)
      this.$uppyService.uploadFiles(files)
    },

    async displayOverwriteDialog(
      files: UppyResource[],
      conflicts,
      resolveFileExistsMethod: FileExistsResolver
    ) {
      let count = 0
      const allConflictsCount = conflicts.length
      const resolvedFileConflicts = []
      const resolvedFolderConflicts = []
      let doForAllConflicts = false
      let allConflictsStrategy
      let doForAllConflictsFolders = false
      let allConflictsStrategyFolders

      for (const conflict of conflicts) {
        const isFolder = conflict.type === 'folder'
        const conflictArray = isFolder ? resolvedFolderConflicts : resolvedFileConflicts

        if (doForAllConflicts && !isFolder) {
          conflictArray.push({
            name: conflict.name,
            strategy: allConflictsStrategy
          })
          continue
        }
        if (doForAllConflictsFolders && isFolder) {
          conflictArray.push({
            name: conflict.name,
            strategy: allConflictsStrategyFolders
          })
          continue
        }

        const resolvedConflict: ResolveConflict = await resolveFileExistsMethod(
          this.createModal,
          this.hideModal,
          { name: conflict.name, isFolder } as Resource,
          allConflictsCount - count,
          this.$gettext,
          this.$gettextInterpolate,
          false,
          isFolder
        )
        count++
        if (resolvedConflict.doForAllConflicts) {
          if (isFolder) {
            doForAllConflictsFolders = true
            allConflictsStrategyFolders = resolvedConflict.strategy
          } else {
            doForAllConflicts = true
            allConflictsStrategy = resolvedConflict.strategy
          }
        }

        conflictArray.push({
          name: conflict.name,
          strategy: resolvedConflict.strategy
        })
      }
      const filesToSkip = resolvedFileConflicts
        .filter((e) => e.strategy === ResolveStrategy.SKIP)
        .map((e) => e.name)
      const foldersToSkip = resolvedFolderConflicts
        .filter((e) => e.strategy === ResolveStrategy.SKIP)
        .map((e) => e.name)

      files = files.filter((e) => !filesToSkip.includes(e.name))
      files = files.filter(
        (file) =>
          !foldersToSkip.some((folderName) => file.meta.relativeFolder.split('/')[1] === folderName)
      )

      const filesToKeepBoth = resolvedFileConflicts
        .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
        .map((e) => e.name)
      const foldersToKeepBoth = resolvedFolderConflicts
        .filter((e) => e.strategy === ResolveStrategy.KEEP_BOTH)
        .map((e) => e.name)

      for (const fileName of filesToKeepBoth) {
        const file = files.find((e) => e.name === fileName && !e.meta.relativeFolder)
        const extension = extractExtensionFromFile({ name: fileName } as Resource)
        file.name = resolveFileNameDuplicate(fileName, extension, this.files)
      }
      for (const folder of foldersToKeepBoth) {
        const filesInFolder = files.filter((e) => e.meta.relativeFolder.split('/')[1] === folder)
        for (const file of filesInFolder) {
          const newFolderName = resolveFileNameDuplicate(folder, '', this.files)
          file.meta.relativeFolder = file.meta.relativeFolder.replace(
            `/${folder}`,
            `/${newFolderName}`
          )
          file.meta.relativePath = file.meta.relativePath.replace(
            `/${folder}/`,
            `/${newFolderName}/`
          )
          file.meta.tusEndpoint = file.meta.tusEndpoint.replace(`/${folder}`, `/${newFolderName}`)
          const data = file.data as any
          data.relativePath = data.relativePath.replace(`/${folder}/`, `/${newFolderName}/`)
          file.meta.routeItem = `/${newFolderName}`
        }
      }

      if (files.length === 0) return
      this.handleUppyFileUpload(files)
    }
  }
})
</script>
<style lang="scss">
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

  .create-list-folder button {
    margin-bottom: 8px;
  }

  .create-list-file:nth-child(2) button {
    margin-top: 6px;
  }
}

#upload-list,
#new-file-menu-drop {
  min-width: 230px;
}

#create-list,
#upload-list,
#new-file-menu-drop {
  .oc-icon-m svg {
    height: 100% !important;
  }
}

#clipboard-btns {
  flex-flow: inherit;

  :nth-child(1) {
    border-right: 0px !important;
    white-space: nowrap;
  }

  :nth-child(2) {
    border-left: 0px !important;
  }
}

.create-and-upload-actions {
  gap: var(--oc-space-small);
  @media only screen and (min-width: 1000px) {
    gap: var(--oc-space-medium);
  }
}
</style>
