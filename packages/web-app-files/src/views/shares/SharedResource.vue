<template>
  <div class="oc-flex">
    <keyboard-actions :paginated-resources="paginatedResources" />
    <files-view-wrapper>
      <app-bar
        :has-bulk-actions="true"
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :show-actions-on-selection="true"
        :side-bar-open="sideBarOpen"
      >
        <template #actions="{ limitedScreenSpace }">
          <create-and-upload :limited-screen-space="limitedScreenSpace" />
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
          v-model="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
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
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" />
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
import KeyboardActions from '../../components/FilesList/KeyboardActions.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'

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
    KeyboardActions,
    SideBar,
    FilesViewWrapper
  },

  mixins: [
    MixinAccessibleBreadcrumb,
    MixinFileActions,
    MixinFilesListScrolling,
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
      handler: async function () {
        await this.loadResourcesTask.perform(this, this.shareId, this.relativePath)
        // this can't be done in the task because the table will be rendered afterwards
        this.scrollToResourceFromRoute()
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
        false
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
        const resource = this.paginatedResources.find((r) => r.name === resourceName)

        if (resource) {
          this.selectedResources = [resource]
          this.scrollToResource(resource)
        }
      }
    }
  }
})
</script>
