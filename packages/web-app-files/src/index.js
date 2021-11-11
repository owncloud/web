import translationsJson from '../l10n/translations.json'
import quickActionsImport from './quickActions'
import store from './store'
import { FilterSearch, SDKSearch } from './search'
import { bus } from 'web-pkg/src/instance'
import { archiverService, Registry } from './services'
import fileSideBars from './fileSideBars'
import routes from './routes'
import get from 'lodash-es/get'

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
  fileSideBars
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
    archiverService.initialize(
      store.getters.configuration.server || window.location.origin,
      get(store, 'getters.capabilities.files.archivers', [])
    )
  }
}
