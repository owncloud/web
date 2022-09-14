<template>
  <div class="oc-flex oc-width-1-1">
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
          <create-and-upload :space="space" :limited-screen-space="limitedScreenSpace" />
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <not-found-message
          v-if="folderNotFound"
          :space="space"
          class="files-not-found oc-height-1-1"
        />
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
          id="files-space-table"
          v-model="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="paginatedResources"
          :target-route-callback="resourceTargetRouteCallback"
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
    <side-bar :open="sideBarOpen" :active-panel="sideBarActivePanel" :space="space" />
  </div>
</template>

<script lang="ts">
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import debounce from 'lodash-es/debounce'

import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import MixinFileActions from '../../mixins/fileActions'
import MixinFilesListScrolling from '../../mixins/filesListScrolling'

import AppBar from '../../components/AppBar/AppBar.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import CreateAndUpload from '../../components/AppBar/CreateAndUpload.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import KeyboardActions from '../../components/FilesList/KeyboardActions.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import QuickActions from '../../components/FilesList/QuickActions.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'

import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../../constants'
import { bus } from 'web-pkg/src/instance'
import { breadcrumbsFromPath, concatBreadcrumbs } from '../../helpers/breadcrumbs'
import { createLocationSpaces } from '../../router'
import { useResourcesViewDefaults } from '../../composables'
import { defineComponent } from '@vue/composition-api'
import { move } from '../../helpers/resource'
import { Resource } from 'web-client'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { Location } from 'vue-router'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  name: 'GenericSpace',

  components: {
    AppBar,
    AppLoadingSpinner,
    ContextActions,
    CreateAndUpload,
    FilesViewWrapper,
    KeyboardActions,
    ListInfo,
    NoContentMessage,
    NotFoundMessage,
    Pagination,
    QuickActions,
    ResourceTable,
    SideBar
  },

  mixins: [MixinAccessibleBreadcrumb, MixinFileActions, MixinFilesListScrolling],

  props: {
    space: {
      type: Object,
      required: false,
      default: null
    },
    item: {
      type: String,
      required: false,
      default: null
    }
  },

  setup(props) {
    const resourceTargetRouteCallback = (path: string, resource: Resource): Location => {
      return createLocationSpaces('files-spaces-generic', {
        params: { driveAliasAndItem: props.space.driveAlias + path }
      })
    }
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      resourceTargetRouteCallback,
      hasShareJail: useCapabilityShareJailEnabled()
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
    ...mapGetters('runtime/spaces', ['spaces']),
    ...mapGetters(['user', 'homeFolder', 'configuration']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    breadcrumbs() {
      const rootBreadcrumbsItems = []
      if (this.space.driveType === 'project') {
        rootBreadcrumbsItems.push({
          text: this.$gettext('Spaces'),
          to: createLocationSpaces('files-spaces-projects')
        })
      }
      if (this.space.driveType === 'personal') {
        rootBreadcrumbsItems.push({
          text: this.hasShareJail ? this.$gettext('Personal') : this.$gettext('All files'),
          to: createLocationSpaces('files-spaces-generic', {
            params: { driveAliasAndItem: this.space.driveAlias }
          })
        })
      } else {
        rootBreadcrumbsItems.push({
          text: this.space.name,
          to: createLocationSpaces('files-spaces-generic', {
            params: { driveAliasAndItem: this.space.driveAlias }
          })
        })
      }
      return concatBreadcrumbs(
        ...rootBreadcrumbsItems,
        ...breadcrumbsFromPath(this.$route, this.item)
      )
    },

    folderNotFound() {
      return this.currentFolder === null
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    }
  },

  watch: {
    $route: {
      handler: async function (to, from) {
        const sameRoute = to.name === from?.name
        const sameItem = to.params?.driveAliasAndItem === from?.params?.driveAliasAndItem
        if (!sameRoute || !sameItem) {
          await this.performLoaderTask(sameRoute)
        }
      },
      immediate: true
    }
  },

  mounted() {
    const loadResourcesEventToken = bus.subscribe('app.files.list.load', (path: string) => {
      this.performLoaderTask(true, path)
    })

    this.$on('beforeDestroy', () => bus.unsubscribe('app.files.list.load', loadResourcesEventToken))
  },

  beforeDestroy() {
    visibilityObserver.disconnect()
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapMutations('Files', [
      'REMOVE_FILES',
      'REMOVE_FILES_FROM_SEARCHED',
      'REMOVE_FILE_SELECTION'
    ]),

    async performLoaderTask(sameRoute: boolean, path?: string) {
      await this.loadResourcesTask.perform(this.space, path || this.item)
      this.scrollToResourceFromRoute()
      this.refreshFileListHeaderPosition()
      this.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
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
