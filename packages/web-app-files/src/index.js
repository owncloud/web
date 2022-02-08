import App from './App.vue'
import Favorites from './views/Favorites.vue'
import FilesDrop from './views/FilesDrop.vue'
import LocationPicker from './views/LocationPicker.vue'
import PrivateLink from './views/PrivateLink.vue'
import PublicFiles from './views/PublicFiles.vue'
import PublicLink from './views/PublicLink.vue'
import Personal from './views/Personal.vue'
import SharedResource from './views/shares/SharedResource.vue'
import SharedWithMe from './views/shares/SharedWithMe.vue'
import SharedWithOthers from './views/shares/SharedWithOthers.vue'
import SharedViaLink from './views/shares/SharedViaLink.vue'
import SpaceProject from './views/spaces/Project.vue'
import SpaceTrashbin from './views/spaces/Trashbin.vue'
import SpaceProjects from './views/spaces/Projects.vue'
import Trashbin from './views/Trashbin.vue'
import Home from './views/Home.vue'
import translations from '../l10n/translations.json'
import quickActions from './quickActions'
import store from './store'
import { FilterSearch, SDKSearch } from './search'
import { bus } from 'web-pkg/src/instance'
import { archiverService, thumbnailService, Registry } from './services'
import fileSideBars from './fileSideBars'
import { buildRoutes } from './router'
import get from 'lodash-es/get'
import { clientService } from 'web-pkg/src/services'

// dirty: importing view from other extension within project
import SearchResults from '../../web-app-search/src/views/List.vue'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('Files'),
  id: 'files',
  icon: 'resource-type-folder',
  isFileEditor: false,
  extensions: [],
  fileSideBars
}

const navItemFirst = [
  {
    name(capabilities) {
      return capabilities.spaces?.enabled ? $gettext('Personal') : $gettext('All files')
    },
    icon: appInfo.icon,
    hideByLightweight: true,
    route: {
      path: `/${appInfo.id}/spaces`
    }
  }
]
const navItems = [
  {
    name: $gettext('Favorites'),
    icon: 'star',
    route: {
      path: `/${appInfo.id}/favorites`
    },
    enabled(capabilities) {
      return capabilities.files && capabilities.files.favorites
    }
  },
  {
    name: $gettext('Shares'),
    icon: 'share-forward',
    route: {
      path: `/${appInfo.id}/shares`
    },
    activeFor: [{ path: `/${appInfo.id}/spaces/shares` }],
    enabled(capabilities) {
      return capabilities.files_sharing?.api_enabled !== false
    }
  },
  {
    name: $gettext('Spaces'),
    icon: 'layout-grid',
    route: {
      path: `/${appInfo.id}/spaces/projects`
    },
    enabled(capabilities) {
      return capabilities.spaces && capabilities.spaces.projects === true
    }
  },
  {
    name: $gettext('Deleted files'),
    icon: 'delete-bin-5',
    route: {
      path: `/${appInfo.id}/trash`
    },
    enabled(capabilities) {
      return capabilities.dav && capabilities.dav.trashbin === '1.0'
    }
  }
]

const navItemsLightweight = [
  {
    name: $gettext('Shared with me'),
    icon: 'share-forward',
    route: {
      path: `/${appInfo.id}/shares/with-me`
    }
  }
]

export default {
  appInfo,
  store,
  routes: buildRoutes({
    App,
    Favorites,
    Personal,
    FilesDrop,
    LocationPicker,
    PrivateLink,
    PublicFiles,
    PublicLink,
    SearchResults,
    SharedResource,
    SharedViaLink,
    SharedWithMe,
    SharedWithOthers,
    Spaces: {
      Project: SpaceProject,
      Projects: SpaceProjects,
      Trashbin: SpaceTrashbin
    },
    Trashbin,
    Home
  }),
  navItems: navItemFirst,
  quickActions,
  translations,
  ready({ router, store }) {
    Registry.filterSearch = new FilterSearch(store, router)
    Registry.sdkSearch = new SDKSearch(store, router)

    // when discussing the boot process of applications we need to implement a
    // registry that does not rely on call order, aka first register "on" and only after emit.
    bus.publish('app.search.register.provider', Registry.filterSearch)
    bus.publish('app.search.register.provider', Registry.sdkSearch)
  },
  userReady({ store }) {
    ;(store.getters.user.usertype && store.getters.user.usertype === 'lightweight'
      ? navItemsLightweight
      : navItems
    ).forEach((navItem) => {
      store.commit('ADD_NAV_ITEM', {
        extension: 'files',
        navItem
      })
    })
    // Load spaces to make them available across the application
    if (store.getters.capabilities?.spaces?.enabled) {
      store.dispatch('Files/loadSpaces', { clientService })
    }

    archiverService.initialize(
      store.getters.configuration.server || window.location.origin,
      get(store, 'getters.capabilities.files.archivers', [
        {
          enabled: true,
          version: '1.0.0',
          formats: ['tar', 'zip'],
          archiver_url: `${store.getters.configuration.server}index.php/apps/files/ajax/download.php`
        }
      ]),
      get(store, 'getters.capabilities.core.support-url-signing', true)
    )
    // FIXME: Remove mock data
    thumbnailService.initialize(
      get(store, 'getters.capabilities.files.thumbnail', {
        enabled: true,
        version: 'v0.1',
        supportedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'text/plain']
      })
    )
  }
}
