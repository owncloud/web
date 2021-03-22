import App from './App.vue'

const routes = [
  {
    path: '/edit/:fileId/:filePath',
    components: {
      app: App
    },
    name: 'edit',
    meta: { hideHeadbar: false, hideSearchBar: true }
  }
]

const routeDefinitions = [
  'files-personal',
  'files-favorites',
  'files-shared-with-others',
  'files-shared-with-me',
  'files-public-list'
]

const appInfo = {
  name: 'OnlyOffice',
  id: 'onlyoffice',
  icon: 'x-office-document',
  extensions: [
    {
      extension: 'docx',
      newTab: false,
      routeName: 'onlyoffice-edit',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New OnlyOffice document')
        }
      },
      routes: routeDefinitions
    },
    {
      extension: 'xlsx',
      newTab: false,
      routeName: 'onlyoffice-edit',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New OnlyOffice spreadsheet')
        }
      },
      routes: routeDefinitions
    },
    {
      extension: 'pptx',
      newTab: false,
      routeName: 'onlyoffice-edit',
      newFileMenu: {
        menuTitle($gettext) {
          return $gettext('New OnlyOffice presentation')
        }
      },
      routes: routeDefinitions
    }
  ]
}
export default {
  appInfo,
  routes
}
