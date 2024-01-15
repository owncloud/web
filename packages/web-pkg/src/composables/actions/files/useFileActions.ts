import kebabCase from 'lodash-es/kebabCase'
import { Store } from 'vuex'
import { ShareStatus } from '@ownclouders/web-client/src/helpers/share'
import { routeToContextQuery } from '../../appDefaults'
import { configurationManager } from '../../../configuration'

import { isLocationSharesActive, isLocationTrashActive } from '../../../router'
import { computed, unref } from 'vue'
import { useStore } from '../../store'
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
  useFileActionsAcceptShare,
  useFileActionsToggleHideShare,
  useFileActionsCopy,
  useFileActionsDeclineShare,
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
import { useAppsStore, useCapabilityStore } from '../../piniaStores'
import { ApplicationFileExtension } from '../../../apps'

export const EDITOR_MODE_EDIT = 'edit'
export const EDITOR_MODE_CREATE = 'create'

export interface GetFileActionsOptions extends FileActionOptions {
  omitSystemActions?: boolean
}

export const useFileActions = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const appsStore = useAppsStore()
  const capabilityStore = useCapabilityStore()
  const router = useRouter()
  const { $gettext } = useGettext()
  const isSearchActive = useIsSearchActive()
  const appProvidersEnabled = computed(() => {
    return !!capabilityStore.filesAppProviders.find((appProvider) => appProvider.enabled)
  })

  const { openUrl } = useWindowOpen()

  const { actions: acceptShareActions } = useFileActionsAcceptShare({ store })
  const { actions: hideShareActions } = useFileActionsToggleHideShare({ store })
  const { actions: copyActions } = useFileActionsCopy({ store })
  const { actions: deleteActions } = useFileActionsDelete({ store })
  const { actions: declineShareActions } = useFileActionsDeclineShare({ store })
  const { actions: downloadArchiveActions } = useFileActionsDownloadArchive()
  const { actions: downloadFileActions } = useFileActionsDownloadFile()
  const { actions: favoriteActions } = useFileActionsFavorite({ store })
  const { actions: moveActions } = useFileActionsMove({ store })
  const { actions: navigateActions } = useFileActionsNavigate({ store })
  const { actions: renameActions } = useFileActionsRename({ store })
  const { actions: restoreActions } = useFileActionsRestore({ store })
  const { actions: createSpaceFromResource } = useFileActionsCreateSpaceFromResource({ store })
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
    ...unref(acceptShareActions),
    ...unref(hideShareActions),
    ...unref(declineShareActions),
    ...unref(favoriteActions),
    ...unref(navigateActions)
  ])

  const editorActions = computed(() => {
    return appsStore.fileExtensions
      .map((fileExtension): FileAction => {
        const appInfo = appsStore.apps[fileExtension.app]

        return {
          name: `editor-${fileExtension.app}`,
          label: () => {
            if (fileExtension.label) {
              return $gettext(fileExtension.label)
            }
            return $gettext('Open in %{app}', { app: appInfo.name }, true)
          },
          icon: appInfo.icon,
          ...(appInfo.iconFillType && {
            iconFillType: appInfo.iconFillType
          }),
          img: appInfo.img,
          handler: (options) =>
            openEditor(
              fileExtension,
              options.space.getDriveAliasAndItem(options.resources[0]),
              options.resources[0].webDavPath,
              options.resources[0].fileId,
              EDITOR_MODE_EDIT,
              options.space.shareId
            ),
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }

            if (
              !unref(isSearchActive) &&
              (isLocationTrashActive(router, 'files-trash-generic') ||
                (isLocationSharesActive(router, 'files-shares-with-me') &&
                  resources[0].status !== ShareStatus.accepted))
            ) {
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

  const routeOptsHelper = (
    appFileExtension: ApplicationFileExtension,
    driveAliasAndItem: string,
    filePath: string,
    fileId: string,
    mode: string,
    shareId: string
  ) => {
    return {
      name: appFileExtension.routeName || appFileExtension.app,
      params: {
        driveAliasAndItem,
        filePath,
        fileId,
        mode
      },
      query: {
        ...(shareId && { shareId }),
        ...(fileId && configurationManager.options.routing.idBased && { fileId }),
        ...routeToContextQuery(unref(router.currentRoute))
      }
    }
  }

  const openEditor = (
    appFileExtension: ApplicationFileExtension,
    driveAliasAndItem: string,
    filePath: string,
    fileId: string,
    mode: string,
    shareId: string = undefined
  ) => {
    const configuration = store.getters['configuration']

    if (appFileExtension.handler) {
      return appFileExtension.handler({
        config: configuration,
        driveAliasAndItem,
        filePath,
        fileId,
        mode,
        ...(shareId && { shareId })
      })
    }

    const routeOpts = routeOptsHelper(
      appFileExtension,
      driveAliasAndItem,
      filePath,
      fileId,
      mode,
      shareId
    )

    if (configuration.options.openAppsInTab) {
      const path = router.resolve(routeOpts).href
      const target = `${appFileExtension.routeName}-${filePath}`

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
    const filterCallback = (action) =>
      action.isEnabled({
        ...options,
        parent: store.getters['Files/currentFolder']
      })

    // first priority: handlers from config
    const enabledEditorActions = unref(editorActions).filter(filterCallback)

    // second priority: `/app/open` endpoint of app provider if available
    // FIXME: files app should not know anything about the `external apps` app
    const externalAppsActions = loadExternalAppActions(options).filter(filterCallback)

    // prioritize apps that have hasPriority set
    const appActions = [...enabledEditorActions, ...externalAppsActions].sort(
      (a, b) => Number(b.hasPriority) - Number(a.hasPriority)
    )

    if (appActions.length) {
      return appActions[0]
    }

    // fallback: system actions
    return options.omitSystemActions ? null : unref(systemActions).filter(filterCallback)[0]
  }

  const getAllAvailableActions = (options: FileActionOptions) => {
    return [
      ...unref(editorActions),
      ...loadExternalAppActions(options),
      ...unref(systemActions)
    ].filter((action) => {
      return action.isEnabled(options)
    })
  }

  // returns an array of available external Apps
  // to open a resource with a specific mimeType
  // FIXME: filesApp should not know anything about any other app, dont cross the line!!! BAD
  const loadExternalAppActions = (options: FileActionOptions): Action[] => {
    if (isLocationTrashActive(router, 'files-trash-generic')) {
      return []
    }

    // we don't support external apps as batch action as of now
    if (options.resources.length !== 1) {
      return []
    }

    const resource = options.resources[0]
    const { mimeType, webDavPath, fileId } = resource
    const driveAliasAndItem = options.space?.getDriveAliasAndItem(resource)
    if (!driveAliasAndItem) {
      return []
    }

    const mimeTypes = store.getters['External/mimeTypes'] || []
    if (mimeType === undefined || !unref(appProvidersEnabled) || !mimeTypes.length) {
      return []
    }

    const filteredMimeTypes = mimeTypes.find((t) => t.mime_type === mimeType)
    if (filteredMimeTypes === undefined) {
      return []
    }
    const { app_providers: appProviders = [], default_application: defaultApplication } =
      filteredMimeTypes

    return appProviders.map((app): FileAction => {
      const label = $gettext('Open in %{ appName }')
      return {
        name: app.name,
        icon: app.icon,
        img: app.img,
        componentType: 'button',
        class: `oc-files-actions-${app.name}-trigger`,
        isEnabled: () => true,
        hasPriority: defaultApplication === app.name,
        handler: () =>
          openExternalApp(app.name, driveAliasAndItem, webDavPath, fileId, options.space.shareId),
        label: () => $gettext(label, { appName: app.name })
      }
    })
  }

  const openExternalApp = (app, driveAliasAndItem: string, filePath, fileId, shareId) => {
    const routeOpts = routeOptsHelper(
      {
        routeName: 'external-apps'
      },
      driveAliasAndItem,
      filePath,
      undefined,
      undefined,
      shareId
    )

    routeOpts.query = {
      app,
      fileId,
      ...routeOpts.query
    } as any

    openUrl(
      router.resolve(routeOpts).href,
      configurationManager.options.openAppsInTab ? '_blank' : '_self'
    )
  }

  return {
    editorActions,
    systemActions,
    getDefaultAction,
    getDefaultEditorAction,
    getAllAvailableActions,
    loadExternalAppActions,
    openEditor,
    triggerAction,
    triggerDefaultAction
  }
}
