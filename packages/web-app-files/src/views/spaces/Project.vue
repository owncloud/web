<template>
  <div class="space-overview">
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <not-found-message v-if="!space.id" class="space-not-found oc-height-1-1" />
      <div v-else-if="isSpaceRoot">
        <readme-content-modal
          v-if="readmeContentModalIsOpen"
          :cancel="closeReadmeContentModal"
          :space="space"
        ></readme-content-modal>
        <quota-modal v-if="quotaModalIsOpen" :cancel="closeQuotaModal" :space="space" />
        <div class="oc-px-m oc-mt-m" :class="{ 'oc-flex': !imageExpanded }">
          <div v-if="imageContent" :class="{ 'oc-width-1-4 oc-mr-l': !imageExpanded }">
            <img
              :class="{ expanded: imageExpanded }"
              class="space-overview-image oc-cursor-pointer"
              alt=""
              :src="imageContent"
              @click="toggleImageExpanded"
            />
          </div>
          <div :class="{ 'oc-width-3-4': !imageExpanded }">
            <div class="oc-flex oc-mb-s oc-flex-middle oc-flex-between">
              <div class="oc-flex oc-flex-middle">
                <h1 class="space-overview-name oc-text-truncate">{{ space.name }}</h1>
                <oc-button
                  :id="`space-context-btn`"
                  v-oc-tooltip="$gettext('Show context menu')"
                  :aria-label="$gettext('Show context menu')"
                  appearance="raw"
                  class="oc-ml-s"
                >
                  <oc-icon name="more-2" />
                </oc-button>
                <oc-drop
                  :drop-id="`space-context-drop`"
                  :toggle="`#space-context-btn`"
                  mode="click"
                  close-on-click
                  :options="{ delayHide: 0 }"
                  padding-size="small"
                  position="right-start"
                >
                  <input
                    id="space-image-upload-input"
                    ref="spaceImageInput"
                    type="file"
                    name="file"
                    multiple
                    tabindex="-1"
                    :accept="supportedSpaceImageMimeTypes"
                    @change="$_uploadImage_uploadImageSpace"
                  />
                  <ul class="oc-list oc-files-context-actions">
                    <li
                      v-for="(action, actionIndex) in getContextMenuActions(space)"
                      :key="`action-${actionIndex}`"
                      class="oc-spaces-context-action oc-py-xs oc-px-s"
                    >
                      <oc-button
                        appearance="raw"
                        justify-content="left"
                        @click="action.handler({ resources: [space] })"
                      >
                        <oc-icon :name="action.icon" />
                        {{ action.label() }}
                      </oc-button>
                    </li>
                  </ul>
                </oc-drop>
              </div>
              <oc-button
                v-if="memberCount"
                :aria-label="$gettext('Open context menu and show members')"
                appearance="raw"
                @click="openSidebarSharePanel"
              >
                <oc-icon name="group" fill-type="line" size="small" />
                <span
                  class="space-overview-people-count oc-text-small"
                  v-text="memberCountString"
                ></span>
              </oc-button>
            </div>
            <p v-if="space.description" class="oc-mt-rm">{{ space.description }}</p>
            <div>
              <!-- eslint-disable vue/no-v-html -->
              <div
                ref="markdownContainer"
                class="markdown-container"
                v-html="markdownContent"
              ></div>
              <!-- eslint-enable -->
              <div v-if="showMarkdownCollapse" class="markdown-collapse oc-text-center oc-mt-s">
                <oc-button appearance="raw" @click="toggleCollapseMarkdown">
                  <oc-icon :name="markdownCollapseIcon" />
                  <span>{{ markdownCollapseText }}</span>
                </oc-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <no-content-message v-if="isEmpty" id="files-space-empty" class="files-empty" icon="folder">
        <template #message>
          <p v-translate class="oc-text-muted">No resources found</p>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-spaces-table"
        v-model="selected"
        class="files-table oc-mt-xl"
        :resources="paginatedResources"
        :target-route="resourceTargetLocation"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @sort="handleSort"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
      >
        <template #contextMenu="{ resource }">
          <context-actions v-if="isResourceInSelection(resource)" :items="selected" />
        </template>
        <template #footer>
          <pagination :pages="paginationPages" :current-page="paginationPage" />
          <list-info
            v-if="paginatedResources.length > 0"
            class="oc-width-1-1 oc-my-s"
            :files="totalFilesCount.files"
            :folders="totalFilesCount.folders"
            :size="totalFilesSize"
          />
        </template>
      </resource-table>
    </template>
  </div>
</template>

<script>
import NoContentMessage from '../../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import ListLoader from '../../components/FilesList/ListLoader.vue'
import { computed, ref } from '@vue/composition-api'
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import { bus } from 'web-pkg/src/instance'
import { buildResource, buildWebDavSpacesPath } from '../../helpers/resources'
import { loadPreview } from '../../helpers/resource'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import { createLocationSpaces } from '../../router'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import MixinFileActions from '../../mixins/fileActions'
import { ImageDimension, ImageType } from '../../constants'
import debounce from 'lodash-es/debounce'
import { VisibilityObserver } from 'web-pkg/src/observer'
import Mixins from '../../mixins'
import Rename from '../../mixins/spaces/actions/rename'
import Delete from '../../mixins/spaces/actions/delete'
import DeletedFiles from '../../mixins/spaces/actions/deletedFiles'
import Disable from '../../mixins/spaces/actions/disable'
import Restore from '../../mixins/spaces/actions/restore'
import EditDescription from '../../mixins/spaces/actions/editDescription'
import ShowDetails from '../../mixins/spaces/actions/showDetails'
import UploadImage from '../../mixins/spaces/actions/uploadImage'
import EditQuota from '../../mixins/spaces/actions/editQuota'
import EditReadmeContent from '../../mixins/spaces/actions/editReadmeContent'
import QuotaModal from '../../components/Spaces/QuotaModal.vue'
import ReadmeContentModal from '../../components/Spaces/ReadmeContentModal.vue'
import { thumbnailService } from '../../services'
import { useResourcesViewDefaults } from '../../composables'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    NoContentMessage,
    ListLoader,
    NotFoundMessage,
    ResourceTable,
    ListInfo,
    Pagination,
    ContextActions,
    ReadmeContentModal,
    QuotaModal
  },
  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    Mixins,
    Rename,
    Delete,
    DeletedFiles,
    EditDescription,
    Disable,
    ShowDetails,
    Restore,
    UploadImage,
    EditReadmeContent,
    EditQuota
  ],
  provide() {
    return {
      currentSpace: computed(() => this.space)
    }
  },
  setup() {
    const space = ref({})

    return {
      ...useResourcesViewDefaults(),
      resourceTargetLocation: createLocationSpaces('files-spaces-project'),
      space
    }
  },
  data: function () {
    return {
      markdownContent: '',
      markdownCollapsed: true,
      markdownContainerCollapsedClass: 'collapsed',
      showMarkdownCollapse: false,
      markdownResizeObserver: new ResizeObserver(this.onMarkdownResize),
      imageExpanded: false,
      imageContent: null
    }
  },
  computed: {
    ...mapGetters('Files', [
      'highlightedFile',
      'selectedFiles',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['user', 'getToken']),

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SET_FILE_SELECTION(resources)
      }
    },
    isSpaceRoot() {
      return !this.$route.params.item
    },
    isEmpty() {
      return this.paginatedResources.length < 1
    },

    markdownCollapseIcon() {
      return this.markdownCollapsed === true ? 'add' : 'subtract'
    },
    markdownCollapseText() {
      return this.markdownCollapsed === true
        ? this.$gettext('Show more')
        : this.$gettext('Show less')
    },
    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    },
    memberCount() {
      return this.space.spaceMemberIds.length
    },
    memberCountString() {
      const translated = this.$ngettext('%{count} member', '%{count} members', this.memberCount)

      return this.$gettextInterpolate(translated, {
        count: this.memberCount
      })
    },
    quotaModalIsOpen() {
      return this.$data.$_editQuota_modalOpen
    },
    readmeContentModalIsOpen() {
      return this.$data.$_editReadmeContent_modalOpen
    },
    supportedSpaceImageMimeTypes() {
      return thumbnailService.getSupportedMimeTypes('image/').join(',')
    }
  },
  watch: {
    $route: {
      handler: function (to, from) {
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item

        if ((!sameRoute || !sameItem) && from) {
          this.loadResourcesTask.perform(this, sameRoute, to.params.item)
        }

        if (this.$refs.markdownContainer) {
          if (this.markdownResizeObserver) {
            this.markdownResizeObserver.unobserve(this.$refs.markdownContainer)
          }
          this.markdownResizeObserver.observe(this.$refs.markdownContainer)
        }
      },
      immediate: true
    },
    'space.spaceImageData': {
      handler: function (val) {
        if (!val) return
        const webDavPathComponents = this.space.spaceImageData.webDavUrl.split('/')
        const path = webDavPathComponents
          .slice(webDavPathComponents.indexOf(this.space.id) + 1)
          .join('/')

        this.$client.files.fileInfo(buildWebDavSpacesPath(this.space.id, path)).then((data) => {
          const resource = buildResource(data)
          loadPreview({
            resource,
            isPublic: false,
            dimensions: ImageDimension.Preview,
            server: this.configuration.server,
            userId: this.user.id,
            token: this.getToken
          }).then((imageBlob) => {
            this.imageContent = imageBlob
          })
        })
      },
      deep: true
    },
    'space.spaceReadmeData': {
      handler: function (val) {
        if (!val) {
          return
        }
        const webDavPathComponents = this.space.spaceReadmeData.webDavUrl.split('/')
        const path = webDavPathComponents
          .slice(webDavPathComponents.indexOf(this.space.id) + 1)
          .join('/')

        this.$client.files
          .getFileContents(buildWebDavSpacesPath(this.space.id, path))
          .then((fileContents) => {
            if (this.markdownResizeObserver && this.$refs.markdownContainer) {
              this.markdownResizeObserver.unobserve(this.$refs.markdownContainer)
            }
            const parsedMarkdown = marked.parse(fileContents)
            // Sanitize markdown content to prevent XSS vulnerabilities
            this.markdownContent = sanitizeHtml(parsedMarkdown)

            if (this.markdownContent) {
              this.markdownResizeObserver.observe(this.$refs.markdownContainer)
            }
          })
      },
      deep: true
    }
  },
  async mounted() {
    await this.loadResourcesTask.perform(this, false, this.$route.params.item || '')

    document.title = `${this.space.name} - ${this.$route.meta.title}`
    this.$route.params.name = this.space.name

    const loadSpaceEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
    })

    this.$on('beforeDestroy', () => {
      bus.unsubscribe('app.files.list.load', loadSpaceEventToken)
    })
  },
  beforeDestroy() {
    visibilityObserver.disconnect()

    if (this.$refs.markdownContainer) {
      this.markdownResizeObserver.unobserve(this.$refs.markdownContainer)
    }
  },
  methods: {
    ...mapActions('Files', ['loadIndicators', 'loadPreview', 'loadCurrentFileOutgoingShares']),
    ...mapActions('Files/sidebar', {
      openSidebarWithPanel: 'openWithPanel'
    }),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'REMOVE_FILE',
      'REMOVE_FILE_FROM_SEARCHED',
      'SET_FILE_SELECTION',
      'REMOVE_FILE_SELECTION'
    ]),
    getContextMenuActions(space) {
      return [
        ...this.$_rename_items,
        ...this.$_editDescription_items,
        ...this.$_editReadmeContent_items,
        ...this.$_uploadImage_items,
        ...this.$_editQuota_items,
        ...this.$_deletedFiles_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items,
        ...this.$_showDetails_items
      ].filter((item) => item.isEnabled({ resources: [space] }))
    },

    rowMounted(resource, component) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: false,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    },
    toggleCollapseMarkdown() {
      this.markdownCollapsed = !this.markdownCollapsed
      return this.$refs.markdownContainer.classList.toggle(this.markdownContainerCollapsedClass)
    },
    toggleImageExpanded() {
      this.imageExpanded = !this.imageExpanded
    },
    onMarkdownResize() {
      if (!this.$refs.markdownContainer) {
        return
      }

      this.$refs.markdownContainer.classList.remove(this.markdownContainerCollapsedClass)
      const markdownContainerHeight = this.$refs.markdownContainer.offsetHeight

      if (markdownContainerHeight < 150) {
        return (this.showMarkdownCollapse = false)
      }

      this.showMarkdownCollapse = true

      if (this.markdownCollapsed) {
        this.$refs.markdownContainer.classList.add(this.markdownContainerCollapsedClass)
      }
    },
    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    },
    closeQuotaModal() {
      this.$_editQuota_closeModal()
    },
    openSidebarSharePanel() {
      this.SET_FILE_SELECTION([this.space])
      this.openSidebarWithPanel('space-share-item')
    },
    closeReadmeContentModal() {
      this.$_editReadmeContent_closeModal()
    }
  }
}
</script>

<style lang="scss">
.space-overview {
  &-image {
    border-radius: 10px;
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
  }

  &-image.expanded {
    max-height: 100%;
    max-width: 100%;
  }

  &-name {
    font-size: 1.5rem;
  }

  &-people-count {
    white-space: nowrap;
  }

  .markdown-container.collapsed {
    max-height: 150px;
    overflow: hidden;
    -webkit-mask-image: linear-gradient(180deg, #000 90%, transparent);
  }

  #space-image-upload-button {
    right: 0;
  }

  #space-image-upload-input {
    position: absolute;
    left: -99999px;
  }
}
</style>
