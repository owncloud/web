import App from './App.vue'
import translations from '../l10n/translations'
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

const fileExtensionConfig = {
  canBeDefault: true,
  routes: [
    'files-personal',
    'files-favorites',
    'files-shared-with-others',
    'files-shared-with-me',
    'files-public-list'
  ]
}

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
      ...fileExtensionConfig
    },
    {
      extension: 'md',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New mark-down file…')
        }
      },
      ...fileExtensionConfig
    }
  ]
}

export default {
  appInfo,
  routes,
  store,
  translations
}
