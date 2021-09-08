import { mapGetters, mapActions, mapState } from 'vuex'

import { checkRoute } from '../helpers/route'
import AcceptShare from './actions/acceptShare'
import Copy from './actions/copy'
import DeclineShare from './actions/declineShare'
import Delete from './actions/delete'
import Download from './actions/download'
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
  'download',
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
    Download,
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

    $_fileActions_triggerDefaultAction(resource) {
      console.log('resource', resource) &&
        this.$_fileActions_loadApps(resource).then(res => {
          if (resource.extension !== 'pdf' && resource.extension !== 'drawio' && res && res[0]) {
            this.$_fileActions_openLink(res[0], resource)
          } else {
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
        })
    },

    async $_fileActions_loadApps(resource) {
      const data = JSON.parse(localStorage.mimetypes)
      const url = 'remote.php/dav/files/' + this.user.id + resource.path
      const headers = new Headers()
      headers.append('Authorization', 'Bearer ' + this.getToken)
      headers.append('X-Requested-With', 'XMLHttpRequest')
      const resp = await fetch(url, { method: 'PROPFIND', headers })
      if (!resp.ok) {
        const message = `An error has occured: ${resp.status}`
        throw new Error(message)
      }
      const prop = await resp.text()
      const a = prop.match(new RegExp('<d:getcontenttype>' + '(.*)' + '</d:getcontenttype>'))
      const mimetype = a[0].split('<d:getcontenttype>')[1].split('</d:getcontenttype>')[0]
      /* if (!data) {
        data = {
          'mime-types': {
            'application/msword': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                },
                {
                  address: 'localhost:18000',
                  name: 'MS Office 365',
                  icon:
                    'https://upload.wikimedia.org/wikipedia/commons/5/5f/Microsoft_Office_logo_%282019%E2%80%93present%29.svg'
                }
              ]
            },
            'application/vnd.sun.xml.calc.template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.sun.xml.draw': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            },
            'application/vnd.sun.xml.draw.template': {
              app_providers: [
                {
                  address: 'localhost:19000',
                  name: 'Collabora',
                  icon: 'https://www.collaboraoffice.com/wp-content/uploads/2019/01/CP-icon.png'
                }
              ]
            }
          }
        }
      } */
      if (data['mime-types'][mimetype] && data['mime-types'][mimetype].app_providers)
        this.appList = data['mime-types'][mimetype].app_providers
      else {
        this.appList = []
        return null
      }
      return data['mime-types'][mimetype].app_providers
    },

    $_fileActions_openLink(app, resource) {
      const path = '/files/list/apps/' + app.name + '/' + resource.fileId || resource.id
      const routeData = this.$router.resolve({
        path: path
      })
      window.open(routeData.href, '_blank')
    }
  }
}
