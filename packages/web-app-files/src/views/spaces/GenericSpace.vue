<template>
  <div class="oc-flex oc-width-1-1" :class="{ 'space-frontpage': isSpaceFrontpage }">
    <whitespace-context-menu ref="whitespaceContextMenu" :space="space" />
    <files-view-wrapper>
      <app-bar
        ref="appBarRef"
        :breadcrumbs="breadcrumbs"
        :breadcrumbs-context-actions-items="[currentFolder]"
        :has-bulk-actions="displayFullAppBar"
        :show-actions-on-selection="displayFullAppBar"
        :has-view-options="displayFullAppBar"
        :is-side-bar-open="isSideBarOpen"
        :space="space"
        :view-modes="viewModes"
        @item-dropped="fileDropped"
      >
        <template #actions="{ limitedScreenSpace }">
          <create-and-upload
            v-if="!isEmbedModeEnabled"
            key="create-and-upload-actions"
            data-testid="actions-create-and-upload"
            :space="space"
            :item="item"
            :item-id="itemId"
            :limited-screen-space="limitedScreenSpace"
          />
          <oc-button
            v-if="isEmbedModeEnabled && !isFilePicker"
            key="new-folder-btn"
            v-oc-tooltip="limitedScreenSpace ? $gettext('New folder') : ''"
            class="oc-mr-s"
            data-testid="btn-new-folder"
            :aria-label="$gettext('New folder')"
            appearance="filled"
            variation="primary"
            :disabled="!canUpload"
            @click="createNewFolderAction"
          >
            <oc-icon name="add" />
            <span v-if="!limitedScreenSpace" v-text="$gettext('New folder')" />
          </oc-button>
        </template>
      </app-bar>
      <app-loading-spinner v-if="areResourcesLoading" />
      <template v-else>
        <not-found-message v-if="folderNotFound" :space="space" class="files-not-found" />
        <template v-else>
          <space-header
            v-if="hasSpaceHeader"
            :space="space"
            :is-side-bar-open="isSideBarOpen"
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
          <template v-else>
            <resource-details
              v-if="displayResourceAsSingleResource"
              :single-resource="paginatedResources[0]"
              :space="space"
            />
            <component
              :is="folderView.component"
              v-else
              v-model:selectedIds="selectedResourcesIds"
              :resources="paginatedResources"
              :view-mode="viewMode"
              :target-route-callback="resourceTargetRouteCallback"
              :space="space"
              :drag-drop="true"
              :sort-by="sortBy"
              :sort-dir="sortDir"
              :is-side-bar-open="isSideBarOpen"
              :header-position="fileListHeaderY /* table */"
              :sort-fields="sortFields /* tiles */"
              :view-size="viewSize /* tiles */"
              :style="folderViewStyle"
              v-bind="folderView.componentAttrs?.()"
              @file-dropped="fileDropped"
              @file-click="onFileClick"
              @row-mounted="rowMounted"
              @sort="handleSort"
            >
              <template #contextMenu="{ resource }">
                <context-actions
                  v-if="isResourceInSelection(resource)"
                  :action-options="{ space, resources: selectedResources }"
                />
              </template>

              <template #footer>
                <pagination :pages="paginationPages" :current-page="paginationPage" />
                <list-info v-if="paginatedResources.length > 0" class="oc-width-1-1 oc-my-s" />
              </template>
              <template #quickActions="{ resource }">
                <quick-actions
                  :class="resource.preview"
                  class="oc-visible@s"
                  :space="space"
                  :item="resource"
                />
              </template>
            </component>
          </template>
        </template>
      </template>
    </files-view-wrapper>
    <file-side-bar :is-open="isSideBarOpen" :active-panel="sideBarActivePanel" :space="space" />
  </div>
</template>

<script lang="ts">
import { debounce, omit, last } from 'lodash-es'
import { basename } from 'path'
import {
  computed,
  ComponentPublicInstance,
  defineComponent,
  PropType,
  onBeforeUnmount,
  onMounted,
  unref,
  ref
} from 'vue'
import { RouteLocationNamedRaw } from 'vue-router'
import { useGettext } from 'vue3-gettext'
import { Resource } from '@ownclouders/web-client'
import {
  isPersonalSpaceResource,
  isProjectSpaceResource,
  isPublicSpaceResource,
  isShareSpaceResource,
  SpaceResource
} from '@ownclouders/web-client'

import {
  isResourceTxtFileAlmostEmpty,
  MouseEventButton,
  ProcessorType,
  ResourceTransfer,
  TransferType,
  useConfigStore,
  useEmbedMode,
  useExtensionRegistry,
  useFileActions,
  useFileActionsCreateNewFolder,
  useFolderLink,
  usePasteWorker,
  useResourcesStore,
  useRouter,
  useUserStore
} from '@ownclouders/web-pkg'

import {
  AppBar,
  AppLoadingSpinner,
  ContextActions,
  FileSideBar,
  NoContentMessage,
  Pagination,
  ResourceTable,
  CreateTargetRouteOptions,
  FolderViewModeConstants,
  VisibilityObserver,
  createFileRouteOptions,
  createLocationPublic,
  createLocationSpaces,
  displayPositionedDropdown,
  useBreadcrumbsFromPath,
  useClientService,
  useDocumentTitle,
  useOpenWithDefaultApp,
  useKeyboardActions,
  useRoute,
  useRouteQuery
} from '@ownclouders/web-pkg'
import CreateAndUpload from '../../components/AppBar/CreateAndUpload.vue'
import FilesViewWrapper from '../../components/FilesViewWrapper.vue'
import ListInfo from '../../components/FilesList/ListInfo.vue'
import NotFoundMessage from '../../components/FilesList/NotFoundMessage.vue'
import QuickActions from '../../components/FilesList/QuickActions.vue'
import ResourceDetails from '../../components/FilesList/ResourceDetails.vue'
import { ResourceTiles } from '@ownclouders/web-pkg'
import SpaceHeader from '../../components/Spaces/SpaceHeader.vue'
import WhitespaceContextMenu from 'web-app-files/src/components/Spaces/WhitespaceContextMenu.vue'
import { eventBus } from '@ownclouders/web-pkg'
import { useResourcesViewDefaults } from '../../composables'
import { FolderLoaderOptions } from '../../services/folder'
import { BreadcrumbItem } from 'design-system/src/components/OcBreadcrumb/types'
import { v4 as uuidv4 } from 'uuid'
import {
  useKeyboardTableMouseActions,
  useKeyboardTableNavigation,
  useKeyboardTableSpaceActions
} from 'web-app-files/src/composables/keyboardActions'
import { storeToRefs } from 'pinia'
import { folderViewsFolderExtensionPoint } from '../../extensionPoints'

const visibilityObserver = new VisibilityObserver()

export default defineComponent({
  name: 'GenericSpace',

  components: {
    AppBar,
    AppLoadingSpinner,
    ContextActions,
    CreateAndUpload,
    FileSideBar,
    FilesViewWrapper,
    ListInfo,
    NoContentMessage,
    NotFoundMessage,
    Pagination,
    QuickActions,
    ResourceDetails,
    ResourceTable,
    ResourceTiles,
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
    const router = useRouter()
    const userStore = useUserStore()
    const { $gettext, $ngettext } = useGettext()
    const openWithDefaultAppQuery = useRouteQuery('openWithDefaultApp')
    const clientService = useClientService()
    const { startWorker } = usePasteWorker()
    const { breadcrumbsFromPath, concatBreadcrumbs } = useBreadcrumbsFromPath()
    const { openWithDefaultApp } = useOpenWithDefaultApp()
    const { getFolderLink } = useFolderLink()

    const space = computed(() => props.space)

    const { actions: createNewFolder } = useFileActionsCreateNewFolder({ space })

    const { isEnabled: isEmbedModeEnabled, isFilePicker } = useEmbedMode()

    const configStore = useConfigStore()
    const { options: configOptions } = storeToRefs(configStore)

    const resourcesStore = useResourcesStore()
    const { removeResources, resetSelection, updateResourceField } = resourcesStore
    const {
      currentFolder,
      totalResourcesCount,
      totalResourcesSize,
      areHiddenFilesShown,
      ancestorMetaData
    } = storeToRefs(resourcesStore)

    let loadResourcesEventToken: string

    const canUpload = computed(() => {
      return unref(currentFolder)?.canUpload({ user: userStore.user })
    })

    const extensionRegistry = useExtensionRegistry()
    const viewModes = computed(() => {
      return [
        ...extensionRegistry
          .requestExtensions(folderViewsFolderExtensionPoint)
          .map((e) => e.folderView)
      ]
    })

    const resourceTargetRouteCallback = ({
      path,
      fileId
    }: CreateTargetRouteOptions): RouteLocationNamedRaw => {
      const { params, query } = createFileRouteOptions(unref(space), { path, fileId })
      if (isPublicSpaceResource(unref(space))) {
        return createLocationPublic('files-public-link', { params, query })
      }
      return createLocationSpaces('files-spaces-generic', { params, query })
    }

    const hasSpaceHeader = computed(() => {
      // for now the space header is only available in the root of a project space.
      return unref(space).driveType === 'project' && props.item === '/'
    })

    const folderNotFound = computed(() => unref(currentFolder) === null)

    const isCurrentFolderEmpty = computed(
      () => unref(resourcesViewDefaults.paginatedResources).length < 1
    )

    const titleSegments = computed(() => {
      const segments = [unref(space).name]
      if (props.item !== '/') {
        segments.unshift(basename(props.item))
      }

      return segments
    })
    useDocumentTitle({ titleSegments })

    const route = useRoute()
    const breadcrumbs = computed(() => {
      const rootBreadcrumbItems: BreadcrumbItem[] = []
      if (isProjectSpaceResource(unref(space))) {
        rootBreadcrumbItems.push({
          id: uuidv4(),
          text: $gettext('Spaces'),
          to: createLocationSpaces('files-spaces-projects'),
          isStaticNav: true
        })
      } else if (isShareSpaceResource(unref(space))) {
        rootBreadcrumbItems.push(
          {
            id: uuidv4(),
            text: $gettext('Shares'),
            to: { path: '/files/shares' },
            isStaticNav: true
          },
          {
            id: uuidv4(),
            text: $gettext('Shared with me'),
            to: { path: '/files/shares/with-me' },
            isStaticNav: true
          }
        )
      }

      let spaceBreadcrumbItem: BreadcrumbItem
      let { params, query } = createFileRouteOptions(unref(space), { fileId: unref(space).fileId })
      query = omit({ ...unref(route).query, ...query }, 'page')
      if (isPersonalSpaceResource(unref(space))) {
        spaceBreadcrumbItem = {
          id: uuidv4(),
          text: unref(space).name,
          ...(unref(space).isOwner(userStore.user) && {
            to: createLocationSpaces('files-spaces-generic', {
              params,
              query
            })
          })
        }
      } else if (isShareSpaceResource(unref(space))) {
        spaceBreadcrumbItem = {
          id: uuidv4(),
          allowContextActions: true,
          text: unref(space).name,
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query: omit(query, 'fileId')
          })
        }
      } else if (isPublicSpaceResource(unref(space))) {
        spaceBreadcrumbItem = {
          id: uuidv4(),
          text: $gettext('Public link'),
          to: createLocationPublic('files-public-link', {
            params,
            query
          }),
          isStaticNav: true
        }
      } else {
        spaceBreadcrumbItem = {
          id: uuidv4(),
          allowContextActions: !unref(hasSpaceHeader),
          text: unref(space).name,
          to: createLocationSpaces('files-spaces-generic', {
            params,
            query
          })
        }
      }

      return concatBreadcrumbs(
        ...rootBreadcrumbItems,
        spaceBreadcrumbItem,
        ...breadcrumbsFromPath({
          route: unref(route),
          space,
          resourcePath: props.item,
          ...(configStore.options.routing.idBased && { ancestorMetaData })
        })
      )
    })

    const focusAndAnnounceBreadcrumb = (sameRoute: boolean) => {
      const breadcrumbEl = document.getElementById('files-breadcrumb')
      if (!breadcrumbEl) {
        return
      }
      const activeBreadcrumb = last(breadcrumbEl.children[0].children)
      const activeBreadcrumbItem = activeBreadcrumb.getElementsByTagName('button')[0]
      if (!activeBreadcrumbItem) {
        return
      }

      const totalFilesCount = unref(totalResourcesCount)
      const itemCount = totalFilesCount.files + totalFilesCount.folders

      const announcement = $ngettext(
        'This folder contains %{ amount } item.',
        'This folder contains %{ amount } items.',
        itemCount,
        { amount: itemCount.toString() }
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

    const folderView = computed(() => {
      const viewMode = unref(resourcesViewDefaults.viewMode)
      return unref(viewModes).find((v) => v.name === viewMode)
    })
    const appBarRef = ref<ComponentPublicInstance | null>()
    const folderViewStyle = computed(() => {
      return {
        ...(unref(folderView)?.isScrollable === false && {
          height: `calc(100% - ${unref(appBarRef)?.$el.getBoundingClientRect().height}px)`
        })
      }
    })

    const keyActions = useKeyboardActions()
    useKeyboardTableNavigation(
      keyActions,
      resourcesViewDefaults.paginatedResources,
      resourcesViewDefaults.viewMode
    )
    useKeyboardTableMouseActions(keyActions, resourcesViewDefaults.viewMode)
    useKeyboardTableSpaceActions(keyActions, space)

    const performLoaderTask = async (
      sameRoute: boolean,
      path?: string,
      fileId?: string | number
    ) => {
      if (resourcesViewDefaults.loadResourcesTask.isRunning) {
        return
      }

      const options: FolderLoaderOptions = { loadShares: !isPublicSpaceResource(unref(space)) }

      try {
        await resourcesViewDefaults.loadResourcesTask.perform(
          unref(space),
          path || props.item,
          fileId || props.itemId,
          options
        )
      } catch (e) {
        console.error(e)
      }

      resourcesViewDefaults.scrollToResourceFromRoute(
        [unref(currentFolder), ...unref(resourcesViewDefaults.paginatedResources)],
        'files-app-bar'
      )
      resourcesViewDefaults.refreshFileListHeaderPosition()
      focusAndAnnounceBreadcrumb(sameRoute)

      if (unref(openWithDefaultAppQuery) === 'true') {
        openWithDefaultApp({
          space: unref(space),
          resource: unref(resourcesViewDefaults.selectedResources)[0]
        })
      }
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

    const whitespaceContextMenu = ref<ComponentPublicInstance<typeof WhitespaceContextMenu>>(null)
    const showContextMenu = (event: MouseEvent) => {
      displayPositionedDropdown(
        unref(whitespaceContextMenu).$el._tippy,
        event,
        unref(whitespaceContextMenu)
      )
    }

    const createNewFolderAction = computed(() => unref(createNewFolder)[0].handler)

    const fileDropped = async (fileTarget: string | { name: string; path: string }) => {
      const selectedResources = unref(resourcesViewDefaults.selectedResources)
      const paginatedResources = unref(resourcesViewDefaults.paginatedResources)

      const selected = [...selectedResources]
      let targetFolder: Resource = null
      if (typeof fileTarget === 'string') {
        targetFolder = paginatedResources.find((e) => e.id === fileTarget)
        const isTargetSelected = selected.some((e) => e.id === fileTarget)
        if (isTargetSelected) {
          return
        }
      } else if (fileTarget instanceof Object) {
        const spaceRootRoutePath = router.resolve(
          createLocationSpaces('files-spaces-generic', {
            params: {
              driveAliasAndItem: unref(space).driveAlias
            }
          })
        ).path

        const splitIndex = fileTarget.path.indexOf(spaceRootRoutePath) + spaceRootRoutePath.length
        const path = decodeURIComponent(fileTarget.path.slice(splitIndex, fileTarget.path.length))

        try {
          targetFolder = await clientService.webdav.getFileInfo(unref(space), { path })
        } catch (e) {
          console.error(e)
          return
        }
      }

      if (!targetFolder || targetFolder.type !== 'folder') {
        return
      }

      const resourceTransfer = new ResourceTransfer(
        unref(space),
        selected,
        unref(space),
        targetFolder,
        currentFolder,
        clientService,
        $gettext,
        $ngettext
      )

      const transferData = await resourceTransfer.getTransferData(TransferType.MOVE)

      startWorker(transferData, ({ successful }) => {
        removeResources(successful)
        resetSelection()
      })
    }

    const onFileClick = ({
      space,
      resources,
      event
    }: {
      space: SpaceResource
      resources: Resource[]
      event: MouseEvent
    }) => {
      const newTab =
        event.button === MouseEventButton.MIDDLE ||
        (event.button === MouseEventButton.LEFT && event.altKey)
      const resource = resources[0]

      /**if (newTab && resource.isFolder && false) {
       const folderLink = getFolderLink(resource)
       const folderHref = router.resolve(folderLink).href
       return window.open(new URL(folderHref, window.location.origin), 'blank')
       }**/

      openWithDefaultApp({ space, resource, newTab })
    }

    return {
      ...useFileActions(),
      ...resourcesViewDefaults,
      configOptions,
      canUpload,
      breadcrumbs,
      folderNotFound,
      hasSpaceHeader,
      isCurrentFolderEmpty,
      resourceTargetRouteCallback,
      performLoaderTask,
      FolderViewModeConstants,
      viewModes,
      appBarRef,
      folderView,
      folderViewStyle,
      uploadHint: computed(() =>
        $gettext('Drag files and folders here or use the "New" or "Upload" buttons to add files')
      ),
      whitespaceContextMenu,
      createNewFolderAction,
      isEmbedModeEnabled,
      isFilePicker,
      currentFolder,
      totalResourcesCount,
      totalResourcesSize,
      updateResourceField,
      areHiddenFilesShown,
      fileDropped,
      isResourceTxtFileAlmostEmpty,
      onFileClick
    }
  },

  computed: {
    displayFullAppBar() {
      return !this.displayResourceAsSingleResource
    },

    displayResourceAsSingleResource() {
      if (this.paginatedResources.length !== 1) {
        return false
      }

      if (this.paginatedResources[0].isFolder) {
        return false
      }

      if (isPublicSpaceResource(this.space) && !this.currentFolder?.fileId) {
        return true
      }

      if (this.configOptions.runningOnEos) {
        if (
          !this.currentFolder.fileId ||
          this.currentFolder.path === this.paginatedResources[0].path
        ) {
          return true
        }
      }

      return false
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
    rowMounted(
      resource: Resource,
      component: ComponentPublicInstance<unknown>,
      dimensions: [number, number]
    ) {
      const loadPreview = async () => {
        if (this.isResourceTxtFileAlmostEmpty(resource)) {
          return
        }

        const processor =
          this.viewMode === FolderViewModeConstants.name.tiles
            ? ProcessorType.enum.fit
            : ProcessorType.enum.thumbnail

        const preview = await this.$previewService.loadPreview(
          {
            space: this.space,
            resource,
            processor,
            dimensions
          },
          true
        )
        if (preview) {
          this.updateResourceField({ id: resource.id, field: 'thumbnail', value: preview })
        }
      }

      const debounced = debounce(({ unobserve }) => {
        unobserve()
        loadPreview()
      }, 250)

      visibilityObserver.observe(component.$el, { onEnter: debounced, onExit: debounced.cancel })
    }
  }
})
</script>
