import App from './App.vue'
import translations from '../l10n/translations'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appId = 'text-editor'

const routes = [
  {
    path: '/:filePath*',
    component: App,
    name: 'text-editor',
    meta: {
      title: $gettext('Text Editor'),
      auth: false,
      patchCleanPath: true
    }
  }
]

const fileExtensions = () => {
  const extensions = [
    {
      extension: 'txt',
      label: $gettext('Plain text file')
    },
    {
      extension: 'md',
      label: $gettext('Markdown file')
    },
    {
      extension: 'js',
      label: $gettext('JavaScript file')
    },
    {
      extension: 'json',
      label: $gettext('JSON file')
    },
    {
      extension: 'xml',
      label: $gettext('XML file')
    },
    {
      extension: 'py',
      label: $gettext('Python file')
    },
    {
      extension: 'php',
      label: $gettext('PHP file')
    },
    {
      extension: 'yaml',
      label: $gettext('YAML file')
    }
  ]

  let primaryExtensions = window.Vue.$store.getters.extensionConfigByAppId(appId)
    .primaryExtensions || ['txt', 'md']
  if (typeof primaryExtensions === 'string') {
    primaryExtensions = [primaryExtensions]
  }
  return extensions.reduce((acc, extensionItem) => {
    if (primaryExtensions.includes(extensionItem.extension)) {
      extensionItem.canBeDefault = true
      extensionItem.newFileMenu = {
        menuTitle($gettext) {
          return $gettext(extensionItem.label)
        }
      }
    }
    acc.push(extensionItem)
    return acc
  }, [])
}

const appInfo = {
  name: $gettext('Text Editor'),
  id: appId,
  icon: 'file-text',
  isFileEditor: true,
  extensions: fileExtensions().map((extensionItem) => {
    return {
      extension: extensionItem.extension,
      ...(Object.prototype.hasOwnProperty.call(extensionItem, 'newFileMenu') && {
        newFileMenu: extensionItem.newFileMenu
      }),
      ...(Object.prototype.hasOwnProperty.call(extensionItem, 'canBeDefault') && {
        canBeDefault: extensionItem.canBeDefault
      })
    }
  })
}

export default {
  appInfo,
  routes,
  translations
}
