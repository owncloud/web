import translations from '../l10n/translations'
import App from './App.vue'

const routes = [
  {
    name: 'draw-io',
    path: '/:contextRouteName/:filePath*',
    components: {
      fullscreen: App
    },
    meta: {
      auth: false,
      hideHeadbar: true,
      patchCleanPath: true
    }
  }
]

const routesForFileExtensions = [
  'files-spaces-storage',
  'files-common-favorites',
  'files-shares-with-others',
  'files-shares-with-me',
  'files-public-files'
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
          return $gettext('New draw.io document…')
        }
      },
      routes: routesForFileExtensions
    },
    {
      extension: 'vsdx',
      newTab: true,
      routeName: 'draw-io',
      routes: routesForFileExtensions
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
