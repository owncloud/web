import { mapGetters, mapActions, mapState } from 'vuex'

import { checkRoute } from '../helpers/route'
import Copy from './actions/copy'
import Delete from './actions/delete'
import Download from './actions/download'
import Favorite from './actions/favorite'
import Fetch from './actions/fetch'
import Move from './actions/move'
import Navigate from './actions/navigate'
import Rename from './actions/rename'
import Restore from './actions/restore'

const actionsMixins = [
  'fetch',
  'navigate',
  'download',
  'favorite',
  'copy',
  'move',
  'rename',
  'restore',
  'delete'
]

export default {
  mixins: [Copy, Delete, Download, Favorite, Fetch, Move, Navigate, Rename, Restore],
  computed: {
    ...mapState(['apps']),
    ...mapGetters('Files', ['highlightedFile', 'currentFolder']),
    ...mapGetters(['configuration']),

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
          ariaLabel: () => {
            return `Open in ${this.apps.meta[editor.app].name}`
          },
          icon: this.apps.meta[editor.app].icon,
          handler: item => this.$_fileActions_openEditor(editor, item.path, item.id),
          isEnabled: ({ resource }) => {
            if (editor.routes?.length > 0 && !checkRoute(editor.routes, this.$route.name)) {
              return false
            }

            return resource.extension === editor.extension
          },
          canBeDefault: true
        }
      })
    }
  },

  methods: {
    ...mapActions(['openFile']),

    $_fileActions_openEditor(editor, filePath, fileId) {
      if (editor.handler) {
        return editor.handler({
          config: this.configuration,
          extensionConfig: editor.config,
          filePath,
          fileId
        })
      }

      // TODO: Refactor in the store
      this.openFile({
        filePath: filePath
      })

      if (editor.newTab) {
        const path = this.$router.resolve({
          name: editor.routeName,
          params: { filePath: filePath }
        }).href
        const target = `${editor.routeName}-${filePath}`
        const win = window.open(path, target)
        // in case popup is blocked win will be null
        if (win) {
          win.focus()
        }
        return
      }

      const routeName = editor.routeName || editor.app
      const params = {
        filePath,
        contextRouteName: this.$route.name
      }

      this.$router.push({
        name: routeName,
        params
      })
    },

    $_fileActions_triggerDefaultAction(resource) {
      let actions = this.$_fileActions_editorActions.concat(this.$_fileActions_systemActions)

      actions = actions.filter(action => {
        return (
          action.isEnabled({
            resource: resource,
            parent: this.currentFolder
          }) && action.canBeDefault
        )
      })
      actions[0].handler(resource, actions[0].handlerData)
    }
  }
}
