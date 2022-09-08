import translations from '../l10n/translations'
import App from './App.vue'
import store from './store'

function $gettext(msg) {
  return msg
}

const appId = 'external'

const routes = [
  {
    path: '/:filePath*',
    component: App,
    name: 'External',
    meta: {
      title: $gettext('external'),
      auth: false,
      patchCleanPath: true
    }
  }
]

const fileExtensions = () => {
  const extensions = [
    {
      extension: 'odt',
      label: $gettext('OpenDocument')
    },
    {
      extension: 'ods',
      label: $gettext('OpenSpreadsheet')
    },
    {
      extension: 'odp',
      label: $gettext('OpenPresentation')
    },
    {
      extension: 'docx',
      label: $gettext('Microsoft Word')
    },
    {
      extension: 'xlsx',
      label: $gettext('Microsoft Excel')
    },
    {
      extension: 'pptx',
      label: $gettext('Microsoft PowerPoint')
    }
  ]

  let isPrimaryExtension = window.Vue.$store.getters.extensionConfigByAppId(appId)
    .isPrimaryExtension || ['odt', 'ods', 'odp', 'docx', 'xlsx', 'pptx']
  if (typeof isPrimaryExtension === 'string') {
    isPrimaryExtension = [isPrimaryExtension]
  }
  return extensions.reduce((acc, extensionItem) => {
    const isPrimary = isPrimaryExtension.includes(extensionItem.extension)
    extensionItem.isDefaultExtension = isPrimary
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
  name: $gettext('External'),
  id: appId,
  isFileEditor: true,
  extensions: fileExtensions().map((extensionItem) => {
    return {
      extension: extensionItem.extension,
      ...(Object.prototype.hasOwnProperty.call(extensionItem, 'newFileMenu') && {
        newFileMenu: extensionItem.newFileMenu
      }),
      ...(Object.prototype.hasOwnProperty.call(extensionItem, 'isDefaultExtension') && {
        isDefaultExtension: extensionItem.isDefaultExtension
      })
    }
  })
}

export default {
  appInfo,
  routes,
  store,
  translations,
  ready({ store }) {
    store.dispatch('External/fetchMimeTypes')
  }
}
