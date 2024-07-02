<template>
  <main :id="applicationId" class="oc-height-1-1" @keydown.esc="closeApp">
    <h1 class="oc-invisible-sr" v-text="pageTitle" />
    <app-top-bar
      v-if="!loading && !loadingError && resource"
      :main-actions="fileActions"
      :drop-down-menu-sections="dropDownMenuSections"
      :drop-down-action-options="dropDownActionOptions"
      :is-editor="isEditor"
      :resource="resource"
      @close="closeApp"
    />
    <loading-screen v-if="loading" />
    <error-screen v-else-if="loadingError" :message="loadingError.message" />
    <div
      v-else
      class="oc-flex oc-width-1-1 oc-height-1-1"
      :class="{ 'app-sidebar-open': isSideBarOpen }"
    >
      <slot class="oc-height-1-1 oc-width-1-1" v-bind="slotAttrs" />
      <file-side-bar :is-open="isSideBarOpen" :active-panel="sideBarActivePanel" :space="space" />
    </div>
  </main>
</template>

<script lang="ts">
import {
  PropType,
  Ref,
  defineComponent,
  onBeforeUnmount,
  ref,
  unref,
  watch,
  computed,
  onMounted
} from 'vue'
import { DateTime } from 'luxon'
import { useTask } from 'vue-concurrency'
import { useGettext } from 'vue3-gettext'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

import AppTopBar from '../AppTopBar.vue'
import ErrorScreen from './PartialViews/ErrorScreen.vue'
import LoadingScreen from './PartialViews/LoadingScreen.vue'
import FileSideBar from '../SideBar/FileSideBar.vue'
import {
  UrlForResourceOptions,
  queryItemAsString,
  useAppDefaults,
  useClientService,
  useRoute,
  useRouteParam,
  useRouteQuery,
  useSelectedResources,
  useSideBar,
  useModals,
  useMessages,
  useSpacesStore,
  useAppsStore,
  useConfigStore,
  useResourcesStore,
  FileContentOptions,
  useFileActionsCopyQuickLink,
  useFileActionsDownloadFile,
  useFileActionsShowDetails,
  useFileActionsShowShares,
  FileActionOptions,
  FileAction,
  useLoadingService
} from '../../composables'
import {
  Action,
  Modifier,
  Key,
  useAppMeta,
  useGetResourceContext,
  useKeyboardActions
} from '../../composables'
import {
  Resource,
  SpaceResource,
  call,
  isPersonalSpaceResource,
  isProjectSpaceResource,
  isShareSpaceResource
} from '@ownclouders/web-client'
import { DavPermission } from '@ownclouders/web-client/webdav'
import { HttpError } from '@ownclouders/web-client'
import { dirname } from 'path'

export default defineComponent({
  name: 'AppWrapper',
  components: {
    AppTopBar,
    FileSideBar,
    ErrorScreen,
    LoadingScreen
  },
  props: {
    // TODO: Add app-top-bar-actions array prop and pass to AppTopBar
    applicationId: {
      type: String,
      required: true
    },
    urlForResourceOptions: {
      type: Object as PropType<UrlForResourceOptions>,
      default: (): UrlForResourceOptions => null,
      required: false
    },
    fileContentOptions: {
      type: Object as PropType<FileContentOptions>,
      default: (): FileContentOptions => null,
      required: false
    },
    wrappedComponent: {
      type: Object as PropType<ReturnType<typeof defineComponent>>,
      default: null
    },
    importResourceWithExtension: {
      type: Function as PropType<(resource: Resource) => string>,
      default: (): Resource => null
    }
  },
  setup(props) {
    const { $gettext } = useGettext()
    const appsStore = useAppsStore()
    const { showMessage, showErrorMessage } = useMessages()
    const router = useRouter()
    const currentRoute = useRoute()
    const clientService = useClientService()
    const loadingService = useLoadingService()
    const { getResourceContext } = useGetResourceContext()
    const { selectedResources } = useSelectedResources()
    const { dispatchModal } = useModals()
    const spacesStore = useSpacesStore()
    const configStore = useConfigStore()
    const resourcesStore = useResourcesStore()

    const { actions: createQuickLinkActions } = useFileActionsCopyQuickLink()
    const { actions: downloadFileActions } = useFileActionsDownloadFile()
    const { actions: showDetailsActions } = useFileActionsShowDetails()
    const { actions: showSharesActions } = useFileActionsShowShares()

    const noResourceLoading = computed(() => {
      // component has its own way to load the resource(s)
      return Boolean(props.wrappedComponent.emits?.includes('update:resource'))
    })

    const resource: Ref<Resource> = ref()
    const space: Ref<SpaceResource> = ref()
    const currentETag = ref('')
    const url = ref('')
    const loading = ref(!unref(noResourceLoading))
    const loadingError: Ref<Error> = ref()
    const isReadOnly = ref(false)
    const serverContent = ref()
    const currentContent = ref()

    const isEditor = computed(() => {
      return Boolean(props.wrappedComponent.emits?.includes('update:currentContent'))
    })

    const hasProp = (name: string) => {
      return Boolean(Object.keys(props.wrappedComponent.props).includes(name))
    }

    const isDirty = computed(() => {
      return unref(currentContent) !== unref(serverContent)
    })

    const preventUnload = (e: Event) => {
      e.preventDefault()
    }

    watch(isDirty, (dirty) => {
      // Prevent reload if there are changes
      if (dirty) {
        window.addEventListener('beforeunload', preventUnload)
      } else {
        window.removeEventListener('beforeunload', preventUnload)
      }
    })

    const {
      applicationConfig,
      closeApp,
      currentFileContext,
      getFileContents,
      getFileInfo,
      getUrlForResource,
      putFileContents,
      replaceInvalidFileRoute,
      revokeUrl,
      activeFiles,
      loadFolderForFileContext,
      isFolderLoading
    } = useAppDefaults({
      applicationId: props.applicationId
    })

    const { applicationMeta } = useAppMeta({ applicationId: props.applicationId, appsStore })

    const pageTitle = computed(() => {
      const { name: appName } = unref(applicationMeta)

      return $gettext(`%{appName} for %{fileName}`, {
        appName: $gettext(appName),
        fileName: unref(unref(currentFileContext).fileName)
      })
    })

    const driveAliasAndItem = useRouteParam('driveAliasAndItem')
    const fileIdQueryItem = useRouteQuery('fileId')
    const fileId = computed(() => {
      return queryItemAsString(unref(fileIdQueryItem))
    })

    const addMissingDriveAliasAndItem = async () => {
      const id = unref(fileId)
      const { space, path } = await getResourceContext(id)
      const driveAliasAndItem = space.getDriveAliasAndItem({ path } as Resource)

      if (isPersonalSpaceResource(space)) {
        return router.push({
          params: {
            ...unref(currentRoute).params,
            driveAliasAndItem
          },
          query: {
            ...unref(currentRoute).query,
            fileId: id,
            contextRouteName: 'files-spaces-generic',
            contextRouteParams: { driveAliasAndItem: dirname(driveAliasAndItem) } as any
          }
        })
      }

      return router.push({
        params: {
          ...unref(currentRoute).params,
          driveAliasAndItem
        },
        query: {
          ...unref(currentRoute).query,
          fileId: id,
          contextRouteName: path === '/' ? 'files-shares-with-me' : 'files-spaces-generic',
          ...(isShareSpaceResource(space) && { shareId: space.id }),
          contextRouteParams: {
            driveAliasAndItem: dirname(driveAliasAndItem)
          } as any,
          contextRouteQuery: {
            ...(isShareSpaceResource(space) && { shareId: space.id })
          } as any
        }
      })
    }

    const loadFileTask = useTask(function* () {
      try {
        if (!unref(driveAliasAndItem)) {
          yield addMissingDriveAliasAndItem()
        }

        space.value = unref(unref(currentFileContext).space)
        resource.value = yield getFileInfo(currentFileContext)
        resourcesStore.initResourceList({ currentFolder: null, resources: [unref(resource)] })
        selectedResources.value = [unref(resource)]

        const newExtension = props.importResourceWithExtension(unref(resource))
        if (newExtension) {
          const timestamp = DateTime.local().toFormat('yyyyMMddHHmmss')
          const targetPath = `${unref(resource).name}_${timestamp}.${newExtension}`
          if (
            !(yield clientService.webdav.copyFiles(unref(space), unref(resource), unref(space), {
              path: targetPath
            }))
          ) {
            throw new Error($gettext('Importing failed'))
          }

          resource.value = { path: targetPath } as Resource
        }

        if (replaceInvalidFileRoute(currentFileContext, unref(resource))) {
          return
        }

        isReadOnly.value = ![DavPermission.Updateable, DavPermission.FileUpdateable].some(
          (p) => (unref(resource).permissions || '').indexOf(p) > -1
        )

        if (unref(hasProp('currentContent'))) {
          const fileContentsResponse = yield* call(
            getFileContents(currentFileContext, props.fileContentOptions)
          )
          serverContent.value = currentContent.value = fileContentsResponse.body
          currentETag.value = fileContentsResponse.headers['OC-ETag']
        }

        if (unref(hasProp('url'))) {
          url.value = yield getUrlForResource(
            unref(space),
            unref(resource),
            props.urlForResourceOptions
          )
        }
        loading.value = false
      } catch (e) {
        console.error(e)
        loadingError.value = e
        loading.value = false
      }
    }).restartable()

    watch(
      currentFileContext,
      () => {
        if (!unref(noResourceLoading)) {
          loadFileTask.perform()
        }
      },
      { immediate: true }
    )

    const errorPopup = (error: HttpError) => {
      console.error(error)
      showErrorMessage({
        title: $gettext('An error occurred'),
        desc: error.message,
        errors: [error]
      })
    }

    const autosavePopup = () => {
      showMessage({ title: $gettext('File autosaved') })
    }

    const saveFileTask = useTask(function* () {
      const newContent = unref(currentContent)
      try {
        const putFileContentsResponse = yield putFileContents(currentFileContext, {
          content: newContent,
          previousEntityTag: unref(currentETag)
        })
        serverContent.value = newContent
        currentETag.value = putFileContentsResponse.etag
        resourcesStore.upsertResource(putFileContentsResponse)
      } catch (e) {
        switch (e.statusCode) {
          case 401:
          case 403:
            errorPopup(
              new HttpError($gettext("You're not authorized to save this file"), e.response)
            )
            break
          case 409:
          case 412:
            errorPopup(
              new HttpError(
                $gettext(
                  'This file was updated outside this window. Please refresh the page (all changes will be lost).'
                ),
                e.response
              )
            )
            break
          case 507:
            const space = spacesStore.spaces.find(
              (space) => space.id === unref(resource).storageId && isProjectSpaceResource(space)
            )
            if (space) {
              errorPopup(
                new HttpError(
                  $gettext('There is not enough quota on "%{spaceName}" to save this file', {
                    spaceName: space.name
                  }),
                  e.response
                )
              )
              break
            }
            errorPopup(
              new HttpError($gettext('There is not enough quota to save this file'), e.response)
            )
            break
          default:
            errorPopup(new HttpError('', e.response))
        }
      }
    }).drop()

    const save = async () => {
      await saveFileTask.perform()
    }

    let autosaveIntervalId: ReturnType<typeof setInterval> = null
    onMounted(() => {
      if (!unref(isEditor)) {
        return
      }
      const editorOptions = configStore.options.editor
      if (editorOptions.autosaveEnabled) {
        autosaveIntervalId = setInterval(
          async () => {
            if (isDirty.value) {
              await save()
              autosavePopup()
            }
          },
          (editorOptions.autosaveInterval || 120) * 1000
        )
      }
    })
    onBeforeUnmount(() => {
      if (!loadingService.isLoading) {
        window.removeEventListener('beforeunload', preventUnload)
      }

      if (unref(hasProp('url'))) {
        revokeUrl(url.value)
      }

      if (!unref(isEditor)) {
        return
      }

      clearInterval(autosaveIntervalId)
      autosaveIntervalId = null
    })

    const { bindKeyAction } = useKeyboardActions({ skipDisabledKeyBindingsCheck: true })
    bindKeyAction({ modifier: Modifier.Ctrl, primary: Key.S }, () => {
      if (!unref(isDirty)) {
        return
      }
      save()
    })

    const fileActionsSave = computed<FileAction[]>(() => {
      return [
        {
          name: 'save-file',
          disabledTooltip: () => '',
          isVisible: () => unref(isEditor),
          isDisabled: () => isReadOnly.value || !isDirty.value,
          componentType: 'button',
          icon: 'save',
          id: 'app-save-action',
          label: () => 'Save',
          handler: () => {
            save()
          }
        }
      ]
    })

    const actionOptions = computed<FileActionOptions>(() => {
      return {
        space: unref(space),
        resources: [unref(resource)]
      }
    })

    const menuItemsContext = computed(() => {
      return [...unref(fileActionsSave)].filter((item) => item.isVisible(unref(actionOptions)))
    })
    const menuItemsShare = computed(() => {
      return [...unref(showSharesActions), ...unref(createQuickLinkActions)].filter((item) =>
        item.isVisible(unref(actionOptions))
      )
    })
    const menuItemsActions = computed(() => {
      return [...unref(downloadFileActions)].filter((item) => item.isVisible(unref(actionOptions)))
    })
    const menuItemsSidebar = computed(() => {
      return [...unref(showDetailsActions)].filter((item) => item.isVisible(unref(actionOptions)))
    })
    const dropDownMenuSections = computed(() => {
      const sections = []

      if (unref(menuItemsContext).length) {
        sections.push({
          name: 'context',
          items: unref(menuItemsContext)
        })
      }
      if (unref(menuItemsShare).length) {
        sections.push({
          name: 'share',
          items: unref(menuItemsShare)
        })
      }
      if (unref(menuItemsActions).length) {
        sections.push({
          name: 'actions',
          items: unref(menuItemsActions)
        })
      }
      if (unref(menuItemsSidebar).length) {
        sections.push({
          name: 'sidebar',
          items: unref(menuItemsSidebar)
        })
      }
      return sections
    })

    const fileActions = computed((): Action[] => [...unref(fileActionsSave)])

    onBeforeRouteLeave((_to, _from, next) => {
      if (unref(isDirty)) {
        dispatchModal({
          variation: 'danger',
          icon: 'warning',
          title: $gettext('Unsaved changes'),
          message: $gettext('Your changes were not saved. Do you want to save them?'),
          cancelText: $gettext("Don't Save"),
          confirmText: $gettext('Save'),
          focusTrapInitial: '.oc-modal-body-actions-confirm',
          onCancel() {
            next()
          },
          async onConfirm() {
            await save()
            next()
          }
        })
      } else {
        next()
      }
    })

    const slotAttrs = computed(() => ({
      url: unref(url),
      space: unref(unref(currentFileContext).space),
      resource: unref(resource),
      activeFiles: unref(activeFiles),
      isDirty: unref(isDirty),
      isReadOnly: unref(isReadOnly),
      applicationConfig: unref(applicationConfig),
      currentFileContext: unref(currentFileContext),
      currentContent: unref(currentContent),
      isFolderLoading: unref(isFolderLoading),

      'onUpdate:resource': (value: Resource) => {
        resource.value = value
        space.value = unref(unref(currentFileContext).space)
        selectedResources.value = [value]
      },
      'onUpdate:currentContent': (value: unknown) => {
        currentContent.value = value
      },

      onSave: save,
      onClose: closeApp,
      loadFolderForFileContext,
      revokeUrl,
      getUrlForResource
    }))

    return {
      ...useSideBar(),
      dropDownMenuSections,
      dropDownActionOptions: actionOptions,
      isEditor,
      closeApp,
      fileActions,
      loading,
      loadingError,
      pageTitle,
      resource,
      space,
      slotAttrs
    }
  }
})
</script>
<style lang="scss">
@media (max-width: $oc-breakpoint-medium-default) {
  .app-sidebar-open > *:not(:last-child) {
    display: none;
  }
}
</style>
