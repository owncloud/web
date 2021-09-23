import translationsJson from '../l10n/translations.json'
import quickActionsImport from './quickActions'
import store from './store'
import { FilterSearch, SDKSearch } from './search'
import { bus } from 'web-pkg/src/instance'
import { Registry } from './services'
import fileSideBars from './fileSideBars'
import routes from './routes'
import { archiverService } from './services/archiver'

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

// type: patch
// temporary patch till we have upgraded web to the latest vue router which make this obsolete
// this takes care that routes like 'foo/bar/baz' which by default would be converted to 'foo%2Fbar%2Fbaz' stay as they are
// should immediately go away and be removed after finalizing the update
const patchRouter = router => {
  // for now we only need the patch on following routes, if needed on more just extend
  // - files-personal: https://github.com/owncloud/web/issues/1883
  // - files-personal: https://github.com/owncloud/web/issues/4595
  // - files-public-list
  // - files-location-picker
  const activateForRoutes = ['files-personal', 'files-public-list', 'files-location-picker']
  const bindMatcher = router.match.bind(router)
  const cleanPath = route =>
    [
      ['%2F', '/'],
      ['//', '/']
    ].reduce((path, rule) => path.replaceAll(rule[0], rule[1]), route || '')

  router.match = (raw, current, redirectFrom) => {
    const bindMatch = bindMatcher(raw, current, redirectFrom)

    if (!activateForRoutes.includes(bindMatch.name)) {
      return bindMatch
    }

    return {
      ...bindMatch,
      path: cleanPath(bindMatch.path),
      fullPath: cleanPath(bindMatch.fullPath)
    }
  }
}

export default {
  appInfo,
  store,
  routes,
  navItems,
  quickActions,
  translations,
  ready({ router: runtimeRouter, store: runtimeStore }) {
    patchRouter(runtimeRouter)
    Registry.filterSearch = new FilterSearch(runtimeStore, runtimeRouter)
    Registry.sdkSearch = new SDKSearch(runtimeStore, runtimeRouter)

    // when discussing the boot process of applications we need to implement a
    // registry that does not rely on call order, aka first register "on" and only after emit.
    bus.emit('app.search.register.provider', Registry.filterSearch)
    bus.emit('app.search.register.provider', Registry.sdkSearch)

    // initialize services
    archiverService.initialize(
      runtimeStore.getters.configuration.server,
      runtimeStore.getters.capabilities.files.archivers
    )
  }
}
