import App from './App.vue'
import translations from '../l10n/translations'

const routes = [
  {
    path: '/:filePath*',
    component: App,
    name: 'simple-editor',
    meta: {
      title: 'SimpleEditor',
      auth: false,
      patchCleanPath: true
    }
  }
]

const fileExtensionConfig = {
  canBeDefault: true
}

const appInfo = {
  name: 'SimpleEditor',
  id: 'simple-editor',
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

for (const ext of ['js', 'json', 'xml', 'py', 'php', 'yaml']) {
  appInfo.extensions.push({
    extension: ext,
    ...fileExtensionConfig
  })
}

export default {
  appInfo,
  routes,
  translations
}
