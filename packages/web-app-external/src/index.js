import store from './store'
import App from './App.vue'
import translations from '../l10n/translations'

function $gettext(msg) {
  return msg
}

const appId = 'external'

const routes = [
  {
    path: '/:filePath*',
    component: App,
    name: 'external',
    meta: {
      title: $gettext('External'),
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

  let primaryExtensions = window.Vue.$store.getters.extensionConfigByAppId(appId)
    .primaryExtensions || ['odt', 'docx', 'ods', 'xlsx', 'pptx', 'odp']
  if (typeof primaryExtensions === 'string') {
    primaryExtensions = [primaryExtensions]
  }
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
      ...(Object.prototype.hasOwnProperty.call(extensionItem, 'canBeDefault') && {
        canBeDefault: extensionItem.canBeDefault
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
