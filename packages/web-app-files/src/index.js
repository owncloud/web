import App from './App.vue'
import Personal from './views/Personal.vue'
import Favorites from './views/Favorites.vue'
import SharedWithMe from './views/SharedWithMe.vue'
import SharedWithOthers from './views/SharedWithOthers.vue'
import SharedViaLink from './views/SharedViaLink.vue'
import Trashbin from './views/Trashbin.vue'
import PrivateLink from './views/PrivateLink.vue'
import PublicLink from './views/PublicLink.vue'
import FilesDrop from './views/FilesDrop.vue'
import LocationPicker from './views/LocationPicker.vue'
import PublicFiles from './views/PublicFiles.vue'
import FileDetails from './components/SideBar/Details/FileDetails.vue'
import FileVersions from './components/SideBar/Versions/FileVersions.vue'
import FileShares from './components/SideBar/Shares/FileShares.vue'
import FileLinks from './components/SideBar/Links/FileLinks.vue'

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
      app: 'details-item',
      icon: 'info',
      component: FileDetails,
      enabled() {
        return undefined
      }
    },
    {
      app: 'sharing-item',
      icon: 'group',
      component: FileShares,
      enabled(capabilities) {
        if (capabilities.files_sharing) {
          return capabilities.files_sharing.api_enabled
        }
        return false
      }
    },
    {
      app: 'links-item',
      icon: 'link',
      component: FileLinks,
      enabled(capabilities) {
        if (capabilities.files_sharing) {
          return capabilities.files_sharing.public.enabled
        }
        return false
      }
    },
    {
      app: 'versions-item',
      icon: 'file_version',
      component: FileVersions,
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
      name: 'files-personal',
      path: `/${appInfo.id}/list/all`
    }
  },
  {
    name: $gettext('Favorites'),
    iconMaterial: 'star',
    route: {
      name: 'files-favorites',
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
      name: 'files-shared-with-me',
      path: `/${appInfo.id}/list/shared-with-me`
    }
  },
  {
    name: $gettext('Shared with others'),
    iconMaterial: 'shared-with-others',
    route: {
      name: 'files-shared-with-others',
      path: `/${appInfo.id}/list/shared-with-others`
    }
  },
  {
    name: $gettext('Shared via link'),
    iconMaterial: 'link',
    route: {
      name: 'files-shared-via-link',
      path: `/${appInfo.id}/list/shared-via-link`
    }
  },
  {
    name: $gettext('Deleted files'),
    iconMaterial: 'delete',
    enabled(capabilities) {
      return capabilities.dav && capabilities.dav.trashbin === '1.0'
    },
    route: {
      name: 'files-trashbin',
      path: `/${appInfo.id}/list/trash-bin`
    }
  }
]

const routes = [
  {
    path: '/',
    redirect: { name: 'files-personal' }
  },
  {
    name: 'list',
    path: '/list',
    redirect: { name: 'files-personal' },
    components: {
      app: App
    },
    children: [
      {
        name: 'personal',
        path: 'all/:item?/:page?',
        component: Personal,
        meta: {
          hasBulkActions: true,
          title: $gettext('All files')
        }
      },
      {
        name: 'favorites',
        path: 'favorites/:page?',
        component: Favorites,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Favorite files')
        }
      },
      {
        path: 'shared-with-me/:page?',
        component: SharedWithMe,
        name: 'shared-with-me',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Files shared with me')
        }
      },
      {
        path: 'shared-with-others/:page?',
        component: SharedWithOthers,
        name: 'shared-with-others',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Files shared with others')
        }
      },
      {
        path: 'shared-via-link/:page?',
        component: SharedViaLink,
        name: 'shared-via-link',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Files shared via link')
        }
      },
      {
        path: 'trash-bin/:page?',
        component: Trashbin,
        name: 'trashbin',
        meta: {
          hideFilelistActions: true,
          // FIXME: should have a generic bulk actions way as it currently handles this separately
          hasBulkActions: false,
          title: $gettext('Deleted files')
        }
      }
    ]
  },
  {
    name: 'public',
    path: '/public',
    components: {
      app: App
    },
    meta: {
      auth: false
    },
    children: [
      {
        name: 'public-list',
        path: 'list/:item/:page?',
        component: PublicFiles,
        meta: {
          auth: false,
          hasBulkActions: true,
          title: $gettext('Public files')
        }
      }
    ]
  },
  {
    path: '/public-link/:token',
    name: 'public-link',
    components: {
      fullscreen: PublicLink
    },
    meta: {
      auth: false,
      hideHeadbar: true,
      title: $gettext('Resolving public link')
    }
  },
  {
    path: '/private-link/:fileId',
    name: 'private-link',
    components: {
      fullscreen: PrivateLink
    },
    meta: { hideHeadbar: true, title: $gettext('Resolving private link') }
  },
  {
    path: '/location-picker/:context/:action/:item?/:page?',
    name: 'location-picker',
    components: {
      app: LocationPicker
    },
    meta: {
      verbose: true,
      auth: false
    }
  },
  {
    path: '/files-drop/:token',
    name: 'public-drop',
    components: {
      app: FilesDrop
    },
    meta: { auth: false, title: $gettext('Public file upload') }
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
