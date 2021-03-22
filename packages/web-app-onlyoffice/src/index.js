import App from './App.vue'

const routes = [
  {
    path: '/edit/:fileId/:filePath',
    components: {
      fullscreen: App
    },
    name: 'onlyoffice-edit',
    meta: { hideHeadbar: true }
  }
]

const routeDefinitions = [
  'files-list',
  'files-favorites',
  'files-shared-with-others',
  'files-shared-with-me',
  'public-files'
]

const appInfo = {
  name: 'OnlyOffice',
  id: 'onlyoffice',
  icon: 'x-office-document',
  isFileEditor: true,
  extensions: [
    {
      newTab: true,
      extension: 'docx',
      routeName: 'onlyoffice-edit',
      routes: routeDefinitions,
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New OnlyOffice document')
        },
        icon: 'x-office-document'
      }
    },
    {
      newTab: true,
      extension: 'xlsx',
      routeName: 'onlyoffice-edit',
      routes: routeDefinitions,
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New OnlyOffice spreadsheet')
        },
        icon: 'x-office-document'
      }
    },
    {
      newTab: true,
      extension: 'pptx',
      routeName: 'onlyoffice-edit',
      routes: routeDefinitions,
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New OnlyOffice presentation')
        },
        icon: 'x-office-document'
      }
    }
  ]
}
export default {
  appInfo,
  routes
}
