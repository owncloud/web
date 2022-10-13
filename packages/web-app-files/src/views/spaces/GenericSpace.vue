<template>
  <div class="oc-flex oc-width-1-1">
    <keyboard-actions :paginated-resources="paginatedResources" :space="space" />
    <files-view-wrapper>
      <app-bar
        :has-bulk-actions="true"
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :show-actions-on-selection="true"
        :side-bar-open="sideBarOpen"
        :space="space"
      >
        <template #actions="{ limitedScreenSpace }">
          <create-and-upload
            :space="space"
            :item="item"
            :item-id="itemId"
            :limited-screen-space="limitedScreenSpace"
          />
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <not-found-message
          v-if="folderNotFound"
          :space="space"
          class="files-not-found oc-height-1-1"
        />
        <space-header v-else-if="hasSpaceHeader" :space="space" class="oc-px-m oc-mt-m" />

        <no-content-message v-if="isEmpty" id="files-space-empty" class="files-empty" icon="folder">
          <template #message>
            <span v-translate>No resources found</span>
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
          :space="space"
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
            <context-actions
              v-if="isResourceInSelection(resource)"
              :space="space"
              :items="selectedResources"
            />
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
import SpaceHeader from '../../components/Spaces/SpaceHeader.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'

import { VisibilityObserver } from 'web-pkg/src/observer'
import { ImageDimension, ImageType } from '../../constants'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { BreadcrumbItem, breadcrumbsFromPath, concatBreadcrumbs } from '../../helpers/breadcrumbs'
import { createLocationPublic, createLocationSpaces } from '../../router'
import { useResourcesViewDefaults } from '../../composables'
import { computed, defineComponent, PropType } from '@vue/composition-api'
import { ResourceTransfer, TransferType } from '../../helpers/resource'
import { Resource } from 'web-client'
import { useCapabilityShareJailEnabled } from 'web-pkg/src/composables'
import { Location } from 'vue-router'
import {
  isPersonalSpaceResource,
  isProjectSpaceResource,
  isPublicSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'
import { CreateTargetRouteOptions } from '../../helpers/folderLink'
import { FolderLoaderOptions } from '../../services/folder'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import omit from 'lodash-es/omit'

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
    SideBar,
    SpaceHeader
  },

  mixins: [MixinAccessibleBreadcrumb, MixinFileActions, MixinFilesListScrolling],

  props: {
    space: {
      type: Object as PropType<SpaceResource>,
      required: false,
      default: null
    },
    item: {
      type: String,
      required: false,
      default: null
    },
    itemId: {
      type: [String, Number],
      required: false,
      default: null
    }
  },

  setup(props) {
    const resourceTargetRouteCallback = ({ path, fileId }: CreateTargetRouteOptions): Location => {
      const { params, query } = createFileRouteOptions(props.space, { path, fileId })
      if (isPublicSpaceResource(props.space)) {
        return createLocationPublic('files-public-link', { params, query })
      }
      return createLocationSpaces('files-spaces-generic', { params, query })
    }
    const hasSpaceHeader = computed(() => {
      // for now the space header is only available in the root of a project space.
      return props.space.driveType === 'project' && props.item === '/'
    })
    return {
      ...useResourcesViewDefaults<Resource, any, any[]>(),
      resourceTargetRouteCallback,
      hasShareJail: useCapabilityShareJailEnabled(),
      hasSpaceHeader
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
    ...mapGetters(['user', 'configuration']),

    isEmpty() {
      return this.paginatedResources.length < 1
    },

    breadcrumbs() {
      const rootBreadcrumbItems: BreadcrumbItem[] = []
      if (isProjectSpaceResource(this.space)) {
        rootBreadcrumbItems.push({
          text: this.$gettext('Spaces'),
          to: createLocationSpaces('files-spaces-projects')
        })
      } else if (isShareSpaceResource(this.space)) {
        rootBreadcrumbItems.push(
          {
            text: this.$gettext('Shares'),
            to: { path: '/files/shares' }
          },
          {
            text: this.$gettext('Shared with me'),
            to: { path: '/files/shares/with-me' }
          }
        )
      }

      let spaceBreadcrumbItem
      let { params, query } = createFileRouteOptions(this.space, { fileId: this.space.fileId })
      query = { ...this.$route.query, ...query }
      if (isPersonalSpaceResource(this.space)) {
        spaceBreadcrumbItem = {
          text: this.hasShareJail ? this.$gettext('Personal') : this.$gettext('All files'),
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query
          })
        }
      } else if (isShareSpaceResource(this.space)) {
        spaceBreadcrumbItem = {
          allowContextActions: true,
          text: this.space.name,
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query: omit(query, 'fileId')
          })
        }
      } else if (isPublicSpaceResource(this.space)) {
        spaceBreadcrumbItem = {
          text: this.$gettext('Public link'),
          to: createLocationPublic('files-public-link', {
            params,
            query
          })
        }
      } else {
        spaceBreadcrumbItem = {
          allowContextActions: !this.hasSpaceHeader,
          text: this.space.name,
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query
          })
        }
      }

      return concatBreadcrumbs(
        ...rootBreadcrumbItems,
        spaceBreadcrumbItem,
        // FIXME: needs file ids for each parent folder path
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
    item: {
      handler: function () {
        this.performLoaderTask(true)
      }
    }
  },

  mounted() {
    this.performLoaderTask(false)
    const loadResourcesEventToken = eventBus.subscribe(
      'app.files.list.load',
      (path?: string, fileId?: string | number) => {
        this.performLoaderTask(true, path, fileId)
      }
    )
    this.$on('beforeDestroy', () =>
      eventBus.unsubscribe('app.files.list.load', loadResourcesEventToken)
    )
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

    async performLoaderTask(sameRoute: boolean, path?: string, fileId?: string | number) {
      const options: FolderLoaderOptions = { loadShares: !isPublicSpaceResource(this.space) }
      await this.loadResourcesTask.perform(
        this.space,
        path || this.item,
        fileId || this.itemId,
        options
      )
      this.scrollToResourceFromRoute()
      this.refreshFileListHeaderPosition()
      this.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    },

    async fileDropped(fileIdTarget) {
      const selected = [...this.selectedResources]
      const targetFolder = this.paginatedResources.find((e) => e.id === fileIdTarget)
      const isTargetSelected = selected.some((e) => e.id === fileIdTarget)
      if (isTargetSelected) {
        return
      }
      if (targetFolder.type !== 'folder') {
        return
      }
      const copyMove = new ResourceTransfer(
        this.space,
        selected,
        this.space,
        targetFolder,
        this.$clientService,
        this.createModal,
        this.hideModal,
        this.showMessage,
        this.$gettext,
        this.$ngettext,
        this.$gettextInterpolate
      )
      const movedResources = await copyMove.perform(TransferType.MOVE)
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
