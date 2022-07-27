<template>
  <div>
    <keyboard-actions :paginated-resources="paginatedResources" />
    <app-bar
      :has-bulk-actions="true"
      :breadcrumbs="breadcrumbs"
      :breadcrumbs-context-actions-items="[currentFolder]"
      :show-actions-on-selection="true"
    >
      <template #actions>
        <create-and-upload />
      </template>
    </app-bar>
    <app-loading-spinner v-if="areResourcesLoading" />
    <template v-else>
      <not-found-message v-if="folderNotFound" class="files-not-found oc-height-1-1" />
      <no-content-message
        v-else-if="isEmpty"
        id="files-shared-resource-empty"
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
        id="files-shared-resource-table"
        v-model="selectedResources"
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
          <context-actions v-if="isResourceInSelection(resource)" :items="selectedResources" />
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

<script lang="ts">
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import debounce from 'lodash-es/debounce'

// mixins
import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import MixinFileActions from '../../mixins/fileActions'
import MixinFilesListFilter from '../../mixins/filesListFilter'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'
import MixinMountSideBar from '../../mixins/sidebar/mountSideBar'

// components
import AppBar from '../../components/AppBar/AppBar.vue'
import CreateAndUpload from '../../components/AppBar/CreateAndUpload.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import QuickActions from '../../components/FilesList/QuickActions.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'

// misc
import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../../constants'
import { bus } from 'web-pkg/src/instance'
import { createLocationSpaces } from '../../router'
import { useResourcesViewDefaults } from '../../composables'
import { defineComponent, unref } from '@vue/composition-api'
import { fetchResources } from '../../services/folder'
import { move } from '../../helpers/resource'
import { Resource } from 'web-client'
import { breadcrumbsFromPath, concatBreadcrumbs } from '../../helpers/breadcrumbs'
import { useRouteParam, useRouteQuery } from 'web-pkg/src/composables'
import KeyboardActions from '../../components/FilesList/KeyboardActions.vue'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    AppBar,
    CreateAndUpload,
    ResourceTable,
    QuickActions,
    AppLoadingSpinner,
    NoContentMessage,
    NotFoundMessage,
    ListInfo,
    Pagination,
    ContextActions,
    KeyboardActions
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListScrolling,
    MixinMountSideBar,
    MixinFilesListFilter
  ],
  setup() {
    const shareId = useRouteQuery('shareId')
    const shareName = useRouteParam('shareName')
    const relativePath = useRouteParam('item', '')
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      resourceTargetLocation: createLocationSpaces('files-spaces-share', {
        params: {
          shareName: unref(shareName)
        },
        query: {
          shareId: unref(shareId)
        }
      }),
      shareId,
      shareName,
      relativePath
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapState('Files/sidebar', { sidebarClosed: 'closed' }),
    ...mapGetters('Files', [
      'highlightedFile',
      'currentFolder',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['user', 'homeFolder', 'configuration']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    breadcrumbs() {
      return concatBreadcrumbs(
        {
          text: this.$gettext('Shares'),
          to: { path: '/files/shares' }
        },
        {
          text: this.$gettext('Shared with me'),
          to: { path: '/files/shares/with-me' }
        },
        ...breadcrumbsFromPath(this.$route, [this.shareName, this.relativePath].join('/'))
      )
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
      handler: function () {
        this.loadResourcesTask.perform(this, this.shareId, this.relativePath)
      },
      immediate: true
    }
  },

  mounted() {
    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path: string) => {
      this.loadResourcesTask.perform(this, this.shareId, path)
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
      'REMOVE_FILES',
      'REMOVE_FILES_FROM_SEARCHED',
      'REMOVE_FILE_SELECTION'
    ]),

    fetchResources,

    async fileDropped(fileIdTarget) {
      const selected = [...this.selectedResources]
      const targetInfo = this.paginatedResources.find((e) => e.id === fileIdTarget)
      const isTargetSelected = selected.some((e) => e.id === fileIdTarget)
      if (isTargetSelected) return
      if (targetInfo.type !== 'folder') return
      const movedResources = await move(
        selected,
        targetInfo,
        this.$client,
        this.createModal,
        this.hideModal,
        this.showMessage,
        this.$gettext,
        this.$gettextInterpolate,
        this.$ngettext,
        this.$route.name
      )
      for (const resource of movedResources) {
        this.REMOVE_FILES([resource])
        this.REMOVE_FILES_FROM_SEARCHED([resource])
        this.REMOVE_FILE_SELECTION(resource)
      }
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
            this.selectedResources = [resource]
            this.$_mountSideBar_showDefaultPanel(resource)
            this.scrollToResource(resource)
          }
        })
      }
    }
  }
})
</script>
