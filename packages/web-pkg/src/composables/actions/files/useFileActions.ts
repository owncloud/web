import kebabCase from 'lodash-es/kebabCase'
import { isShareSpaceResource } from '@ownclouders/web-client'
import { routeToContextQuery } from '../../appDefaults'
import { isLocationTrashActive } from '../../../router'
import { computed, unref } from 'vue'
import { useRouter } from '../../router'
import { useGettext } from 'vue3-gettext'
import {
  Action,
  FileAction,
  FileActionOptions,
  useFileActionsOpenShortcut,
  useIsSearchActive,
  useWindowOpen
} from '../../actions'

import {
  useFileActionsEnableSync,
  useFileActionsToggleHideShare,
  useFileActionsCopy,
  useFileActionsDisableSync,
  useFileActionsDelete,
  useFileActionsDownloadArchive,
  useFileActionsDownloadFile,
  useFileActionsFavorite,
  useFileActionsMove,
  useFileActionsNavigate,
  useFileActionsRename,
  useFileActionsRestore,
  useFileActionsCreateSpaceFromResource
} from './index'
import { useAppsStore, useConfigStore, useResourcesStore } from '../../piniaStores'
import { ApplicationFileExtension } from '../../../apps'
import { Resource, SpaceResource } from '@ownclouders/web-client'
import { storeToRefs } from 'pinia'
import { useEmbedMode } from '../../embedMode'
import { RouteRecordName } from 'vue-router'

export const EDITOR_MODE_EDIT = 'edit'
export const EDITOR_MODE_CREATE = 'create'

export interface GetFileActionsOptions extends FileActionOptions {
  omitSystemActions?: boolean
}

export const useFileActions = () => {
  const appsStore = useAppsStore()
  const configStore = useConfigStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const isSearchActive = useIsSearchActive()
  const { isEnabled: isEmbedModeEnabled } = useEmbedMode()

  const { openUrl } = useWindowOpen()

  const resourcesStore = useResourcesStore()
  const { currentFolder } = storeToRefs(resourcesStore)

  const isMacOs = computed(() => {
    return window.navigator.platform.match('Mac')
  })

  const { actions: enableSyncActions } = useFileActionsEnableSync()
  const { actions: hideShareActions } = useFileActionsToggleHideShare()
  const { actions: copyActions } = useFileActionsCopy()
  const { actions: deleteActions } = useFileActionsDelete()
  const { actions: disableSyncActions } = useFileActionsDisableSync()
  const { actions: downloadArchiveActions } = useFileActionsDownloadArchive()
  const { actions: downloadFileActions } = useFileActionsDownloadFile()
  const { actions: favoriteActions } = useFileActionsFavorite()
  const { actions: moveActions } = useFileActionsMove()
  const { actions: navigateActions } = useFileActionsNavigate()
  const { actions: renameActions } = useFileActionsRename()
  const { actions: restoreActions } = useFileActionsRestore()
  const { actions: createSpaceFromResource } = useFileActionsCreateSpaceFromResource()
  const { actions: openShortcutActions } = useFileActionsOpenShortcut()

  const systemActions = computed((): Action[] => [
    ...unref(openShortcutActions),
    ...unref(downloadArchiveActions),
    ...unref(downloadFileActions),
    ...unref(deleteActions),
    ...unref(moveActions),
    ...unref(copyActions),
    ...unref(renameActions),
    ...unref(createSpaceFromResource),
    ...unref(restoreActions),
    ...unref(enableSyncActions),
    ...unref(hideShareActions),
    ...unref(disableSyncActions),
    ...unref(favoriteActions),
    ...unref(navigateActions)
  ])

  const editorActions = computed(() => {
    if (unref(isEmbedModeEnabled)) {
      return []
    }

    return appsStore.fileExtensions
      .map((fileExtension): FileAction => {
        const appInfo = appsStore.apps[fileExtension.app]

        return {
          name: `editor-${fileExtension.app}`,
          label: () => {
            if (fileExtension.label) {
              return $gettext(fileExtension.label)
            }
            return $gettext('Open in a %{app}', { app: appInfo.name }, true)
          },
          subtitle: () => {
            return $gettext(
              'Hold %{key} to open in new tab',
              { key: unref(isMacOs) ? '⌥' : 'Alt' },
              true
            )
          },
          icon: fileExtension.icon || appInfo.icon,
          ...(appInfo.iconFillType && {
            iconFillType: appInfo.iconFillType
          }),
          img: appInfo.img,
          handler: (options) =>
            openEditor(
              fileExtension,
              options.space,
              options.resources[0],
              EDITOR_MODE_EDIT,
              options.newTab
            ),
          isVisible: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            if (!resources[0].canDownload() && !fileExtension.secureView) {
              return false
            }

            if (!unref(isSearchActive) && isLocationTrashActive(router, 'files-trash-generic')) {
              return false
            }

            if (resources[0].extension && fileExtension.extension) {
              return resources[0].extension.toLowerCase() === fileExtension.extension.toLowerCase()
            }

            if (resources[0].mimeType && fileExtension.mimeType) {
              return (
                resources[0].mimeType.toLowerCase() === fileExtension.mimeType.toLowerCase() ||
                resources[0].mimeType.split('/')[0].toLowerCase() ===
                  fileExtension.mimeType.toLowerCase()
              )
            }

            return false
          },
          hasPriority: fileExtension.hasPriority,
          componentType: 'button',
          class: `oc-files-actions-${kebabCase(appInfo.name).toLowerCase()}-trigger`
        }
      })
      .sort((first, second) => {
        // Ensure default are listed first
        if (second.hasPriority !== first.hasPriority && second.hasPriority) {
          return 1
        }
        return 0
      })
  })

  const getEditorRouteOpts = (
    routeName: RouteRecordName,
    space: SpaceResource,
    resource: Resource,
    mode: string,
    remoteItemId: string
  ) => {
    return {
      name: routeName,
      params: {
        driveAliasAndItem: space.getDriveAliasAndItem(resource),
        filePath: resource.path,
        fileId: resource.fileId,
        mode
      },
      query: {
        ...(remoteItemId && { shareId: remoteItemId }),
        ...(resource.fileId && configStore.options.routing.idBased && { fileId: resource.fileId }),
        ...routeToContextQuery(unref(router.currentRoute))
      }
    }
  }

  const openEditor = (
    appFileExtension: ApplicationFileExtension,
    space: SpaceResource,
    resource: Resource,
    mode: string,
    newTab = false
  ) => {
    const remoteItemId = isShareSpaceResource(space) ? space.id : undefined
    const routeName = appFileExtension.routeName || appFileExtension.app
    const routeOpts = getEditorRouteOpts(routeName, space, resource, mode, remoteItemId)

    if (newTab) {
      const path = router.resolve(routeOpts).href
      const target = '_blank'
      openUrl(path, target, true)
      return
    }

    router.push(routeOpts)
  }

  // TODO: Make user-configurable what is a defaultAction for a filetype/mimetype
  // returns the _first_ action from actions array which we now construct from
  // available mime-types coming from the app-provider and existing actions
  const triggerDefaultAction = (options: FileActionOptions) => {
    const action = getDefaultAction(options)
    action.handler({ ...options })
  }

  const triggerAction = (name: string, options: FileActionOptions) => {
    const action = getAllAvailableActions(options).filter((action) => action.name === name)[0]
    if (!action) {
      throw new Error(`Action not found: '${name}'`)
    }

    action.handler(options)
  }

  const getDefaultEditorAction = (options: FileActionOptions): Action | null => {
    return getDefaultAction({ ...options, omitSystemActions: true })
  }

  const getDefaultAction = (options: GetFileActionsOptions): Action | null => {
    const filterCallback = (action: FileAction) =>
      action.isVisible({
        ...options,
        // FIXME: parent does not exit in FileActionOptions, what is this supposed to do?
        parent: unref(currentFolder)
      } as any)

    // first priority: handlers from config
    const enabledEditorActions = unref(editorActions).filter(filterCallback)

    // prioritize apps that have hasPriority set
    const appActions = enabledEditorActions.sort(
      (a, b) => Number(b.hasPriority) - Number(a.hasPriority)
    )

    if (appActions.length) {
      return appActions[0]
    }

    // fallback: system actions
    return options.omitSystemActions ? null : unref(systemActions).filter(filterCallback)[0]
  }

  const getAllAvailableActions = (options: FileActionOptions) => {
    return [...unref(editorActions), ...unref(systemActions)].filter((action) => {
      return action.isVisible(options)
    })
  }

  return {
    editorActions,
    systemActions,
    getDefaultAction,
    getDefaultEditorAction,
    getAllAvailableActions,
    getEditorRouteOpts,
    openEditor,
    triggerAction,
    triggerDefaultAction
  }
}
