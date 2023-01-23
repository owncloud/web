import App from './App.vue'
import translations from '../l10n/translations.json'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appId = 'text-editor'

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: App,
    name: 'text-editor',
    meta: {
      authContext: 'hybrid',
      title: $gettext('Text Editor'),
      patchCleanPath: true
    }
  }
]

const fileExtensions = () => {
  const extensions: {
    extension: string
    label: string
    canBeDefault?: boolean
    newFileMenu?: any
  }[] = [
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

  let config = (window as any).__$store.getters.extensionConfigByAppId(appId)
  let primaryExtensions = config.primaryExtensions || ['txt', 'md']
  let extraExtensions = config.extraExtensions || []

  if (typeof primaryExtensions === 'string') {
    primaryExtensions = [primaryExtensions]
  }
  extensions.push(...extraExtensions.map(ext => ({extension: ext})))

  return extensions.reduce((acc, extensionItem) => {
    const isPrimary = primaryExtensions.includes(extensionItem.extension)
    extensionItem.canBeDefault = isPrimary
    if (isPrimary) {
      extensionItem.newFileMenu = {
        menuTitle($gettext) {
          return $gettext(extensionItem.label)
        }
      }
    }
    extensionItem.canBeDefault = true
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
