import 'core-js/stable'
import 'regenerator-runtime/runtime'

import FilesApp from './components/FilesApp.vue'
import FileInfoVersions from './components/FileInfoVersions.vue'
import FileSharingSidebar from './components/FileSharingSidebar.vue'
import translationsJson from '../l10n/translations.json'

const store = require('./store')
const rootStore = require('./../../../src/store')

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
      enabled (capabilities) {
        return capabilities.files_sharing.api_enabled === '1'
      },
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
        item: rootStore.Store.getters.configuration.rootFolder
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
    enabled (capabilities) {
      return capabilities.dav.trashbin === '1.0'
    },
    route: {
      name: 'files-trashbin',
      path: `/${appInfo.id}/trash-bin`
    }
  }
]

const routes = [
  {
    path: '',
    redirect: `/${appInfo.id}/list/${rootStore.Store.getters.configuration.rootFolder}`,
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
