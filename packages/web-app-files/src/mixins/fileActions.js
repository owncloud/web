import get from 'lodash-es/get'
import { mapGetters, mapActions, mapState } from 'vuex'

import { checkRoute } from '../helpers/route'
import AcceptShare from './actions/acceptShare'
import Copy from './actions/copy'
import DeclineShare from './actions/declineShare'
import Delete from './actions/delete'
import DownloadFile from './actions/downloadFile'
import DownloadFolder from './actions/downloadFolder'
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
  'downloadFile',
  'downloadFolder',
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
    DownloadFolder,
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
      const systemActions = []

      for (const actionMixin of actionsMixins) {
        systemActions.push(...this[`$_${actionMixin}_items`])
      }

      return systemActions
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
          handler: (item) =>
            this.$_fileActions_openEditor(editor, item.path, item.id, EDITOR_MODE_EDIT),
          isEnabled: ({ resource }) => {
            if (editor.routes?.length > 0 && !checkRoute(editor.routes, this.$route.name)) {
              return false
            }

            return resource.extension === editor.extension
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

      // TODO: Refactor in the store
      this.openFile({
        filePath
      })

      if (editor.newTab) {
        const path = this.$router.resolve({
          name: editor.routeName,
          params: { filePath, fileId, mode }
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
      action.handler(resource, action.handlerData)
    },

    $_fileActions_getDefaultAction(resource) {
      const filterCallback = (action) =>
        action.canBeDefault && action.isEnabled({ resource, parent: this.currentFolder })

      // first priority: handlers from config
      const defaultEditorActions = this.$_fileActions_editorActions.filter(filterCallback)
      if (defaultEditorActions.length) {
        return defaultEditorActions[0]
      }

      // second priority: `/app/open` endpoint of app provider if available
      // FIXME: files app should not know anything about the `external apps` app
      const externalAppsActions =
        this.$_fileActions_loadExternalAppActions(resource).filter(filterCallback)
      if (externalAppsActions.length) {
        return externalAppsActions[0]
      }

      // fallback: system actions
      return this.$_fileActions_systemActions.filter(filterCallback)
    },

    $_fileActions_getAllAvailableActions(resource) {
      return [
        ...this.$_fileActions_editorActions,
        ...this.$_fileActions_loadExternalAppActions(resource),
        ...this.$_fileActions_systemActions
      ].filter((action) => {
        return action.isEnabled({
          resource,
          parent: this.currentFolder
        })
      })
    },

    // returns an array of available external Apps
    // to open a resource with a specific mimeType
    // FIXME: filesApp should not know anything about any other app, dont cross the line!!! BAD
    $_fileActions_loadExternalAppActions(resource) {
      const { mimeType } = resource
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
          handler: () => this.$_fileActions_openLink(app.name, resource.fileId),
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
