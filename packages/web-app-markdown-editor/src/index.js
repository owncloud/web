// --- Components --------------------------------------------------------------

import App from './App.vue'
import t from '../l10n/translations'

// --- Routing -----------------------------------------------------------------

import store from './store.js'

const routes = [
  {
    path: '',
    components: {
      app: App
    },
    name: 'markdown-editor'
  }
]

const appInfo = {
  name: 'MarkdownEditor',
  id: 'markdown-editor',
  icon: 'text',
  isFileEditor: true,
  extensions: [
    {
      extension: 'txt',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New plain text file…')
        }
      },
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    },
    {
      extension: 'md',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New mark-down file…')
        }
      },
      routes: [
        'files-list',
        'files-favorites',
        'files-shared-with-others',
        'files-shared-with-me',
        'public-files'
      ]
    }
  ]
}

const translations = t
export default {
  appInfo,
  routes,
  store,
  translations
}
