import App from './App.vue'
import translations from '../l10n/translations'

const routes = [
  {
    path: '/:contextRouteName/:filePath*',
    component: App,
    name: 'markdown-editor',
    meta: {
      patchCleanPath: true
    }
  }
]

const fileExtensionConfig = {
  canBeDefault: true
}

const appInfo = {
  name: 'MarkdownEditor',
  id: 'markdown-editor',
  icon: 'file-text',
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
  translations
}
