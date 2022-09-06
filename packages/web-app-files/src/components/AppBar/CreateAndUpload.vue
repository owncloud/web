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
              <span v-text="$gettext('Folder')" />
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
                <span v-text="$gettextInterpolate($gettext('%{name}'), { name: mimetype.name })" />
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
    <div
      v-if="showPasteHereButton"
      id="clipboard-btns"
      v-oc-tooltip="
        uploadOrFileCreationBlocked ? $gettext('You have no permission to paste files here!') : ''
      "
      class="oc-button-group"
      :class="{ disabled: uploadOrFileCreationBlocked }"
    >
      <oc-button
        :disabled="uploadOrFileCreationBlocked"
        class="paste-files-btn"
        @click="pasteFilesHere"
      >
        <oc-icon fill-type="line" name="clipboard" />
        <span v-translate>Paste here</span>
      </oc-button>
      <oc-button
        :disabled="uploadOrFileCreationBlocked"
        class="clear-clipboard-btn"
        @click="clearClipboardFiles"
      >
        <oc-icon fill-type="line" name="close" />
      </oc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
import { join } from 'path'

import MixinFileActions, { EDITOR_MODE_CREATE } from '../../mixins/fileActions'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import { useActiveLocation } from '../../composables'

import {
  useRequest,
  useCapabilityShareJailEnabled,
  useCapabilitySpacesEnabled,
  useStore,
  useUserContext,
  useGraphClient
} from 'web-pkg/src/composables'

import ResourceUpload from './Upload/ResourceUpload.vue'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  PropType
} from 'vue'
import { useUpload } from 'web-runtime/src/composables/upload'
import { useUploadHelpers } from '../../composables/upload'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { extractNameWithoutExtension, SpaceResource } from 'web-client/src/helpers'
import { resolveFileNameDuplicate, ResourcesUpload } from '../../helpers/resource'
import { WebDAV } from 'web-client/src/webdav'
import { configurationManager } from 'web-pkg/src/configuration'
import { urlJoin } from 'web-client/src/utils'
import { stringify } from 'qs'
import { useService } from 'web-pkg/src/composables/service'
import { UppyService } from 'web-runtime/src/services/uppyService'
import { getIndicators } from 'web-app-files/src/helpers/statusIndicators'
import { useScrollTo } from 'web-app-files/src/composables/scrollTo'

export default defineComponent({
  components: {
    ResourceUpload
  },
  mixins: [MixinFileActions],
  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: true
    },
    item: {
      type: String,
      required: false,
      default: null
    },
    limitedScreenSpace: {
      type: Boolean,
      default: false,
      required: false
    },
    itemId: {
      type: [String, Number],
      required: false,
      default: null
    }
  },
  setup(props) {
    const instance = getCurrentInstance().proxy as any
    const uppyService = useService<UppyService>('$uppyService')
    const store = useStore()
    let filesSelectedSub
    let uploadCompletedSub

    onMounted(() => {
      filesSelectedSub = uppyService.subscribe('filesSelected', instance.onFilesSelected)
      uploadCompletedSub = uppyService.subscribe('uploadCompleted', instance.onUploadComplete)

      uppyService.useDropTarget({
        targetSelector: '#files-view',
        uppyService
      })
    })

    onBeforeUnmount(() => {
      uppyService.unsubscribe('filesSelected', filesSelectedSub)
      uppyService.unsubscribe('uploadCompleted', uploadCompletedSub)
      uppyService.removeDropTarget()
    })

    return {
      ...useScrollTo(),
      ...useUpload({
        uppyService
      }),
      ...useUploadHelpers({
        uppyService,
        space: computed(() => props.space),
        currentFolder: computed(() => props.item),
        currentFolderId: computed(() => props.itemId)
      }),
      ...useRequest(),
      ...useGraphClient(),
      isPublicLocation: useActiveLocation(isLocationPublicActive, 'files-public-link'),
      isSpacesGenericLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-generic'),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasSpaces: useCapabilitySpacesEnabled(),
      isUserContext: useUserContext({ store })
    }
  },
  data: () => ({
    newFileAction: null
  }),
  computed: {
    ...mapGetters(['capabilities', 'configuration', 'newFileHandlers', 'user']),
    ...mapGetters('Files', [
      'ancestorMetaData',
      'files',
      'currentFolder',
      'selectedFiles',
      'clipboardResources'
    ]),
    ...mapState('Files', ['areFileExtensionsShown']),
    ...mapGetters('runtime/spaces', ['spaces']),

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
      return !(this.uploadOrFileCreationBlocked && this.isPublicLocation)
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
    },

    loadIndicatorsForNewFile() {
      return this.isSpacesGenericLocation && this.space.driveType !== 'share'
    }
  },
  methods: {
    ...mapActions('Files', ['clearClipboardFiles', 'pasteSelectedFiles']),
    ...mapActions(['showMessage', 'createModal', 'setModalInputErrorMessage', 'hideModal']),
    ...mapMutations('Files', ['UPSERT_RESOURCE']),
    ...mapMutations('runtime/spaces', ['UPDATE_SPACE_FIELD']),
    ...mapMutations(['SET_QUOTA']),

    pasteFilesHere() {
      this.pasteSelectedFiles({
        targetSpace: this.space,
        clientService: this.$clientService,
        createModal: this.createModal,
        hideModal: this.hideModal,
        showMessage: this.showMessage,
        $gettext: this.$gettext,
        $gettextInterpolate: this.$gettextInterpolate,
        $ngettext: this.$ngettext
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

        const { spaceId, currentFolder, currentFolderId } = file.meta
        if (!['public', 'share'].includes(file.meta.driveType)) {
          if (this.hasSpaces) {
            const driveResponse = await this.graphClient.drives.getDrive(spaceId)
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

        const sameFolder = this.itemId
          ? currentFolderId === this.itemId
          : currentFolder === this.item
        const fileIsInCurrentPath = spaceId === this.space.id && sameFolder
        if (fileIsInCurrentPath) {
          eventBus.publish('app.files.list.load')
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

    async addNewFolder(folderName) {
      const resource = await this.addNewFolderInner(folderName)
      if (resource && resource.id) {
        this.scrollToResource({
          id: resource.id
        })
      }
    },
    async addNewFolderInner(folderName) {
      if (folderName === '') {
        return
      }

      try {
        const path = join(this.item, folderName)
        const resource = await (this.$clientService.webdav as WebDAV).createFolder(this.space, {
          path
        })

        if (this.loadIndicatorsForNewFile) {
          resource.indicators = getIndicators({ resource, ancestorMetaData: this.ancestorMetaData })
        }

        this.UPSERT_RESOURCE(resource)
        this.hideModal()

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

      try {
        const path = join(this.item, fileName)
        const resource = await (this.$clientService.webdav as WebDAV).putFileContents(this.space, {
          path
        })

        if (this.loadIndicatorsForNewFile) {
          resource.indicators = getIndicators({ resource, ancestorMetaData: this.ancestorMetaData })
        }

        this.UPSERT_RESOURCE(resource)

        if (this.newFileAction) {
          this.$_fileActions_openEditor(
            this.newFileAction,
            this.space.getDriveAliasAndItem(resource),
            resource.webDavPath,
            resource.fileId,
            EDITOR_MODE_CREATE
          )
          this.hideModal()

          return
        }

        this.hideModal()
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
    async addAppProviderFile(fileName) {
      // FIXME: this belongs in web-app-external, but the app provider handles file creation differently than other editor extensions. Needs more refactoring.
      if (fileName === '') {
        return
      }
      try {
        const baseUrl = urlJoin(
          configurationManager.serverUrl,
          this.capabilities.files.app_providers[0].new_url
        )
        const query = stringify({
          parent_container_id: this.currentFolder.fileId,
          filename: fileName
        })
        const url = `${baseUrl}?${query}`
        const response = await this.makeRequest('POST', url)

        if (response.status !== 200) {
          throw new Error(`An error has occurred: ${response.status}`)
        }

        const path = join(this.item, fileName) || ''
        const resource = await (this.$clientService.webdav as WebDAV).getFileInfo(this.space, {
          path
        })

        if (this.loadIndicatorsForNewFile) {
          resource.indicators = getIndicators({ resource, ancestorMetaData: this.ancestorMetaData })
        }

        this.$_fileActions_triggerDefaultAction({ space: this.space, resources: [resource] })
        this.UPSERT_RESOURCE(resource)
        this.hideModal()
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

    onFilesSelected(filesToUpload: File[]) {
      const uploader = new ResourcesUpload(
        filesToUpload,
        this.files,
        this.inputFilesToUppyFiles,
        this.$uppyService,
        this.space,
        this.item,
        this.itemId,
        this.spaces,
        this.hasSpaces,
        this.createDirectoryTree,
        this.createModal,
        this.hideModal,
        this.showMessage,
        this.$gettext,
        this.$ngettext,
        this.$gettextInterpolate
      )
      uploader.perform()
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

#clipboard-btns.disabled {
  opacity: 0.6;

  button {
    opacity: 1;
  }
}

.create-and-upload-actions {
  gap: var(--oc-space-small);
}
</style>
