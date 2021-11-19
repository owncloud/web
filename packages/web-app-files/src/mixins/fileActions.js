import get from 'lodash-es/get'
import { mapGetters, mapActions, mapState } from 'vuex'

import { checkRoute } from '../helpers/route'
import AcceptShare from './actions/acceptShare'
import Copy from './actions/copy'
import DeclineShare from './actions/declineShare'
import Delete from './actions/delete'
import DownloadArchive from './actions/downloadArchive'
import DownloadFile from './actions/downloadFile'
import Favorite from './actions/favorite'
import Fetch from './actions/fetch'
import Move from './actions/move'
import Navigate from './actions/navigate'
import Rename from './actions/rename'
import Restore from './actions/restore'
import kebabCase from 'lodash-es/kebabCase'

const actionsMixins = [
  'fetch',
  'navigate',
  'downloadArchive',
  'downloadFile',
  'favorite',
  'copy',
  'move',
  'rename',
  'restore',
  'delete',
  'acceptShare',
  'declineShare'
]

export const EDITOR_MODE_EDIT = 'edit'
export const EDITOR_MODE_CREATE = 'create'

export default {
  mixins: [
    AcceptShare,
    Copy,
    DeclineShare,
    Delete,
    DownloadFile,
    DownloadArchive,
    Favorite,
    Fetch,
    Move,
    Navigate,
    Rename,
    Restore
  ],
  computed: {
    ...mapState(['apps']),
    ...mapGetters('Files', ['highlightedFile', 'currentFolder']),
    ...mapGetters('External', ['mimeTypes']),
    ...mapGetters(['capabilities', 'configuration']),

    $_fileActions_systemActions() {
      return actionsMixins.flatMap((actionMixin) => {
        return this[`$_${actionMixin}_items`]
      })
    },

    $_fileActions_editorActions() {
      return this.apps.fileEditors.map((editor) => {
        return {
          label: () => {
            const translated = this.$gettext('Open in %{app}')
            return this.$gettextInterpolate(
              translated,
              { app: this.apps.meta[editor.app].name },
              true
            )
          },
          icon: this.apps.meta[editor.app].icon,
          handler: ({ resources }) =>
            this.$_fileActions_openEditor(
              editor,
              resources[0].path,
              resources[0].id,
              EDITOR_MODE_EDIT
            ),
          isEnabled: ({ resources }) => {
            if (resources.length !== 1) {
              return false
            }
            if (Array.isArray(editor.routes) && !checkRoute(editor.routes, this.$route.name)) {
              return false
            }

            return resources[0].extension === editor.extension
          },
          canBeDefault: true,
          componentType: 'oc-button',
          class: `oc-files-actions-${kebabCase(
            this.apps.meta[editor.app].name
          ).toLowerCase()}-trigger`
        }
      })
    }
  },

  methods: {
    ...mapActions(['openFile']),

    $_fileActions_openEditor(editor, filePath, fileId, mode) {
      if (editor.handler) {
        return editor.handler({
          config: this.configuration,
          extensionConfig: editor.config,
          filePath,
          fileId,
          mode
        })
      }

      // TODO: Refactor (or kill) openFile action in the global store
      this.openFile({
        filePath
      })

      if (editor.newTab) {
        const path = this.$router.resolve({
          name: editor.routeName,
          params: {
            filePath,
            fileId,
            mode
          }
        }).href
        const target = `${editor.routeName}-${filePath}`
        const win = window.open(path, target)
        // in case popup is blocked win will be null
        if (win) {
          win.focus()
        }
        return
      }

      this.$router.push({
        name: editor.routeName || editor.app,
        params: {
          filePath,
          fileId,
          mode,
          contextRouteName: this.$route.name
        }
      })
    },

    // TODO: Make user-configurable what is a defaultAction for a filetype/mimetype
    // returns the _first_ action from actions array which we now construct from
    // available mime-types coming from the app-provider and existing actions
    $_fileActions_triggerDefaultAction(resource) {
      const action = this.$_fileActions_getDefaultAction(resource)
      action.handler({ resources: [resource], ...action.handlerData })
    },

    $_fileActions_getDefaultAction(resource) {
      const resources = [resource]
      const filterCallback = (action) =>
        action.canBeDefault && action.isEnabled({ resources, parent: this.currentFolder })

      // first priority: handlers from config
      const defaultEditorActions = this.$_fileActions_editorActions.filter(filterCallback)
      if (defaultEditorActions.length) {
        return defaultEditorActions[0]
      }

      // second priority: `/app/open` endpoint of app provider if available
      // FIXME: files app should not know anything about the `external apps` app
      const externalAppsActions =
        this.$_fileActions_loadExternalAppActions(resources).filter(filterCallback)
      if (externalAppsActions.length) {
        return externalAppsActions[0]
      }

      // fallback: system actions
      return this.$_fileActions_systemActions.filter(filterCallback)[0]
    },

    $_fileActions_getAllAvailableActions(resources) {
      return [
        ...this.$_fileActions_editorActions,
        ...this.$_fileActions_loadExternalAppActions(resources),
        ...this.$_fileActions_systemActions
      ].filter((action) => {
        return action.isEnabled({ resources })
      })
    },

    // returns an array of available external Apps
    // to open a resource with a specific mimeType
    // FIXME: filesApp should not know anything about any other app, dont cross the line!!! BAD
    $_fileActions_loadExternalAppActions(resources) {
      // we don't support external apps as batch action as of now
      if (resources.length > 1) {
        return []
      }

      const { mimeType, fileId } = resources[0]
      if (
        mimeType === undefined ||
        !get(this, 'capabilities.files.app_providers') ||
        !get(this, 'mimeTypes', []).length
      ) {
        return []
      }

      const { app_providers: appProviders = [], default_application: defaultApplication } =
        this.mimeTypes.find((t) => t.mime_type === mimeType)

      return appProviders.map((app) => {
        const label = this.$gettext('Open in %{ appName }')
        return {
          name: app.name,
          img: app.icon,
          componentType: 'oc-button',
          class: `oc-files-actions-${app.name}-trigger`,
          isEnabled: () => true,
          canBeDefault: defaultApplication === app.name,
          handler: () => this.$_fileActions_openLink(app.name, fileId),
          label: () => this.$gettextInterpolate(label, { appName: app.name })
        }
      })
    },

    $_fileActions_openLink(appName, resourceId) {
      const routeData = this.$router.resolve({
        name: 'external-apps',
        params: {
          file_id: resourceId,
          app: appName
        },
        // public-token retrieval is weak, same as packages/web-app-files/src/index.js:106
        query: {
          ...(this.isPublicPage && {
            'public-token': (this.$route.params.item || '').split('/')[0]
          })
        }
      })
      // TODO: Let users configure whether to open in same/new tab (`_blank` vs `_self`)
      window.open(routeData.href, '_blank')
    }
  }
}
