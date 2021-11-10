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

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

export default [
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
        path: 'all/:item*',
        component: Personal,
        meta: {
          hasBulkActions: true,
          title: $gettext('All files'),
          patchCleanPath: true
        }
      },
      {
        name: 'favorites',
        path: 'favorites',
        component: Favorites,
        meta: {
          hideFilelistActions: true,
          hasBulkActions: false,
          title: $gettext('Favorite files')
        }
      },
      {
        path: 'shared-with-me',
        component: SharedWithMe,
        name: 'shared-with-me',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
          title: $gettext('Files shared with me')
        }
      },
      {
        path: 'shared-with-others',
        component: SharedWithOthers,
        name: 'shared-with-others',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: false,
          title: $gettext('Files shared with others')
        }
      },
      {
        path: 'shared-via-link',
        component: SharedViaLink,
        name: 'shared-via-link',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: false,
          title: $gettext('Files shared via link')
        }
      },
      {
        path: 'trash-bin',
        component: Trashbin,
        name: 'trashbin',
        meta: {
          hideFilelistActions: true,
          hasBulkActions: true,
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
        path: 'list/:item*',
        component: PublicFiles,
        meta: {
          auth: false,
          hasBulkActions: true,
          title: $gettext('Public files'),
          patchCleanPath: true
        }
      }
    ]
  },
  {
    name: 'public-link',
    path: '/public-link/:token',
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
    name: 'private-link',
    path: '/private-link/:fileId',
    components: {
      fullscreen: PrivateLink
    },
    meta: { hideHeadbar: true, title: $gettext('Resolving private link') }
  },
  {
    name: 'location-picker',
    path: '/location-picker/:context/:action/:item*',
    components: {
      app: LocationPicker
    },
    meta: {
      verbose: true,
      auth: false,
      patchCleanPath: true
    }
  },
  {
    name: 'public-drop',
    path: '/files-drop/:token',
    components: {
      app: FilesDrop
    },
    meta: { auth: false, title: $gettext('Public file upload') }
  }
]
