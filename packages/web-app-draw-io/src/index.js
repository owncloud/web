import translationsJson from '../l10n/translations'
import App from './App.vue'

const routes = [
  {
    name: 'edit',
    path: '/edit/:filePath',
    components: {
      fullscreen: App
    },
    meta: { hideHeadbar: true }
  }
]

const appInfo = {
  name: 'Draw.io',
  id: 'draw-io',
  icon: 'grid_on',
  extensions: [
    {
      extension: 'drawio',
      newTab: true,
      routeName: 'draw-io-edit',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New draw.io document…')
        }
      },
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    },
    {
      extension: 'vsdx',
      newTab: true,
      routeName: 'draw-io-edit',
      routes: [
        'files-personal',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'files-public-list'
      ]
    }
  ]
}

const translations = translationsJson
export default {
  appInfo,
  routes,
  translations
}
