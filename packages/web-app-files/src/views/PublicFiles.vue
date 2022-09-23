<template>
  <div class="oc-flex">
    <keyboard-actions :paginated-resources="paginatedResources" />
    <files-view-wrapper>
      <app-bar
        :has-bulk-actions="!fileWithoutApp"
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :show-actions-on-selection="!fileWithoutApp"
        :side-bar-open="sideBarOpen"
        :has-sidebar-toggle="!fileWithoutApp"
        :has-view-options="!fileWithoutApp"
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
          id="files-public-list-empty"
          class="files-empty"
          icon="folder"
        >
          <template #message>
            <span v-translate>There are no resources in this folder</span>
          </template>
          <template v-if="currentFolder.canCreate()" #callToAction>
            <span v-translate data-testid="public-files-call-to-action">
              Drag files and folders here or use the "New" or "Upload" buttons to add files
            </span>
          </template>
        </no-content-message>
        <div v-else>
          <div v-if="isSingleFile() && fileWithoutAppView">
            <single-shared-file :file="fileWithoutApp" />
          </div>
          <resource-table
            v-else
            id="files-public-files-table"
            v-model="selectedResourcesIds"
            class="files-table"
            :class="{ 'files-table-squashed': sideBarOpen }"
            :fields-displayed="['name', 'size', 'mdate']"
            :are-thumbnails-displayed="displayThumbnails"
            :resources="paginatedResources"
            :target-route="targetRoute"
            :header-position="fileListHeaderY"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            :drag-drop="true"
            @fileDropped="fileDropped"
            @fileClick="$_fileActions_triggerDefaultAction"
            @rowMounted="rowMounted"
            @sort="handleSort"
          >
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
        </div>
      </template>
    </files-view-wrapper>
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapActions, mapMutations } from 'vuex'
import ResourceTable from '../components/FilesList/ResourceTable.vue'
import { useResourcesViewDefaults } from '../composables'

import MixinAccessibleBreadcrumb from '../mixins/accessibleBreadcrumb'
import MixinFileActions from '../mixins/fileActions'

import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../constants'
import debounce from 'lodash-es/debounce'
import { bus } from 'web-pkg/src/instance'
import { computed, defineComponent } from '@vue/composition-api'

import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import AppBar from '../components/AppBar/AppBar.vue'
import CreateAndUpload from '../components/AppBar/CreateAndUpload.vue'
import NotFoundMessage from '../components/FilesList/NotFoundMessage.vue'
import ListInfo from '../components/FilesList/ListInfo.vue'
import Pagination from '../components/FilesList/Pagination.vue'
import ContextActions from '../components/FilesList/ContextActions.vue'
import { breadcrumbsFromPath, concatBreadcrumbs } from '../helpers/breadcrumbs'
import { move } from '../helpers/resource'
import { Resource } from 'web-client'
import { usePublicLinkPassword, useStore } from 'web-pkg/src/composables'
import KeyboardActions from '../components/FilesList/KeyboardActions.vue'
import SideBar from '../components/SideBar/SideBar.vue'
import FilesViewWrapper from '../components/FilesViewWrapper.vue'
import FileDetails from '../components/SideBar/Details/FileDetails.vue'
import FileActions from '../components/SideBar/Actions/FileActions.vue'
import FileInfo from '../components/SideBar/FileInfo.vue'
import SingleSharedFile from './SingleSharedFile.vue'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  components: {
    FilesViewWrapper,
    AppBar,
    CreateAndUpload,
    ResourceTable,
    ListInfo,
    Pagination,
    AppLoadingSpinner,
    NoContentMessage,
    NotFoundMessage,
    ContextActions,
    KeyboardActions,
    SideBar,
    FileDetails,
    FileActions,
    FileInfo,
    SingleSharedFile
  },

  mixins: [MixinAccessibleBreadcrumb, MixinFileActions],
  setup() {
    const store = useStore()
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      publicLinkPassword: usePublicLinkPassword({ store })
    }
  },

  computed: {
    ...mapGetters('Files', [
      'currentFolder',
      'highlightedFile',
      'totalFilesCount',
      'totalFilesSize'
    ]),
    ...mapGetters(['configuration']),

    fileWithoutAppView() {
      return this.paginatedResources.length === 1 && this.paginatedResources[0].isFolder === false
    },

    breadcrumbs() {
      const breadcrumbs = breadcrumbsFromPath(this.$route, this.$route.params.item)
      const rootRoute = breadcrumbs.shift()

      return concatBreadcrumbs(
        { text: this.$gettext('Public link'), to: rootRoute.to },
        ...breadcrumbs
      )
    },

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    folderNotFound() {
      return this.currentFolder === null
    },

    targetRoute() {
      return { name: this.$route.name }
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    },
    openPublicLinkSingleFiles() {
      return this.configuration?.options?.openPublicLinkSingleFiles
    }
  },

  watch: {
    $route: {
      handler: function (to, from) {
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.item === from?.params?.item
        if (!sameRoute || !sameItem) {
          this.loadResourcesTask.perform(this, sameRoute)
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  created() {
    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path) => {
      this.loadResourcesTask.perform(this, this.$route.params.item === path, path)
    })

    this.fileWithoutApp = null

    this.$watch('paginatedResources', (to) => {
      if (this.isSingleFile()) {
        if (
          !this.$route.query.scrollTo &&
          this.$_fileActions_getDefaultAction(to[0]).label() !== 'Download'
        )
          this.$_fileActions_triggerDefaultAction(this.paginatedResources[0], true)

        this.SET_FILE_SELECTION(this.paginatedResources)
        this.fileWithoutApp = computed(() => this.paginatedResources[0])
      } else this.fileWithoutApp = null
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadResourcesEventToken))
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapMutations('Files', [
      'SET_CURRENT_FOLDER',
      'LOAD_FILES',
      'CLEAR_CURRENT_FILES_LIST',
      'REMOVE_FILES',
      'REMOVE_FILES_FROM_SEARCHED',
      'REMOVE_FILE_SELECTION',
      'SET_FILE_SELECTION'
    ]),

    isSingleFile() {
      if (
        this.paginatedResources.length === 1 &&
        (!this.currentFolder.fileId || this.currentFolder.path === this.paginatedResources[0].path)
      ) {
        return true
      }
      return false
    },

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
        false,
        this.publicLinkPassword
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
          isPublic: true,
          dimensions: ImageDimension.Thumbnail,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
