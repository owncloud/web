import App from './App.vue'
import translations from '../l10n/translations'

const routes = [
  {
    path: '/:filePath*',
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
          return $gettext('Plain text file')
        }
      },
      ...fileExtensionConfig
    },
    {
      extension: 'md',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('Markdown file')
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
