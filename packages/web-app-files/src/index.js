import App from './App.vue'
import AllFiles from './views/AllFiles.vue'
import Favorites from './views/Favorites.vue'
import SharedWithMe from './views/SharedWithMe.vue'
import SharedWithOthers from './views/SharedWithOthers.vue'
import Trashbin from './views/Trashbin.vue'
import FileInfoVersions from './components/FileInfoVersions.vue'
import FileSharingSidebar from './components/FileSharingSidebar.vue'
import FileLinkSidebar from './components/FileLinkSidebar.vue'
import PrivateLink from './components/PrivateLink.vue'
import PublicLink from './components/PublicLinks/PublicLink.vue'
import FilesDrop from './components/PublicLinks/FilesDrop.vue'
import LocationPicker from './components/LocationPicker/LocationPicker.vue'

import translationsJson from '../l10n/translations.json'
import quickActionsImport from './quickActions'
import store from './store'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('Files'),
  id: 'files',
  icon: 'folder',
  isFileEditor: false,
  extensions: [],
  fileSideBars: [
    {
      app: 'files-sharing',
      icon: 'group',
      component: FileSharingSidebar,
      enabled(capabilities) {
        if (capabilities.files_sharing) {
          return capabilities.files_sharing.api_enabled
        }
        return false
      }
    },
    {
      app: 'file-link',
      icon: 'link',
      component: FileLinkSidebar,
      enabled(capabilities) {
        if (capabilities.files_sharing) {
          return capabilities.files_sharing.public.enabled
        }
        return false
      }
    },
    {
      app: 'files-version',
      icon: 'file_version',
      component: FileInfoVersions,
      enabled(capabilities, highlightedFile) {
        return !!capabilities.core && highlightedFile && highlightedFile.type !== 'folder'
      }
    }
  ]
}
const navItems = [
  {
    name: $gettext('All files'),
    iconMaterial: appInfo.icon,
    route: {
      path: `/${appInfo.id}/list`
    }
  },
  {
    name: $gettext('Favorites'),
    iconMaterial: 'star',
    route: {
      path: `/${appInfo.id}/list/favorites`
    },
    enabled(capabilities) {
      return capabilities.files && capabilities.files.favorites
    }
  },
  {
    name: $gettext('Shared with me'),
    iconMaterial: 'shared-with-me',
    route: {
      path: `/${appInfo.id}/list/shared-with-me`
    }
  },
  {
    name: $gettext('Shared with others'),
    iconMaterial: 'shared-with-others',
    route: {
      path: `/${appInfo.id}/list/shared-with-others`
    }
  },
  {
    name: $gettext('Deleted files'),
    iconMaterial: 'delete',
    enabled(capabilities) {
      return capabilities.dav && capabilities.dav.trashbin === '1.0'
    },
    route: {
      path: `/${appInfo.id}/list/trashbin`
    }
  }
]

const routes = [
  {
    path: '',
    redirect: '/files/list'
  },
  {
    name: 'list',
    path: '/list',
    redirect: ':item?',
    components: {
      app: App
    },
    children: [
      {
        name: 'all-files',
        path: ':item?',
        component: AllFiles
      },
      {
        path: 'favorites',
        component: Favorites,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true
        }
      },
      {
        path: 'shared-with-me',
        component: SharedWithMe,
        name: 'files-shared-with-me',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true
        }
      },
      {
        path: 'shared-with-others',
        component: SharedWithOthers,
        name: 'files-shared-with-others',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true
        }
      },
      {
        path: '/trash-bin',
        component: Trashbin,
        name: 'files-trashbin',
        meta: {
          hideFilelistActions: true,
          // FIXME: should have a generic bulk actions way as it currently handles this separately
          hasBulkActions: false
        }
      }
    ]
  },
  {
    path: '/private-link/:fileId',
    name: 'private-link',
    components: {
      fullscreen: PrivateLink
    },
    meta: { hideHeadbar: true }
  },
  {
    path: '/public-link/:token',
    name: 'public-link',
    components: {
      fullscreen: PublicLink
    },
    meta: { auth: false, hideHeadbar: true }
  },
  {
    path: '/public-files/:item',
    name: 'public-files',
    components: {
      app: App
    },
    meta: {
      auth: false,
      hasBulkActions: true
    }
  },
  {
    path: '/files-drop/:token',
    name: 'public-files-drop',
    components: {
      app: FilesDrop
    },
    meta: { auth: false }
  },
  {
    path: '/location-picker',
    name: 'location-picker',
    components: {
      app: LocationPicker
    },
    meta: {
      verbose: true,
      auth: false
    }
  }
]

// Prepare imported modules to be exported
// If we do not define these constants, the export will be undefined
const translations = translationsJson
const quickActions = quickActionsImport

export default {
  appInfo,
  store,
  routes,
  navItems,
  quickActions,
  translations
}
