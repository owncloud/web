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
          <span v-translate>Drag files and folders here or use the "+ New" button to upload</span>
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
import { buildResource } from '../helpers/resources'
import { fileList } from '../helpers/ui'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import { useFileListHeaderPosition, usePagination, useSort } from '../composables'
import { useMutationSubscription, useRouteQuery, useStore } from 'web-pkg/src/composables'
import { bus } from 'web-pkg/src/instance'

import ResourceTable, { determineSortFields } from '../components/FilesList/ResourceTable.vue'
import QuickActions from '../components/FilesList/QuickActions.vue'
import ListLoader from '../components/FilesList/ListLoader.vue'
import NoContentMessage from '../components/FilesList/NoContentMessage.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { DavProperties } from 'web-pkg/src/constants'
import { basename, join } from 'path'
import PQueue from 'p-queue'
import { nextTick, computed, unref } from '@vue/composition-api'
import { useTask } from 'vue-concurrency'
import { createLocationSpaces } from '../router'

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
    const store = useStore()
    const { refresh: refreshFileListHeaderPosition, y: fileListHeaderY } =
      useFileListHeaderPosition()

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

    useMutationSubscription(['Files/UPSERT_RESOURCE'], async ({ payload }) => {
      await nextTick()
      fileList.accentuateItem(payload.id)
    })

    const loadResourcesTask = useTask(function* (signal, ref, sameRoute, path = null) {
      ref.CLEAR_CURRENT_FILES_LIST()

      try {
        let resources = yield ref.fetchResources(
          `/files/${ref.user.id}/${path || ref.$route.params.item || ''}`,
          DavProperties.Default
        )
        resources = resources.map(buildResource)

        const currentFolder = resources.shift()

        ref.LOAD_FILES({
          currentFolder,
          files: resources
        })
        ref.loadIndicators({
          client: ref.$client,
          currentFolder: currentFolder.path
        })

        // Load quota
        const promiseUser = ref.$client.users.getUser(ref.user.id)
        // The semicolon is important to separate from the previous statement
        ;(async () => {
          const user = await promiseUser
          ref.SET_QUOTA(user.quota)
        })()
      } catch (error) {
        ref.SET_CURRENT_FOLDER(null)
        console.error(error)
      }

      refreshFileListHeaderPosition()
      ref.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
      ref.scrollToResourceFromRoute()
    }).restartable()

    return {
      fileListHeaderY,
      loadResourcesTask,
      paginatedResources,
      paginationPages,
      resourceTargetLocation: createLocationSpaces('files-spaces-personal-home'),
      paginationPage,
      handleSort,
      sortBy,
      sortDir
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
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item

        const needsRedirectToHome =
          this.homeFolder !== '/' &&
          isNil(to.params.item) &&
          !to.path.endsWith('/') &&
          (!sameRoute || !sameItem)
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
    ...mapActions('Files', ['loadIndicators', 'loadPreview']),
    ...mapActions(['showMessage']),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'REMOVE_FILE',
      'REMOVE_FILE_FROM_SEARCHED',
      'SET_FILE_SELECTION',
      'REMOVE_FILE_SELECTION'
    ]),
    ...mapMutations(['SET_QUOTA']),

    async fileDropped(fileIdTarget) {
      const selected = [...this.selectedFiles]
      const targetInfo = this.paginatedResources.find((e) => e.id === fileIdTarget)
      const isTargetSelected = selected.some((e) => e.id === fileIdTarget)
      if (isTargetSelected) return
      if (targetInfo.type !== 'folder') return
      const itemsInTarget = await this.fetchResources(targetInfo.path)

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
                resource: resource.name,
                message: this.$gettextInterpolate(message, { name: resource.name }, true)
              })
              return
            }

            try {
              await this.$client.files.move(resource.path, join(targetInfo.path, resource.name))
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
    async fetchResources(path, properties) {
      try {
        return await this.$client.files.list(path, 1, properties)
      } catch (error) {
        console.error(error)
      }
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
