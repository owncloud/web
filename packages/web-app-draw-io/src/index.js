import translations from '../l10n/translations'
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
        'files-spaces-storage',
        'files-common-favorites',
        'files-shares-with-others',
        'files-shares-with-me',
        'files-public-files'
      ]
    },
    {
      extension: 'vsdx',
      newTab: true,
      routeName: 'draw-io-edit',
      routes: [
        'files-spaces-storage',
        'files-common-favorites',
        'files-shares-with-others',
        'files-shares-with-me',
        'files-public-files'
      ]
    }
  ]
}

export default {
  appInfo,
  routes,
  translations
}
