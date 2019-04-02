import '@babel/polyfill'
import FilesApp from './components/FilesApp.vue'
import FilesTopBar from './components/FilesTopBar.vue'
import FileInfoSideBar from './components/FileInfoSidebar.vue'
import FileInfoVersions from './components/FileInfoVersions.vue'
import FileSharingSidebar from './components/FileSharingSidebar.vue'
import translationsJson from '../l10n/translations.json'

const store = require('./store.js')

const appInfo = {
  name: 'Files',
  id: 'files',
  icon: 'folder',
  isFileEditor: false,
  extensions: [],
  fileSideBars: [
    {
      app: 'files',
      name: 'Files',
      component: FileInfoSideBar
    }, {
      app: 'files-version',
      name: 'Versions',
      component: FileInfoVersions
    }, {
      app: 'files-sharing',
      name: 'Sharing',
      component: FileSharingSidebar
    }
  ]
}
const navItems = [{
  name: appInfo.name,
  iconMaterial: appInfo.icon,
  route: {
    name: 'files-list',
    params: {
      item: 'home'
    }
  }
}]

const routes = [{
  path: '',
  redirect: `/${appInfo.id}/list/home`,
  components: {
    appContent: FilesApp,
    appTopbar: FilesTopBar
  }
},
{
  path: '/list/:item',
  components: {
    appContent: FilesApp,
    appTopbar: FilesTopBar
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
