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
    ...mapGetters(['capabilities', 'configuration']),

    $_fileActions_systemActions() {
      const systemActions = []

      for (const actionMixin of actionsMixins) {
        systemActions.push(...this[`$_${actionMixin}_items`])
      }

      return systemActions
    },

    $_fileActions_editorActions() {
      return this.apps.fileEditors.map(editor => {
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
          handler: item =>
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
    ...mapGetters('External', ['getMimeTypes']),
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
      const availableExternalAppActions = this.$_fileActions_loadApps(resource)

      for (const action of availableExternalAppActions) {
        action.handler = () => this.$_fileActions_openLink(action.name, resource.fileId)
      }

      let actions = this.$_fileActions_editorActions.concat(this.$_fileActions_systemActions)

      actions = actions.filter(action => {
        return (
          action.isEnabled({
            resource: resource,
            parent: this.currentFolder
          }) && action.canBeDefault
        )
      })

      const allDefaultActions = availableExternalAppActions.concat(actions)
      allDefaultActions[0].handler(resource, allDefaultActions[0].handlerData)
    },

    // returns an array of available external Apps
    // to open a resource with a specific mimeType
    $_fileActions_loadApps(resource) {
      const { mimeType } = resource
      if (mimeType === undefined || !this.capabilities.files.app_providers) {
        return []
      }
      const allAvailableMimeTypes = this.getMimeTypes()

      if (!allAvailableMimeTypes?.length) {
        return []
      } else {
        const availableMimeTypes = allAvailableMimeTypes.find(t => t.mime_type === mimeType)
        if (availableMimeTypes) {
          return availableMimeTypes.app_providers
        } else {
          return []
        }
      }
    },

    $_fileActions_openLink(appName, resourceId) {
      const actionableId = resourceId.replaceAll('=', '')
      const routeData = this.$router.resolve({
        name: 'external-apps',
        params: { app: appName, file_id: actionableId }
      })
      // TODO: Let users configure whether to open in same/new tab (`_blank` vs `_self`)
      window.open(routeData.href, '_blank')
    }
  }
}
