import translations from '../l10n/translations.json'
import App from './App.vue'

const routes = [
  {
    name: 'draw-io',
    path: '/:driveAliasAndItem(.*)?',
    component: App,
    meta: {
      authContext: 'hybrid',
      patchCleanPath: true
    }
  }
]

const appInfo = {
  name: 'Draw.io',
  id: 'draw-io',
  icon: 'grid',
  extensions: [
    {
      extension: 'drawio',
      newTab: true,
      routeName: 'draw-io',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('Draw.io document')
        }
      }
    },
    {
      extension: 'vsdx',
      newTab: true,
      routeName: 'draw-io'
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
