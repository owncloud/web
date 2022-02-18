<template>
  <div class="space-overview">
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <not-found-message v-if="!space.id" class="space-not-found oc-height-1-1" />
      <div v-else-if="isSpaceRoot">
        <oc-modal
          v-if="$data.$_editReadmeContent_modalOpen"
          :title="$gettext('Change description for space') + ' ' + space.name"
          :button-cancel-text="$gettext('Cancel')"
          :button-confirm-text="$gettext('Confirm')"
          @confirm="$_editReadmeContent_editReadmeContentSpace"
          @cancel="$_editReadmeContent_closeModal"
        >
          <template #content>
            <label v-translate class="oc-label" for="description-input-area"
              >Space description</label
            >
            <textarea
              id="description-input-area"
              v-model="$data.$_editReadmeContent_content"
              class="oc-width-1-1 oc-height-1-1 oc-text-input"
              rows="30"
            ></textarea>
          </template>
        </oc-modal>
        <div
          class="oc-grid oc-px-m oc-mt-m"
          :class="{ 'oc-child-width-1-1@s': imageExpanded, 'oc-child-width-1-3@s': !imageExpanded }"
        >
          <div v-if="imageContent">
            <div class="oc-position-relative">
              <img
                :class="{ expanded: imageExpanded }"
                class="space-overview-image oc-cursor-pointer"
                alt=""
                :src="'data:image/jpeg;base64,' + imageContent"
                @click="toggleImageExpanded"
              />
            </div>
          </div>
          <div>
            <div class="oc-flex oc-mb-s oc-flex-middle">
              <h1 class="space-overview-name oc-text-truncate">{{ space.name }}</h1>
              <oc-button
                :id="`space-context-btn`"
                v-oc-tooltip="$gettext('Show context menu')"
                :aria-label="$gettext('Show context menu')"
                appearance="raw"
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
                  accept="image/*"
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
                      @click="action.handler({ spaces: [space] })"
                    >
                      <oc-icon :name="action.icon" />
                      {{ action.label() }}
                    </oc-button>
                  </li>
                </ul>
              </oc-drop>
            </div>
            <p v-if="space.description" class="oc-mt-rm">{{ space.description }}</p>
            <div>
              <div
                ref="markdownContainer"
                class="markdown-container"
                v-html="markdownContent"
              ></div>
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
import { computed, ref, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { useStore, useRouter, useRouteQuery } from 'web-pkg/src/composables'
import marked from 'marked'
import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import { bus } from 'web-pkg/src/instance'
import { buildResource, buildSpace, buildWebDavSpacesPath } from '../../helpers/resources'
import ResourceTable, { determineSortFields } from '../../components/FilesList/ResourceTable.vue'
import { createLocationSpaces } from '../../router'
import { usePagination, useSort } from '../../composables'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import MixinFileActions from '../../mixins/fileActions'
import { ImageDimension, ImageType } from '../../constants'
import debounce from 'lodash-es/debounce'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { clientService } from 'web-pkg/src/services'
import Mixins from '../../mixins'
import Rename from '../../mixins/spaces/actions/rename'
import Delete from '../../mixins/spaces/actions/delete'
import Disable from '../../mixins/spaces/actions/disable'
import Restore from '../../mixins/spaces/actions/restore'
import EditDescription from '../../mixins/spaces/actions/editDescription'
import ShowDetails from '../../mixins/spaces/actions/showDetails'
import UploadImage from '../../mixins/spaces/actions/uploadImage'
import EditReadmeContent from '../../mixins/spaces/actions/editReadmeContent'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    NoContentMessage,
    ListLoader,
    NotFoundMessage,
    ResourceTable,
    ListInfo,
    Pagination,
    ContextActions
  },
  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    Mixins,
    Rename,
    Delete,
    EditDescription,
    Disable,
    ShowDetails,
    Restore,
    UploadImage,
    EditReadmeContent
  ],
  setup() {
    const router = useRouter()
    const store = useStore()

    const spaceId = router.currentRoute.params.spaceId

    const space = ref({})
    const graphClient = clientService.graphAuthenticated(
      store.getters.configuration.server,
      store.getters.getToken
    )

    const storeItems = computed(() => store.getters['Files/activeFiles'] || [])
    const fields = computed(() => {
      return determineSortFields(unref(storeItems)[0])
    })

    const { sortBy, sortDir, items, handleSort } = useSort({
      items: storeItems,
      fields
    })

    const paginationPageQuery = useRouteQuery('page', '1')
    const paginationPage = computed(() => parseInt(String(paginationPageQuery.value)))
    const { items: paginatedResources, total: paginationPages } = usePagination({
      page: paginationPage,
      items,
      sortDir,
      sortBy
    })

    const loadResourcesTask = useTask(function* (signal, ref, sameRoute, path = null) {
      ref.CLEAR_CURRENT_FILES_LIST()
      const graphResponse = yield graphClient.drives.getDrive(spaceId)

      if (!graphResponse.data) {
        return
      }

      space.value = buildSpace(graphResponse.data)

      const webDavResponse = yield ref.$client.files.list(
        buildWebDavSpacesPath(ref.$route.params.spaceId, path || '')
      )

      let resources = []
      if (!path) {
        // space front page -> use space as current folder
        resources.push(space.value)

        const webDavResources = webDavResponse.map(buildResource)
        webDavResources.shift() // Remove webdav entry for the space itself
        resources = resources.concat(webDavResources)
      } else {
        resources = webDavResponse.map(buildResource)
      }

      const currentFolder = resources.shift()

      ref.LOAD_FILES({
        currentFolder,
        files: resources
      })
      ref.loadIndicators({
        client: ref.$client,
        currentFolder: currentFolder?.path
      })
    })

    return {
      space,
      loadResourcesTask,
      resourceTargetLocation: createLocationSpaces('files-spaces-project'),
      paginatedResources,
      paginationPages,
      paginationPage,
      handleSort,
      sortBy,
      sortDir
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
      imageContent: ''
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

        this.$client.files
          .getFileContents(buildWebDavSpacesPath(this.space.id, path), {
            responseType: 'arrayBuffer'
          })
          .then((fileContents) => {
            this.imageContent = Buffer.from(fileContents).toString('base64')
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

            this.markdownContent = marked.parse(fileContents)

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

    if (this.markdownResizeObserver) {
      this.markdownResizeObserver.unobserve(this.$refs.markdownContainer)
    }
    this.markdownResizeObserver.observe(this.$refs.markdownContainer)

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
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
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
        ...this.$_showDetails_items,
        ...this.$_restore_items,
        ...this.$_delete_items,
        ...this.$_disable_items
      ].filter((item) => item.isEnabled({ spaces: [space] }))
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
    }
  }
}
</script>

<style lang="scss">
.space-overview {
  &-image {
    border-radius: 10px;
    max-height: 250px;
    object-fit: cover;
    width: 100%;
  }

  &-image.expanded {
    max-height: 100%;
    max-width: 100%;
  }

  &-name {
    font-size: 1.5rem;
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
