import 'core-js/stable'
import 'regenerator-runtime/runtime'

import FilesApp from './components/FilesApp.vue'
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
      path: `/`,
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
  },
  {
    name: 'Deleted files',
    iconMaterial: 'delete',
    route: {
      name: 'files-trashbin',
      path: `/${appInfo.id}/trash-bin`
    }
  }
]

const routes = [
  {
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
    name: 'files-list'
  },
  {
    path: '/favorites',
    components: {
      app: FilesApp
    },
    name: 'files-favorites',
    meta: {
      hideFilelistActions: true
    }
  },
  {
    path: '/trash-bin',
    components: {
      app: FilesApp
    },
    name: 'files-trashbin',
    meta: {
      hideFilelistActions: true
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
