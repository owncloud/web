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
            <oc-button id="new-folder-btn" appearance="raw" @click="createNewFolderAction">
              <oc-resource-icon :resource="folderIconResource" size="medium" />
              <span v-text="$gettext('Folder')" />
            </oc-button>
          </li>
          <li
            v-for="(fileAction, key) in createNewFileActions"
            :key="`file-creation-item-${key}`"
            class="create-list-file oc-menu-item-hover"
          >
            <oc-button
              appearance="raw"
              :class="['new-file-btn-' + fileAction.ext]"
              @click="fileAction.handler"
            >
              <oc-resource-icon :resource="getIconResource(fileAction)" size="medium" />
              <span>{{ fileAction.label() }}</span>
            </oc-button>
          </li>
          <template v-if="mimetypesAllowedForCreation">
            <li
              v-for="(mimeTypeAction, key) in createNewFileMimeTypeActions"
              :key="`file-creation-item-external-${key}`"
              class="create-list-file oc-menu-item-hover"
            >
              <oc-button appearance="raw" @click="mimeTypeAction.handler">
                <oc-resource-icon :resource="getIconResource(mimeTypeAction)" size="medium" />
                <span v-text="$gettext(mimeTypeAction.label())" />
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
          @click="createNewFolderAction"
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
import { mapActions, mapGetters, mapMutations } from 'vuex'

import { useFileActions } from '../../composables/actions/files/useFileActions'
import { isLocationPublicActive, isLocationSpacesActive } from '../../router'
import {
  useActiveLocation,
  useFileActionsCreateNewFile,
  useFileActionsCreateNewFolder
} from '../../composables'

import {
  useRequest,
  useCapabilityShareJailEnabled,
  useCapabilitySpacesEnabled,
  useStore,
  useUserContext,
  useClientService
} from 'web-pkg/src/composables'

import ResourceUpload from './Upload/ResourceUpload.vue'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onBeforeUnmount,
  PropType,
  unref,
  watch
} from 'vue'
import { useUpload } from 'web-runtime/src/composables/upload'
import { useUploadHelpers } from '../../composables/upload'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { Resource, SpaceResource } from 'web-client/src/helpers'
import { ResourcesUpload } from '../../helpers/resource'
import { useService } from 'web-pkg/src/composables/service'
import { UppyService } from 'web-runtime/src/services/uppyService'

export default defineComponent({
  components: {
    ResourceUpload
  },
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
    const clientService = useClientService()
    const store = useStore()

    let filesSelectedSub
    let uploadCompletedSub

    const { actions: createNewFolder } = useFileActionsCreateNewFolder({
      store,
      space: props.space
    })
    const createNewFolderAction = computed(() => unref(createNewFolder)[0].handler)

    const newFileHandlers = computed(() => store.getters.newFileHandlers)

    const { actions: createNewFileActions } = useFileActionsCreateNewFile({
      store,
      space: props.space,
      newFileHandlers: newFileHandlers
    })

    const mimetypesAllowedForCreation = computed(() => {
      const mimeTypes = store.getters['External/mimeTypes']
      if (!mimeTypes) {
        return []
      }
      return mimeTypes.filter((mimetype) => mimetype.allow_creation) || []
    })

    const { actions: createNewFileMimeTypeActions } = useFileActionsCreateNewFile({
      store,
      space: props.space,
      mimetypesAllowedForCreation: mimetypesAllowedForCreation
    })

    const currentFolder = computed(() => {
      return store.getters['Files/currentFolder']
    })
    const canUpload = computed(() => {
      return unref(currentFolder)?.canUpload({ user: store.getters.user })
    })

    onMounted(() => {
      filesSelectedSub = uppyService.subscribe('filesSelected', instance.onFilesSelected)
      uploadCompletedSub = uppyService.subscribe('uploadCompleted', instance.onUploadComplete)
    })

    onBeforeUnmount(() => {
      uppyService.unsubscribe('filesSelected', filesSelectedSub)
      uppyService.unsubscribe('uploadCompleted', uploadCompletedSub)
      uppyService.removeDropTarget()
    })

    watch(
      canUpload,
      () => {
        if (unref(canUpload)) {
          uppyService.useDropTarget({ targetSelector: '#files-view', uppyService })
        } else {
          uppyService.removeDropTarget()
        }
      },
      { immediate: true }
    )

    return {
      ...useFileActions({ store }),
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
      clientService,
      isPublicLocation: useActiveLocation(isLocationPublicActive, 'files-public-link'),
      isSpacesGenericLocation: useActiveLocation(isLocationSpacesActive, 'files-spaces-generic'),
      hasShareJail: useCapabilityShareJailEnabled(),
      hasSpaces: useCapabilitySpacesEnabled(),
      isUserContext: useUserContext({ store }),
      canUpload,
      currentFolder,
      createNewFileActions,
      createNewFileMimeTypeActions,
      createNewFolder,
      mimetypesAllowedForCreation,
      createNewFolderAction
    }
  },
  data: () => ({
    newFileAction: null
  }),
  computed: {
    ...mapGetters(['capabilities', 'configuration', 'newFileHandlers', 'user']),
    ...mapGetters('Files', ['ancestorMetaData', 'files', 'selectedFiles', 'clipboardResources']),
    ...mapGetters('runtime/spaces', ['spaces']),

    showPasteHereButton() {
      return this.clipboardResources && this.clipboardResources.length !== 0
    },
    hideButtonLabels() {
      return this.limitedScreenSpace && this.showPasteHereButton
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

    loadIndicatorsForNewFile() {
      return this.isSpacesGenericLocation && this.space.driveType !== 'share'
    },

    folderIconResource() {
      return { isFolder: true, extension: '' } as Resource
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
        clientService: this.clientService,
        loadingService: this.$loadingService,
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
            const client = this.clientService.graphAuthenticated
            const driveResponse = await client.drives.getDrive(spaceId)
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
    },

    getIconResource(fileHandler) {
      return { type: 'file', extension: fileHandler.ext } as Resource
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
