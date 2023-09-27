import App from './App.vue'
import Favorites from './views/Favorites.vue'
import FilesDrop from './views/FilesDrop.vue'
import SharedWithMe from './views/shares/SharedWithMe.vue'
import SharedWithOthers from './views/shares/SharedWithOthers.vue'
import SharedViaLink from './views/shares/SharedViaLink.vue'
import SpaceDriveResolver from './views/spaces/DriveResolver.vue'
import SpaceProjects from './views/spaces/Projects.vue'
import TrashOverview from './views/trash/Overview.vue'
import translations from '../l10n/translations.json'
import quickActions from '@ownclouders/web-pkg'
import store from './store'
import { SDKSearch } from './search'
import { eventBus } from '@ownclouders/web-pkg'
import { Registry } from './services'
import fileSideBars from './fileSideBars'
import { buildRoutes } from '@ownclouders/web-pkg'
import { AppNavigationItem, AppReadyHookArgs } from '@ownclouders/web-pkg'

// dirty: importing view from other extension within project
import SearchResults from '../../web-app-search/src/views/List.vue'
import {
  SpaceResource,
  isPersonalSpaceResource,
  isShareSpaceResource
} from 'web-client/src/helpers'
import { configurationManager } from '@ownclouders/web-pkg'

// just a dummy function to trick gettext tools
function $gettext(msg) {
  return msg
}

const appInfo = {
  name: $gettext('Files'),
  id: 'files',
  icon: 'resource-type-folder',
  color: 'var(--oc-color-swatch-primary-muted)',
  isFileEditor: false,
  extensions: [],
  fileSideBars
}
const navItems = (context): AppNavigationItem[] => {
  return [
    {
      name(capabilities) {
        return capabilities.spaces?.enabled ? $gettext('Personal') : $gettext('All files')
      },
      icon: appInfo.icon,
      route: {
        path: `/${appInfo.id}/spaces/personal`
      },
      isActive: () => {
        return (
          !context.$store.getters['runtime/spaces/currentSpace'] ||
          context.$store.getters['runtime/spaces/currentSpace']?.isOwner(
            context.$store.getters.user
          )
        )
      },
      enabled(capabilities) {
        if (!capabilities.spaces?.enabled) {
          return true
        }
        return !!context?.$store?.getters['runtime/spaces/spaces'].find(
          (drive) => isPersonalSpaceResource(drive) && drive.isOwner(context.$store.getters.user)
        )
      }
    },
    {
      name: $gettext('Favorites'),
      icon: 'star',
      route: {
        path: `/${appInfo.id}/favorites`
      },
      enabled(capabilities) {
        return capabilities.files?.favorites
      }
    },
    {
      name: $gettext('Shares'),
      icon: 'share-forward',
      route: {
        path: `/${appInfo.id}/shares`
      },
      isActive: () => {
        const space = context.$store.getters['runtime/spaces/currentSpace'] as SpaceResource
        // last check is when fullShareOwnerPaths is enabled
        return !space || isShareSpaceResource(space) || !space?.isOwner(context.$store.getters.user)
      },
      activeFor: [
        { path: `/${appInfo.id}/spaces/share` },
        { path: `/${appInfo.id}/spaces/personal` }
      ],
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
      activeFor: [{ path: `/${appInfo.id}/spaces/project` }],
      enabled(capabilities) {
        return capabilities.spaces?.projects
      }
    },
    {
      name: $gettext('Deleted files'),
      icon: 'delete-bin-5',
      route: {
        path: `/${appInfo.id}/trash/overview`
      },
      activeFor: [{ path: `/${appInfo.id}/trash` }],
      enabled(capabilities) {
        return capabilities.dav?.trashbin === '1.0' && capabilities.files?.undelete
      }
    }
  ]
}

export default {
  appInfo,
  store,
  routes: buildRoutes({
    App,
    Favorites,
    FilesDrop,
    SearchResults,
    Shares: {
      SharedViaLink,
      SharedWithMe,
      SharedWithOthers
    },
    Spaces: {
      DriveResolver: SpaceDriveResolver,
      Projects: SpaceProjects
    },
    Trash: {
      Overview: TrashOverview
    }
  }),
  navItems,
  quickActions,
  translations,
  ready({ router, store, globalProperties }: AppReadyHookArgs) {
    const { $clientService } = globalProperties
    Registry.sdkSearch = new SDKSearch(store, router, $clientService, configurationManager)

    // when discussing the boot process of applications we need to implement a
    // registry that does not rely on call order, aka first register "on" and only after emit.
    eventBus.publish('app.search.register.provider', Registry.sdkSearch)
  }
}
