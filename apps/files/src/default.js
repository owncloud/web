import '@babel/polyfill'
import FilesApp from './components/FilesApp.vue'
import FileInfoSideBar from './components/FileInfoSidebar.vue'
import FileInfoVersions from './components/FileInfoVersions.vue'
import FileSharingSidebar from './components/FileSharingSidebar.vue'
import translationsJson from '../l10n/translations.json'

const store = require('./store')

const appInfo = {
  name: 'Files',
  id: 'files',
  icon: 'folder',
  isFileEditor: false,
  extensions: [],
  fileSideBars: [
    {
      app: 'files',
      component: FileInfoSideBar
    }, {
      app: 'files-version',
      component: FileInfoVersions
    }, {
      app: 'files-sharing',
      component: FileSharingSidebar,
      quickAccess: {
        icon: 'share'
      }
    }
  ]
}
const navItems = [{
  name: appInfo.name,
  iconMaterial: appInfo.icon,
  route: {
    name: 'files-list',
    params: {
      item: ''
    }
  }
}]

const routes = [{
  path: '',
  redirect: `/${appInfo.id}/list/`,
  components: {
    appContent: FilesApp
  }
},
{
  path: '/list/:item?',
  components: {
    appContent: FilesApp
  },
  name: 'files-list',
  meta: {
    'hideHeadbar': false
  }
}
]

const translations = translationsJson
export default define({
  appInfo,
  store,
  routes,
  navItems,
  translations
})
