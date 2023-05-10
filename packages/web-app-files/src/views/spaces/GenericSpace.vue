<template>
  <div class="oc-flex oc-width-1-1" :class="{ 'space-frontpage': isSpaceFrontpage }">
    <whitespace-context-menu ref="whitespaceContextMenu" :space="space" />
    <keyboard-actions :paginated-resources="paginatedResources" :space="space" />
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :has-bulk-actions="displayFullAppBar"
        :show-actions-on-selection="displayFullAppBar"
        :has-sidebar-toggle="displayFullAppBar"
        :has-view-options="displayFullAppBar"
        :side-bar-open="sideBarOpen"
        :space="space"
        :view-modes="viewModes"
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
        <space-header
          v-else-if="hasSpaceHeader"
          :space="space"
          :side-bar-open="sideBarOpen"
          class="oc-px-m oc-mt-m"
        />
        <no-content-message
          v-if="isCurrentFolderEmpty"
          id="files-space-empty"
          class="files-empty"
          icon="folder"
        >
          <template #message>
            <span v-text="$gettext('No resources found')" />
          </template>
          <template #callToAction>
            <span v-if="canUpload" class="file-empty-upload-hint" v-text="uploadHint" />
          </template>
        </no-content-message>
        <resource-tiles
          v-else-if="viewMode === ViewModeConstants.tilesView.name"
          v-model:selectedIds="selectedResourcesIds"
          :data="paginatedResources"
          class="oc-px-m oc-pt-l"
          :resizable="true"
          :target-route-callback="resourceTargetRouteCallback"
          :space="space"
          :drag-drop="true"
          :sort-fields="sortFields"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          :view-size="viewSize"
          @row-mounted="rowMounted"
          @file-click="triggerDefaultAction"
          @file-dropped="fileDropped"
          @sort="handleSort"
        >
          <template #contextMenuActions="{ resource }">
            <context-actions :action-options="{ space, resources: [resource] }" />
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
        </resource-tiles>
        <resource-details
          v-else-if="displayResourceAsSingleResource"
          :single-resource="paginatedResources[0]"
          :space="space"
        />
        <resource-table
          v-else
          id="files-space-table"
          v-model:selectedIds="selectedResourcesIds"
          class="files-table"
          :class="{ 'files-table-squashed': sideBarOpen }"
          :view-mode="viewMode"
          :are-thumbnails-displayed="displayThumbnails"
          :resources="paginatedResources"
          :target-route-callback="resourceTargetRouteCallback"
          :header-position="fileListHeaderY"
          :drag-drop="true"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          :space="space"
          @file-dropped="fileDropped"
          @file-click="triggerDefaultAction"
          @row-mounted="rowMounted"
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
              :action-options="{ space, resources: selectedResources }"
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
import { debounce, omit, last } from 'lodash-es'
import { basename } from 'path'
import { computed, defineComponent, PropType, onBeforeUnmount, onMounted, unref, ref } from 'vue'
import { RouteLocationNamedRaw } from 'vue-router'
import { mapGetters, mapState, mapActions, mapMutations, useStore } from 'vuex'
import { useGettext } from 'vue3-gettext'
import { Resource } from 'web-client'
import {
  isPersonalSpaceResource,
  isProjectSpaceResource,
  isPublicSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from 'web-client/src/helpers'

import { useFileActions } from '../../composables/actions/files/useFileActions'

import AppBar from '../../components/AppBar/AppBar.vue'
import ContextActions from '../../components/FilesList/ContextActions.vue'
import CreateAndUpload from '../../components/AppBar/CreateAndUpload.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import KeyboardActions from '../../components/FilesList/KeyboardActions.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import Pagination from '../../components/FilesList/Pagination.vue'
import QuickActions from '../../components/FilesList/QuickActions.vue'
import ResourceDetails from '../../components/FilesList/ResourceDetails.vue'
import ResourceTable from '../../components/FilesList/ResourceTable.vue'
import ResourceTiles from '../../components/FilesList/ResourceTiles.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import SpaceHeader from '../../components/Spaces/SpaceHeader.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import WhitespaceContextMenu from 'web-app-files/src/components/Spaces/WhitespaceContextMenu.vue'
import { useRoute } from 'web-pkg/src/composables'
import { useDocumentTitle } from 'web-pkg/src/composables/appDefaults/useDocumentTitle'
import { ImageType } from 'web-pkg/src/constants'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { breadcrumbsFromPath, concatBreadcrumbs } from '../../helpers/breadcrumbs'
import { createLocationPublic, createLocationSpaces } from '../../router'
import { useResourcesViewDefaults, ViewModeConstants } from '../../composables'
import { ResourceTransfer, TransferType } from '../../helpers/resource'
import { FolderLoaderOptions } from '../../services/folder'
import { CreateTargetRouteOptions } from 'web-app-files/src/helpers/folderLink/types'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { displayPositionedDropdown } from 'web-pkg/src'

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
    ResourceDetails,
    ResourceTable,
    ResourceTiles,
    SideBar,
    SpaceHeader,
    WhitespaceContextMenu
  },
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
    const store = useStore()
    const { $gettext, $ngettext, interpolate: $gettextInterpolate } = useGettext()
    let loadResourcesEventToken

    const canUpload = computed(() => {
      return store.getters['Files/currentFolder']?.canUpload({ user: store.getters.user })
    })

    const viewModes = computed(() => [
      ViewModeConstants.condensedTable,
      ViewModeConstants.default,
      ViewModeConstants.tilesView
    ])

    const resourceTargetRouteCallback = ({
      path,
      fileId
    }: CreateTargetRouteOptions): RouteLocationNamedRaw => {
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

    const folderNotFound = computed(() => store.getters['Files/currentFolder'] === null)

    const isCurrentFolderEmpty = computed(
      () => unref(resourcesViewDefaults.paginatedResources).length < 1
    )

    const titleSegments = computed(() => {
      const segments = [props.space.name]
      if (props.item !== '/') {
        segments.unshift(basename(props.item))
      }

      return segments
    })
    useDocumentTitle({ titleSegments })

    const route = useRoute()
    const breadcrumbs = computed(() => {
      const space = props.space
      const rootBreadcrumbItems: BreadcrumbItem[] = []
      if (isProjectSpaceResource(space)) {
        rootBreadcrumbItems.push({
          text: $gettext('Spaces'),
          to: createLocationSpaces('files-spaces-projects')
        })
      } else if (isShareSpaceResource(space)) {
        rootBreadcrumbItems.push(
          {
            text: $gettext('Shares'),
            to: { path: '/files/shares' }
          },
          {
            text: $gettext('Shared with me'),
            to: { path: '/files/shares/with-me' }
          }
        )
      }

      let spaceBreadcrumbItem
      let { params, query } = createFileRouteOptions(space, { fileId: space.fileId })
      query = omit({ ...unref(route).query, ...query }, 'page')
      if (isPersonalSpaceResource(space)) {
        spaceBreadcrumbItem = {
          text: space.name,
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query
          })
        }
      } else if (isShareSpaceResource(space)) {
        spaceBreadcrumbItem = {
          allowContextActions: true,
          text: space.name,
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query: omit(query, 'fileId')
          })
        }
      } else if (isPublicSpaceResource(space)) {
        spaceBreadcrumbItem = {
          text: $gettext('Public link'),
          to: createLocationPublic('files-public-link', {
            params,
            query
          })
        }
      } else {
        spaceBreadcrumbItem = {
          allowContextActions: !unref(hasSpaceHeader),
          text: space.name,
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
        ...breadcrumbsFromPath(unref(route), props.item)
      )
    })

    const focusAndAnnounceBreadcrumb = (sameRoute) => {
      const breadcrumbEl = document.getElementById('files-breadcrumb')
      if (!breadcrumbEl) {
        return
      }
      const activeBreadcrumb = last(breadcrumbEl.children[0].children)
      const activeBreadcrumbItem = activeBreadcrumb.getElementsByTagName('button')[0]
      if (!activeBreadcrumbItem) {
        return
      }

      const totalFilesCount = store.getters['Files/totalFilesCount']
      const itemCount = totalFilesCount.files + totalFilesCount.folders

      const announcement = $gettextInterpolate(
        $ngettext(
          'This folder contains %{ amount } item.',
          'This folder contains %{ amount } items.',
          itemCount
        ),
        { amount: itemCount }
      )

      const translatedHint = itemCount > 0 ? announcement : $gettext('This folder has no content.')

      document.querySelectorAll('.oc-breadcrumb-sr').forEach((el) => el.remove())

      const invisibleHint = document.createElement('p')
      invisibleHint.className = 'oc-invisible-sr oc-breadcrumb-sr'
      invisibleHint.innerHTML = translatedHint

      activeBreadcrumb.append(invisibleHint)
      if (sameRoute) {
        activeBreadcrumbItem.focus()
      }
    }

    const resourcesViewDefaults = useResourcesViewDefaults<Resource, any, any[]>()
    const performLoaderTask = async (
      sameRoute: boolean,
      path?: string,
      fileId?: string | number
    ) => {
      if (resourcesViewDefaults.loadResourcesTask.isRunning) {
        return
      }

      const options: FolderLoaderOptions = { loadShares: !isPublicSpaceResource(props.space) }
      await resourcesViewDefaults.loadResourcesTask.perform(
        props.space,
        path || props.item,
        fileId || props.itemId,
        options
      )

      resourcesViewDefaults.scrollToResourceFromRoute([
        store.getters['Files/currentFolder'],
        ...unref(resourcesViewDefaults.paginatedResources)
      ])
      resourcesViewDefaults.refreshFileListHeaderPosition()
      focusAndAnnounceBreadcrumb(sameRoute)
    }

    onMounted(() => {
      performLoaderTask(false)
      loadResourcesEventToken = eventBus.subscribe(
        'app.files.list.load',
        (path?: string, fileId?: string | number) => {
          performLoaderTask(true, path, fileId)
        }
      )
      const filesViewWrapper = document.getElementsByClassName('files-view-wrapper')[0]
      filesViewWrapper?.addEventListener('contextmenu', (event) => {
        const { target } = event
        if ((target as HTMLElement).closest('.has-item-context-menu')) {
          return
        }
        event.preventDefault()
        const newEvent = new MouseEvent('contextmenu', event)
        showContextMenu(newEvent)
      })
    })

    onBeforeUnmount(() => {
      visibilityObserver.disconnect()
      eventBus.unsubscribe('app.files.list.load', loadResourcesEventToken)
    })

    const whitespaceContextMenu = ref(null)
    const showContextMenu = (event) => {
      store.commit('Files/RESET_SELECTION')
      displayPositionedDropdown(
        unref(whitespaceContextMenu).$el._tippy,
        event,
        unref(whitespaceContextMenu)
      )
    }

    return {
      ...useFileActions(),
      ...resourcesViewDefaults,
      canUpload,
      breadcrumbs,
      folderNotFound,
      hasSpaceHeader,
      isCurrentFolderEmpty,
      resourceTargetRouteCallback,
      performLoaderTask,
      ViewModeConstants,
      viewModes,
      uploadHint: $gettext(
        'Drag files and folders here or use the "New" or "Upload" buttons to add files'
      ),
      whitespaceContextMenu
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['currentFolder', 'totalFilesCount', 'totalFilesSize']),
    ...mapGetters(['user', 'configuration']),

    isRunningOnEos() {
      return !!this.configuration?.options?.runningOnEos
    },

    displayFullAppBar() {
      return !this.displayResourceAsSingleResource
    },

    displayResourceAsSingleResource() {
      if (this.paginatedResources.length !== 1) {
        return false
      }

      if (
        this.isRunningOnEos &&
        (!this.currentFolder.fileId || this.currentFolder.path === this.paginatedResources[0].path)
      ) {
        return true
      }
      if (isPublicSpaceResource(this.space) && !this.paginatedResources[0].isFolder) {
        return true
      }

      return false
    },

    displayThumbnails() {
      return !this.configuration?.options?.disablePreviews
    },

    isSpaceFrontpage() {
      return isProjectSpaceResource(this.space) && this.item === '/'
    }
  },

  watch: {
    item: {
      handler: function () {
        this.performLoaderTask(true)
      }
    },
    space: {
      handler: function () {
        this.performLoaderTask(true)
      }
    }
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapMutations('Files', ['REMOVE_FILES', 'REMOVE_FILES_FROM_SEARCHED', 'RESET_SELECTION']),

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
        this.$loadingService,
        this.createModal,
        this.hideModal,
        this.showMessage,
        this.$gettext,
        this.$ngettext,
        this.$gettextInterpolate
      )
      const movedResources = await copyMove.perform(TransferType.MOVE)
      this.REMOVE_FILES(movedResources)
      this.REMOVE_FILES_FROM_SEARCHED(movedResources)
      this.RESET_SELECTION()
    },

    rowMounted(resource, component, dimensions) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          previewService: this.$previewService,
          space: this.space,
          resource,
          dimensions,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
