import translations from '../l10n/translations'
import App from './App.vue'
import store from './store'

function $gettext(msg) {
  return msg
}

const appData = {
  name: 'External',
  id: 'external'
}
const routes = [
  {
    path: '/:filePath*',
    component: App,
    name: appData.name,
    meta: {
      title: $gettext(appData.name),
      auth: false,
      patchCleanPath: true
    }
  }
]

const labels = {
  OpenDocument: 'OpenDocument',
  OpenSpreadsheet: 'OpenSpreadsheet',
  OpenPresentation: 'OpenPresentation',
  MicrosoftWord: 'Microsoft Word',
  MicrosoftExcel: 'Microsoft Excel',
  MicrosoftPowerPoint: 'Microsoft PowerPoint'
}

const extension = {
  odt: 'odt',
  docx: 'docx',
  ods: 'ods',
  xlsx: 'xlsx',
  pptx: 'pptx',
  odp: 'odp'
}

const fileExtensions = () => {
  const extensions = [
    {
      extension: extension.odt,
      label: $gettext(labels.OpenDocument)
    },
    {
      extension: extension.ods,
      label: $gettext(labels.OpenSpreadsheet)
    },
    {
      extension: extension.odp,
      label: $gettext(labels.OpenPresentation)
    },
    {
      extension: extension.docx,
      label: $gettext(labels.MicrosoftWord)
    },
    {
      extension: extension.xlsx,
      label: $gettext(labels.MicrosoftExcel)
    },
    {
      extension: extension.pptx,
      label: $gettext(labels.MicrosoftPowerPoint)
    }
  ]

  const extensionArray = Object.values(extension)

  let isPrimaryExtension =
    window.Vue.$store.getters.extensionConfigByAppId(appData.id).isPrimaryExtension ||
    extensionArray
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

const checkObjectProperty = (object, property) => {
  return Object.prototype.hasOwnProperty.call(object, property)
}

const appInfo = {
  name: $gettext(appData.name),
  id: appData.id,
  isFileEditor: true,
  extensions: fileExtensions().map((extensionItem) => {
    return {
      extension: extensionItem.extension,
      ...(checkObjectProperty(extensionItem, 'newFileMenu') && {
        newFileMenu: extensionItem.newFileMenu
      }),
      ...(checkObjectProperty(extensionItem, 'isDefaultExtension') && {
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
