import 'core-js/stable'
import 'regenerator-runtime/runtime'

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
        icon: 'share',
        ariaLabel: 'Share'
      }
    }
  ]
}
const navItems = [
  {
    name: 'All files',
    iconMaterial: appInfo.icon,
    route: {
      name: 'files-list',
      path: `/${appInfo.id}/list`,
      params: {
        item: ''
      }
    }
  },
  {
    name: 'Favorites',
    iconMaterial: 'star',
    route: {
      name: 'files-favorites',
      path: `/${appInfo.id}/favorites`
    }
  }
]

const routes = [{
  path: '',
  redirect: `/${appInfo.id}/list/`,
  components: {
    app: FilesApp
  }
},
{
  path: '/list/:item?',
  components: {
    app: FilesApp
  },
  name: 'files-list',
  meta: {
    'hideHeadbar': false
  }
},
{
  path: '/favorites',
  components: {
    appContent: FilesApp
  },
  name: 'files-favorites',
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
