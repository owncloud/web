<template>
  <div>
    <list-loader v-if="loadResourcesTask.isRunning" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="files-not-found oc-height-1-1" />
      <no-content-message
        v-else-if="isEmpty"
        id="files-personal-empty"
        class="files-empty"
        icon="folder"
      >
        <template #message>
          <span v-translate>There are no resources in this folder</span>
        </template>
        <template #callToAction>
          <span v-translate>
            Drag files and folders here or use the "New" or "Upload" buttons to add files
          </span>
        </template>
      </no-content-message>
      <resource-table
        v-else
        id="files-personal-table"
        v-model="selected"
        class="files-table"
        :class="{ 'files-table-squashed': !sidebarClosed }"
        :are-thumbnails-displayed="displayThumbnails"
        :resources="paginatedResources"
        :target-route="resourceTargetLocation"
        :header-position="fileListHeaderY"
        :hover="true"
        :drag-drop="true"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        @fileDropped="fileDropped"
        @fileClick="$_fileActions_triggerDefaultAction"
        @rowMounted="rowMounted"
        @sort="handleSort"
      >
        <template #quickActions="{ resource }">
          <quick-actions
            :class="resource.preview"
            class="oc-visible@s"
            :item="resource"
            :actions="app.quickActions"
          />
        </template>
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
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import isNil from 'lodash-es/isNil'
import debounce from 'lodash-es/debounce'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'
import MixinFilesListFilter from '../mixins/filesListFilter'
import MixinFilesListScrolling from '../mixins/filesListScrolling'
import MixinMountSideBar from '../mixins/sidebar/mountSideBar'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import { bus } from 'web-pkg/src/instance'

import ResourceTable from '../components/FilesList/ResourceTable.vue'
import QuickActions from '../components/FilesList/QuickActions.vue'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { basename, join } from 'path'
import PQueue from 'p-queue'
import { createLocationSpaces } from '../router'
import { useResourcesViewDefaults } from '../composables'
import { fetchResources } from '../services/folder/loaderPersonal'

const visibilityObserver = new VisibilityObserver()

export default {
  components: {
    ResourceTable,
    QuickActions,
    ListLoader,
    NoContentMessage,
    NotFoundMessage,
    ListInfo,
    Pagination,
    ContextActions
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListScrolling,
    MixinMountSideBar,
    MixinFilesListFilter
  ],
  setup() {
    return {
      ...useResourcesViewDefaults(),
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home')
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
    ...mapGetters('Files', [
      'highlightedFile',
      'selectedFiles',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['user', 'homeFolder', 'configuration']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    selected: {
      get() {
        return this.selectedFiles
      },
      set(resources) {
        this.SET_FILE_SELECTION(resources)
      }
    },

    folderNotFound() {
      return this.currentFolder === null
    },

    displayThumbnails() {
      return !this.configuration.options.disablePreviews
    }
  },

  watch: {
    $route: {
      handler: function (to, from) {
        const needsRedirectToHome =
          this.homeFolder !== '/' && isNil(to.params.item) && !to.path.endsWith('/')

        if (needsRedirectToHome) {
          this.$router.replace(
            {
              name: to.name,
              params: {
                ...to.params,
                item: this.homeFolder
              },
              query: to.query
            },
            () => {},
            (e) => {
              console.error(e)
            }
          )

          return
        }

        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResourcesTask.perform(this, sameRoute)
        }
      },
      immediate: true
    }
  },

  mounted() {
    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadResourcesEventToken))
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'REMOVE_FILE',
      'REMOVE_FILE_FROM_SEARCHED',
      'SET_FILE_SELECTION',
      'REMOVE_FILE_SELECTION'
    ]),

    fetchResources,

    async fileDropped(fileIdTarget) {
      const selected = [...this.selectedFiles]
      const targetInfo = this.paginatedResources.find((e) => e.id === fileIdTarget)
      const isTargetSelected = selected.some((e) => e.id === fileIdTarget)
      if (isTargetSelected) return
      if (targetInfo.type !== 'folder') return
      const itemsInTarget = await this.fetchResources(this.$client, targetInfo.webDavPath)

      // try to move all selected files
      const errors = []
      const movePromises = []
      const moveQueue = new PQueue({ concurrency: 4 })
      selected.forEach((resource) => {
        movePromises.push(
          moveQueue.add(async () => {
            const exists = itemsInTarget.some((e) => basename(e.name) === resource.name)
            if (exists) {
              const message = this.$gettext('Resource with name %{name} already exists')
              errors.push({
                resourceName: resource.name,
                message: this.$gettextInterpolate(message, { name: resource.name }, true)
              })
              return
            }

            try {
              await this.$client.files.move(
                resource.webDavPath,
                join(targetInfo.webDavPath, resource.name)
              )
              this.REMOVE_FILE(resource)
              this.REMOVE_FILE_FROM_SEARCHED(resource)
              this.REMOVE_FILE_SELECTION(resource)
            } catch (error) {
              console.error(error)
              error.resourceName = resource.name
              errors.push(error)
            }
          })
        )
      })
      await Promise.all(movePromises)

      // show error / success messages
      let title
      if (errors.length === 0) {
        const count = selected.length
        title = this.$ngettext(
          '%{count} item was moved successfully',
          '%{count} items were moved successfully',
          count
        )
        this.showMessage({
          title: this.$gettextInterpolate(title, { count }),
          status: 'success'
        })
        return
      }

      if (errors.length === 1) {
        title = this.$gettext('Failed to move "%{resourceName}"')
        this.showMessage({
          title: this.$gettextInterpolate(title, { resourceName: errors[0]?.resourceName }, true),
          status: 'danger'
        })
        return
      }

      title = this.$gettext('Failed to move %{count} resources')
      this.showMessage({
        title: this.$gettextInterpolate(title, { count: errors.length }),
        status: 'danger'
      })
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
    scrollToResourceFromRoute() {
      const resourceName = this.$route.query.scrollTo

      if (resourceName && this.paginatedResources.length > 0) {
        this.$nextTick(() => {
          const resource = this.paginatedResources.find((r) => r.name === resourceName)

          if (resource) {
            this.selected = [resource]
            this.$_mountSideBar_showDefaultPanel(resource)
            this.scrollToResource(resource)
          }
        })
      }
    },

    isResourceInSelection(resource) {
      return this.selected?.includes(resource)
    }
  }
}
</script>
