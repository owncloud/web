<template>
  <home v-if="isLightweightHome" />
  <div v-else class="oc-flex oc-width-1-1" :class="{ 'space-frontpage': isSpaceFrontpage }">
    <keyboard-actions :paginated-resources="paginatedResources" :space="space" />
    <files-view-wrapper>
      <app-bar
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :display-view-mode-switch="!isSingleFile"
        :has-bulk-actions="!isSingleFile"
        :show-actions-on-selection="!isSingleFile"
        :has-sidebar-toggle="!isSingleFile"
        :has-view-options="!isSingleFile"
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
        <space-header
          v-else-if="hasSpaceHeader"
          :space="space"
          :side-bar-open="sideBarOpen"
          class="oc-px-m oc-mt-m"
        />

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
        <div v-else-if="isSingleFile">
          <single-shared-file :space="space" />
        </div>
        <resource-tiles
          v-else-if="viewMode === ViewModeConstants.tilesView.name"
          v-model:selectedIds="selectedResourcesIds"
          :data="paginatedResources"
          class="oc-px-m oc-pt-l"
          :resizable="true"
          :target-route-callback="resourceTargetRouteCallback"
          :space="space"
          :sort-fields="sortFields"
          :sort-by="sortBy"
          :sort-dir="sortDir"
          @row-mounted="rowMounted"
          @file-click="$_fileActions_triggerDefaultAction"
          @sort="handleSort"
        >
          <template #contextMenuActions="{ resource }">
            <context-actions :space="space" :items="[resource]" />
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
          @file-click="$_fileActions_triggerDefaultAction"
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
import { debounce, omit } from 'lodash-es'
import { basename } from 'path'
import {
  computed,
  defineComponent,
  getCurrentInstance,
  PropType,
  onBeforeUnmount,
  onMounted,
  unref
} from 'vue'
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

import MixinAccessibleBreadcrumb from '../../mixins/accessibleBreadcrumb'
import MixinFileActions from '../../mixins/fileActions'

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
import ResourceTiles from '../../components/FilesList/ResourceTiles.vue'
import SideBar from '../../components/SideBar/SideBar.vue'
import SpaceHeader from '../../components/Spaces/SpaceHeader.vue'
import AppLoadingSpinner from 'web-pkg/src/components/AppLoadingSpinner.vue'
import NoContentMessage from 'web-pkg/src/components/NoContentMessage.vue'
import { useRoute } from 'web-pkg/src/composables'
import { useDocumentTitle } from 'web-pkg/src/composables/appDefaults/useDocumentTitle'
import { ImageType } from 'web-pkg/src/constants'
import { VisibilityObserver } from 'web-pkg/src/observer'
import { createFileRouteOptions } from 'web-pkg/src/helpers/router'
import { eventBus } from 'web-pkg/src/services/eventBus'
import { BreadcrumbItem, breadcrumbsFromPath, concatBreadcrumbs } from '../../helpers/breadcrumbs'
import { createLocationPublic, createLocationSpaces } from '../../router'
import { useResourcesViewDefaults, ViewModeConstants } from '../../composables'
import { ResourceTransfer, TransferType } from '../../helpers/resource'
import { FolderLoaderOptions } from '../../services/folder'
import { CreateTargetRouteOptions } from 'web-app-files/src/helpers/folderLink/types'

import SingleSharedFile from './SingleSharedFile.vue'
import Home from './Home.vue'

import MixinFilesListFilter from '../../mixins/filesListFilter'

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
    ResourceTiles,
    SideBar,
    SpaceHeader,
    SingleSharedFile,
    Home
  },

  mixins: [MixinAccessibleBreadcrumb, MixinFileActions, MixinFilesListFilter],

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
    const instance = getCurrentInstance().proxy as any
    const store = useStore()
    let loadResourcesEventToken

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

    const route = useRoute()
    const hasSpaceHeader = computed(() => {
      const elems = decodeURIComponent(route.value?.path)?.split('/').filter(Boolean) || [] //"/files/spaces/eos/project/c/cernbox"
      if (elems.length === 6 && elems[3] === 'project') {
        return true
      }
      // for now the space header is only available in the root of a project space.
      return props.space.driveType === 'project' && props.item === '/'
    })

    const titleSegments = computed(() => {
      const segments = [props.space.name]
      if (props.item !== '/') {
        segments.unshift(basename(props.item))
      }

      return segments
    })
    useDocumentTitle({ titleSegments })

    const { $gettext } = useGettext()
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

      let breadcrumbs = concatBreadcrumbs(
        ...rootBreadcrumbItems,
        spaceBreadcrumbItem,
        // FIXME: needs file ids for each parent folder path
        ...breadcrumbsFromPath(unref(route), props.item)
      )

      // add alias breadcrumb for sciencemesh shares  
      if (
        breadcrumbs?.[1].text === 'sciencemesh' &&
        breadcrumbs?.[2].text &&
        route?.value?.query?.fileName
      ) {
        breadcrumbs[2].text = route.value.query.fileName
      }

      return breadcrumbs
    })

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
      instance.accessibleBreadcrumb_focusAndAnnounceBreadcrumb(sameRoute)
    }

    onMounted(() => {
      performLoaderTask(false)
      loadResourcesEventToken = eventBus.subscribe(
        'app.files.list.load',
        (path?: string, fileId?: string | number) => {
          performLoaderTask(true, path, fileId)
        }
      )
    })

    onBeforeUnmount(() => {
      visibilityObserver.disconnect()
      eventBus.unsubscribe('app.files.list.load', loadResourcesEventToken)
    })

    return {
      ...resourcesViewDefaults,
      breadcrumbs,
      hasSpaceHeader,
      resourceTargetRouteCallback,
      performLoaderTask,
      ViewModeConstants
    }
  },

  computed: {
    ...mapState(['app']),
    ...mapState('Files', ['files']),
    ...mapGetters('Files', ['currentFolder', 'totalFilesCount', 'totalFilesSize']),
    ...mapGetters(['user', 'configuration']),
    ...mapGetters(['homeFolder']),

    isLightweightHome() {
      return (
        this.user.isLightweight && this.homeFolder === `/${this.$route.params.driveAliasAndItem}`
      )
    },
    isSingleFile() {
      if (
        this.paginatedResources.length === 1 &&
        (!this.currentFolder.fileId || this.currentFolder.path === this.paginatedResources[0].path)
      ) {
        return true
      }
      return false
    },
    isEmpty() {
      return this.paginatedResources.length < 1
    },

    folderNotFound() {
      return this.currentFolder === null
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
        !this.isLightweightHome && this.performLoaderTask(true)
      }
    },
    space: {
      handler: function () {
        !this.isLightweightHome && this.performLoaderTask(true)
      }
    },
    paginatedResources: function (from, to) {
      if (this.isSingleFile) {
        this.SET_FILE_SELECTION(this.paginatedResources)

        const defaultAction = this.$_fileActions_getDefaultAction({
          space: this.space,
          resources: this.paginatedResources
        }).label()

        if (
          from?.[0]?.id !== to?.[0]?.id &&
          !this.$route.query.scrollTo &&
          defaultAction !== 'Download'
        ) {
          this.$_fileActions_triggerDefaultAction({
            space: this.space,
            resources: this.paginatedResources,
            sameTab: true
          })
        }
      }
    }
  },

  methods: {
    ...mapActions('Files', ['loadPreview']),
    ...mapActions(['showMessage', 'createModal', 'hideModal']),
    ...mapMutations('Files', [
      'REMOVE_FILES',
      'REMOVE_FILES_FROM_SEARCHED',
      'REMOVE_FILE_SELECTION',
      'SET_FILE_SELECTION'
    ]),

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

    rowMounted(resource, component, dimensions) {
      if (!this.displayThumbnails) {
        return
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        this.loadPreview({
          resource,
          isPublic: isPublicSpaceResource(this.space),
          dimensions,
          type: ImageType.Thumbnail
        })
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
