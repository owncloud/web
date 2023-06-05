import kebabCase from 'lodash-es/kebabCase'
import { Store } from 'vuex'
import { ShareStatus } from 'web-client/src/helpers/share'
import { routeToContextQuery } from 'web-pkg/src/composables/appDefaults'
import { configurationManager } from 'web-pkg/src/configuration'

import { isLocationSharesActive, isLocationTrashActive } from '../../../router'
import { computed, unref } from 'vue'
import { useCapabilityFilesAppProviders, useRouter, useStore } from 'web-pkg/src/composables'
import { useGettext } from 'vue3-gettext'
import {
  Action,
  FileAction,
  FileActionOptions,
  useIsSearchActive
} from 'web-pkg/src/composables/actions'

import {
  useFileActionsAcceptShare,
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
  useFileActionsShowEditTags,
  useFileActionsCreateSpaceFromResource
} from './index'

export const EDITOR_MODE_EDIT = 'edit'
export const EDITOR_MODE_CREATE = 'create'

export const useFileActions = ({ store }: { store?: Store<any> } = {}) => {
  store = store || useStore()
  const router = useRouter()
  const { $gettext, interpolate: $gettextInterpolate } = useGettext()
  const isSearchActive = useIsSearchActive()
  const appProviders = useCapabilityFilesAppProviders()
  const appProvidersEnabled = computed(() => {
    return !!unref(appProviders).find((appProvider) => appProvider.enabled)
  })

  const { actions: acceptShareActions } = useFileActionsAcceptShare({ store })
  const { actions: copyActions } = useFileActionsCopy({ store })
  const { actions: deleteActions } = useFileActionsDelete({ store })
  const { actions: declineShareActions } = useFileActionsDeclineShare({ store })
  const { actions: downloadArchiveActions } = useFileActionsDownloadArchive({ store })
  const { actions: downloadFileActions } = useFileActionsDownloadFile()
  const { actions: favoriteActions } = useFileActionsFavorite({ store })
  const { actions: moveActions } = useFileActionsMove({ store })
  const { actions: navigateActions } = useFileActionsNavigate({ store })
  const { actions: renameActions } = useFileActionsRename({ store })
  const { actions: restoreActions } = useFileActionsRestore({ store })
  const { actions: showEditTagsActions } = useFileActionsShowEditTags({ store })
  const { actions: createSpaceFromResource } = useFileActionsCreateSpaceFromResource({ store })

  const systemActions = computed((): Action[] => [
    ...unref(downloadArchiveActions),
    ...unref(downloadFileActions),
    ...unref(deleteActions),
    ...unref(moveActions),
    ...unref(copyActions),
    ...unref(renameActions),
    ...unref(createSpaceFromResource),
    ...unref(showEditTagsActions),
    ...unref(restoreActions),
    ...unref(acceptShareActions),
    ...unref(declineShareActions),
    ...unref(favoriteActions),
    ...unref(navigateActions)
  ])

  const editorActions = computed(() => {
    const apps = store.state.apps
    return (apps.fileEditors as any[])
      .map((editor): FileAction => {
        return {
          name: `editor-${editor.id}`,
          label: () => {
            if (editor.label) {
              return $gettext(editor.label)
            }
            const translated = $gettext('Open in %{app}')
            return $gettextInterpolate(translated, { app: apps.meta[editor.app].name }, true)
          },
          icon: apps.meta[editor.app].icon,
          ...(apps.meta[editor.app].iconFillType && {
            iconFillType: apps.meta[editor.app].iconFillType
          }),
          img: apps.meta[editor.app].img,
          handler: (options) =>
            openEditor(
              editor,
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

            if (resources[0].extension && editor.extension) {
              return resources[0].extension.toLowerCase() === editor.extension.toLowerCase()
            }

            if (resources[0].mimeType && editor.mimeType) {
              return (
                resources[0].mimeType.toLowerCase() === editor.mimeType.toLowerCase() ||
                resources[0].mimeType.split('/')[0].toLowerCase() === editor.mimeType.toLowerCase()
              )
            }

            return false
          },
          hasPriority: editor.hasPriority,
          componentType: 'button',
          class: `oc-files-actions-${kebabCase(apps.meta[editor.app].name).toLowerCase()}-trigger`
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

  const routeOptsHelper = (app, driveAliasAndItem: string, filePath, fileId, mode, shareId) => {
    return {
      name: app.routeName || app.app,
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
    editor,
    driveAliasAndItem: string,
    filePath,
    fileId,
    mode,
    shareId = undefined
  ) => {
    const configuration = store.getters['configuration']

    if (editor.handler) {
      return editor.handler({
        config: configuration,
        extensionConfig: editor.config,
        driveAliasAndItem,
        filePath,
        fileId,
        mode,
        ...(shareId && { shareId })
      })
    }

    const routeOpts = routeOptsHelper(editor, driveAliasAndItem, filePath, fileId, mode, shareId)

    if (configuration.options.openAppsInTab) {
      const path = router.resolve(routeOpts).href
      const target = `${editor.routeName}-${filePath}`
      const win = window.open(path, target)
      // in case popup is blocked win will be null
      if (win) {
        win.focus()
      }
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

  const getDefaultAction = (options: FileActionOptions): Action => {
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
    return unref(systemActions).filter(filterCallback)[0]
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
        label: () => $gettextInterpolate(label, { appName: app.name })
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

    // TODO: Let users configure whether to open in same/new tab (`_blank` vs `_self`)
    window.open(router.resolve(routeOpts).href, '_blank')
  }

  return {
    editorActions,
    systemActions,
    getAllAvailableActions,
    loadExternalAppActions,
    openEditor,
    triggerAction,
    triggerDefaultAction
  }
}
