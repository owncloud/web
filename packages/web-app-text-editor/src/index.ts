import translations from '../l10n/translations.json'
import TextEditor from './App.vue'
import { AppWrapperRoute } from '@ownclouders/web-pkg'
import { Store } from 'vuex'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appId = 'text-editor'

const routes = [
  {
    path: '/:driveAliasAndItem(.*)?',
    component: AppWrapperRoute(TextEditor, {
      applicationId: appId
    }),
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

  const config = (window as any).__$store.getters.extensionConfigByAppId(appId)
  extensions.push(...(config.extraExtensions || []).map((ext) => ({ extension: ext })))

  let primaryExtensions = (window as any).__$store.getters.extensionConfigByAppId(appId)
    .primaryExtensions || ['txt', 'md']

  if (typeof primaryExtensions === 'string') {
    primaryExtensions = [primaryExtensions]
  }

  return extensions.reduce((acc, extensionItem) => {
    const isPrimary = primaryExtensions.includes(extensionItem.extension)
    if (isPrimary) {
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
  color: '#7b27b6',
  isFileEditor: true,
  applicationMenu: {
    enabled: (store: Store<unknown>) => {
      return !!store.getters?.user?.id
    },
    priority: 20,
    openAsEditor: true
  },
  defaultExtension: 'txt',
  extensions: fileExtensions().map((extensionItem) => {
    return {
      extension: extensionItem.extension,
      ...(Object.prototype.hasOwnProperty.call(extensionItem, 'newFileMenu') && {
        newFileMenu: extensionItem.newFileMenu
      })
    }
  })
}

export default {
  appInfo,
  routes,
  translations
}
