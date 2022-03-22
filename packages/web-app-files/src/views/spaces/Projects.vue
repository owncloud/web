<template>
  <div class="oc-py-s oc-px-m">
    <oc-button
      v-if="hasCreatePermission"
      id="new-space-menu-btn"
      ref="createNewSpaceButton"
      key="new-space-menu-btn-enabled"
      variation="primary"
      appearance="filled"
      :aria-label="$gettext('Create a new space')"
      class="oc-mb-l"
      data-testid="spaces-list-create-space-btn"
      @click="showCreateSpaceModal"
    >
      <oc-icon name="add" />
      <translate>Create Space</translate>
    </oc-button>
    <div class="oc-pb-xl oc-border-b">
      <span
        v-text="$gettext('Store your project related files in Spaces for seamless collaboration.')"
      />
      <!-- <a href="#" v-text="$gettext('Learn more about spaces.')" /> -->
    </div>
    <app-loading-spinner v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <no-content-message
        v-if="!spaces.length"
        id="files-spaces-empty"
        class="files-empty"
        icon="layout-grid"
      >
        <template #message>
          <span v-translate>You don't have access to any spaces</span>
        </template>
      </no-content-message>
      <div v-else class="spaces-list oc-mt-l">
        <input
          id="space-image-upload-input"
          ref="spaceImageInput"
          type="file"
          name="file"
          multiple
          tabindex="-1"
          accept="image/*"
          @change="$_uploadImage_uploadImageSpace"
        />
        <quota-modal
          v-if="quotaModalIsOpen"
          :cancel="closeQuotaModal"
          :space="quotaModalSelectedSpace"
        />
        <ul
          class="
            oc-grid
            oc-grid-match
            oc-grid-column-small
            oc-grid-row-large
            oc-text-center
            oc-child-width-1-3@m
            oc-child-width-1-4@l
            oc-child-width-1-5@xl
          "
        >
          <li v-for="space in spaces" :key="space.id" class="oc-mb-m">
            <div
              class="spaces-list-card oc-card oc-card-default oc-rounded"
              :class="getSpaceCardAdditionalClass(space)"
            >
              <div class="oc-card-media-top oc-border-b">
                <router-link :to="getSpaceProjectRoute(space)">
                  <oc-tag
                    v-if="space.disabled"
                    class="oc-position-absolute space-disabled-indicator"
                    type="span"
                  >
                    <span v-translate>Disabled</span>
                  </oc-tag>
                  <img
                    v-if="imageContentObject[space.id]"
                    class="space-image oc-rounded-top"
                    :src="imageContentObject[space.id]['data']"
                    alt=""
                  />
                  <oc-icon
                    v-else
                    name="layout-grid"
                    size="xxlarge"
                    class="space-default-image oc-px-m oc-py-m"
                  />
                </router-link>
              </div>
              <div class="oc-card-body oc-p-s">
                <div class="oc-flex oc-flex-between oc-flex-middle">
                  <div class="oc-flex oc-flex-middle">
                    <oc-icon class="oc-mr-s" name="layout-grid" />
                    <router-link class="space-name oc-text-left" :to="getSpaceProjectRoute(space)">
                      <span v-text="space.name"> </span>
                    </router-link>
                  </div>
                  <div class="oc-flex oc-flex-middle">
                    <div>
                      <oc-button
                        v-oc-tooltip="$gettext('Show members')"
                        :aria-label="$gettext('Show members')"
                        appearance="raw"
                        @click="openSidebarSharePanel(space)"
                      >
                        <oc-icon name="group" />
                      </oc-button>
                    </div>
                    <div>
                      <oc-button
                        :id="`space-context-btn-${sanitizeStorageId(space.id)}`"
                        v-oc-tooltip="$gettext('Show context menu')"
                        :aria-label="$gettext('Show context menu')"
                        appearance="raw"
                      >
                        <oc-icon name="more-2" />
                      </oc-button>
                      <oc-drop
                        :drop-id="`space-context-drop-${space.id}`"
                        :toggle="`#space-context-btn-${sanitizeStorageId(space.id)}`"
                        mode="click"
                        close-on-click
                        :options="{ delayHide: 0 }"
                        padding-size="small"
                        position="bottom-end"
                      >
                        <ul class="oc-list oc-files-context-actions">
                          <li
                            v-for="(action, actionIndex) in getContextMenuActions(space)"
                            :key="`action-${actionIndex}`"
                            class="oc-files-context-action oc-px-s"
                          >
                            <oc-button
                              appearance="raw"
                              justify-content="left"
                              @click="action.handler({ resources: [space] })"
                            >
                              <oc-icon :name="action.icon" fill-type="line" class="oc-flex" />
                              {{ action.label() }}
                            </oc-button>
                          </li>
                        </ul>
                      </oc-drop>
                    </div>
                  </div>
                </div>
                <p
                  v-if="space.description"
                  class="oc-text-left oc-ml-xs oc-mt-xs oc-mb-rm oc-text-truncate"
                >
                  <small v-text="space.description"></small>
                </p>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<script>
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import { computed } from '@vue/composition-api'
import { useStore } from 'web-pkg/src/composables'
import { useTask } from 'vue-concurrency'
import { createLocationSpaces } from '../../router'
import { mapMutations, mapActions, mapGetters } from 'vuex'
import Rename from '../../mixins/spaces/actions/rename'
import Delete from '../../mixins/spaces/actions/delete'
import DeletedFiles from '../../mixins/spaces/actions/deletedFiles'
import Disable from '../../mixins/spaces/actions/disable'
import Restore from '../../mixins/spaces/actions/restore'
import EditDescription from '../../mixins/spaces/actions/editDescription'
import EditQuota from '../../mixins/spaces/actions/editQuota'
import ShowDetails from '../../mixins/spaces/actions/showDetails'
import UploadImage from '../../mixins/spaces/actions/uploadImage'
import { buildResource, buildSpace, buildWebDavSpacesPath } from '../../helpers/resources'
import { clientService } from 'web-pkg/src/services'
import { loadPreview } from '../../helpers/resource'
import { ImageDimension } from '../../constants'
import QuotaModal from '../../components/Spaces/QuotaModal.vue'

export default {
  components: {
    NoContentMessage,
    QuotaModal,
    AppLoadingSpinner
  },
  mixins: [
    Rename,
    Delete,
    EditDescription,
    EditQuota,
    DeletedFiles,
    Disable,
    ShowDetails,
    Restore,
    UploadImage
  ],
  setup() {
    const store = useStore()
    const spaces = computed(() => store.getters['Files/activeFiles'] || [])
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const loadResourcesTask = useTask(function* (signal, ref) {
      ref.CLEAR_CURRENT_FILES_LIST()

      const response = yield graphClient.drives.listMyDrives('name asc', 'driveType eq project')
      let loadedSpaces = response.data?.value || []

      loadedSpaces = loadedSpaces.map(buildSpace)
      ref.LOAD_FILES({ currentFolder: null, files: loadedSpaces })
    })

    return {
      spaces,
      graphClient,
      loadResourcesTask
    }
  },
  data: function () {
    return {
      imageContentObject: {}
    }
  },
  computed: {
    ...mapGetters(['user', 'getToken']),
    hasCreatePermission() {
      // @TODO
      return true
    },
    quotaModalSelectedSpace() {
      return this.$data.$_editQuota_selectedSpace
    },
    quotaModalIsOpen() {
      return this.$data.$_editQuota_modalOpen
    }
  },
  watch: {
    spaces: {
      handler: function (val) {
        if (!val) return

        for (const space of this.spaces) {
          if (!space.spaceImageData) {
            continue
          }

          if (this.imageContentObject[space.id]?.fileId === space.spaceImageData?.id) {
            continue
          }

          const webDavPathComponents = space.spaceImageData.webDavUrl.split('/')
          const path = webDavPathComponents
            .slice(webDavPathComponents.indexOf(space.id) + 1)
            .join('/')

          this.$client.files.fileInfo(buildWebDavSpacesPath(space.id, path)).then((fileInfo) => {
            const resource = buildResource(fileInfo)
            loadPreview({
              resource,
              isPublic: false,
              dimensions: ImageDimension.Preview,
              server: this.configuration.server,
              userId: this.user.id,
              token: this.getToken
            }).then((imageBlob) => {
              this.$set(this.imageContentObject, space.id, {
                fileId: space.spaceImageData.id,
                data: imageBlob
              })
            })
          })
        }
      },
      deep: true
    }
  },
  created() {
    this.loadResourcesTask.perform(this)
  },
  methods: {
    ...mapActions(['createModal', 'hideModal', 'setModalInputErrorMessage']),
    ...mapActions('Files/sidebar', {
      openSidebarWithPanel: 'openWithPanel'
    }),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'SET_FILE_SELECTION',
      'UPSERT_RESOURCE'
    ]),

    getContextMenuActions(space) {
      return [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_uploadImage_items,
        ...this.$_editQuota_items,
        ...this.$_deletedFiles_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items,
        ...this.$_showDetails_items
      ].filter((item) => item.isEnabled({ resources: [space] }))
    },

    getSpaceProjectRoute({ id, name }) {
      return createLocationSpaces('files-spaces-project', {
        params: { storageId: id, name }
      })
    },

    showCreateSpaceModal() {
      const modal = {
        variation: 'passive',
        title: this.$gettext('Create a new space'),
        cancelText: this.$gettext('Cancel'),
        confirmText: this.$gettext('Create'),
        hasInput: true,
        inputLabel: this.$gettext('Space name'),
        inputValue: this.$gettext('New space'),
        onCancel: this.hideModal,
        onConfirm: this.addNewSpace,
        onInput: this.checkSpaceName
      }

      this.createModal(modal)
    },

    checkSpaceName(name) {
      if (name.trim() === '') {
        this.setModalInputErrorMessage(this.$gettext('Space name cannot be empty'))
      }
      return this.setModalInputErrorMessage(null)
    },

    addNewSpace(name) {
      this.$refs.createNewSpaceButton.$el.blur()

      return this.graphClient.drives
        .createDrive({ name }, {})
        .then(({ data: space }) => {
          this.hideModal()
          const resource = buildSpace(space)
          this.UPSERT_RESOURCE(resource)
          this.spaces.sort((a, b) => a.name.localeCompare(b.name))

          this.$client.files.createFolder(`spaces/${space.id}/.space`).then(() => {
            this.$client.files
              .putFileContents(
                `spaces/${space.id}/.space/readme.md`,
                `### 👋 ${this.$gettext('Hello!')}\r\n${this.$gettext(
                  'Add a description to welcome the members of the Space.'
                )}\r\n${this.$gettext(
                  'Use markdown to format your text. [More info]'
                )}(https://www.markdownguide.org/basic-syntax/)`
              )
              .then((markdown) => {
                this.graphClient.drives
                  .updateDrive(
                    space.id,
                    {
                      special: [
                        {
                          specialFolder: {
                            name: 'readme'
                          },
                          id: markdown['OC-FileId']
                        }
                      ]
                    },
                    {}
                  )
                  .then(({ data }) => {
                    this.UPDATE_RESOURCE_FIELD({
                      id: space.id,
                      field: 'spaceReadmeData',
                      value: data.special.find((special) => special.specialFolder.name === 'readme')
                    })
                  })
              })
          })
        })
        .catch((error) => {
          this.showMessage({
            title: this.$gettext('Creating space failed…'),
            desc: error,
            status: 'danger'
          })
        })
    },

    sanitizeStorageId(id) {
      return id.replace('!', '\\!').split('.')[0]
    },

    getSpaceCardAdditionalClass(space) {
      if (space.disabled) {
        return 'state-trashed'
      }
      return ''
    },

    openSidebarSharePanel(space) {
      this.SET_FILE_SELECTION([space])
      this.openSidebarWithPanel('space-share-item')
    },

    closeQuotaModal() {
      this.$_editQuota_closeModal()
    }
  }
}
</script>

<style lang="scss">
#files-spaces-empty {
  height: 50vh;
}

.spaces-list {
  &-card {
    box-shadow: none !important;
    background-color: var(--oc-color-background-highlight) !important;
  }

  &-card.state-trashed {
    .space-image,
    .space-default-image > svg {
      filter: grayscale(100%);
      opacity: 80%;
    }
  }

  .oc-card-media-top {
    width: 100%;
    height: 150px;
  }

  .oc-card-media-top a {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }

  .oc-tag {
    color: var(--oc-color-text-default);
  }

  .space-image {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  .space-name {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: var(--oc-color-text-default);
  }

  .space-disabled-indicator {
    z-index: 999;
  }

  #space-image-upload-input {
    position: absolute;
    left: -99999px;
  }
}
</style>
