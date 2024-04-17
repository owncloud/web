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
import {
  ApplicationInformation,
  defineWebApplication,
  useCapabilityStore,
  useEmbedMode,
  useSpacesStore,
  useUserStore
} from '@ownclouders/web-pkg'
import { extensions } from './extensions'
import { buildRoutes } from '@ownclouders/web-pkg'
import { AppNavigationItem } from '@ownclouders/web-pkg'

// dirty: importing view from other extension within project
import SearchResults from '../../web-app-search/src/views/List.vue'
import {
  isPersonalSpaceResource,
  isShareSpaceResource,
  isProjectSpaceResource,
  isMountPointSpaceResource
} from '@ownclouders/web-client'
import { ComponentCustomProperties, unref } from 'vue'
import { extensionPoints } from './extensionPoints'

// just a dummy function to trick gettext tools
function $gettext(msg: string) {
  return msg
}

const appInfo: ApplicationInformation = {
  name: $gettext('Files'),
  id: 'files',
  icon: 'resource-type-folder',
  color: 'var(--oc-color-swatch-primary-muted)',
  extensions: []
}

export const navItems = (context: ComponentCustomProperties): AppNavigationItem[] => {
  const spacesStores = useSpacesStore()
  const userStore = useUserStore()
  const capabilityStore = useCapabilityStore()
  const { isEnabled: isEmbedModeEnabled } = useEmbedMode()

  return [
    {
      name() {
        return $gettext('Personal')
      },
      icon: appInfo.icon,
      route: {
        path: `/${appInfo.id}/spaces/personal`
      },
      isActive: () => {
        return !spacesStores.currentSpace || spacesStores.currentSpace?.isOwner(userStore.user)
      },
      activeFor: () => {
        const personalSpace = spacesStores.spaces.find(
          (drive) => isPersonalSpaceResource(drive) && drive.isOwner(userStore.user)
        )

        return personalSpace
          ? [
              {
                path: `/${appInfo.id}/spaces/${personalSpace.driveAlias}`
              }
            ]
          : []
      },
      isVisible() {
        if (!spacesStores.spacesInitialized) {
          return true
        }

        return !!spacesStores.spaces.find(
          (drive) => isPersonalSpaceResource(drive) && drive.isOwner(userStore.user)
        )
      },
      priority: 10
    },
    {
      name: $gettext('Favorites'),
      icon: 'star',
      route: {
        path: `/${appInfo.id}/favorites`
      },
      isVisible() {
        return capabilityStore.filesFavorites && context.$ability.can('read', 'Favorite')
      },
      priority: 20
    },
    {
      name: $gettext('Shares'),
      icon: 'share-forward',
      route: {
        path: `/${appInfo.id}/shares`
      },
      isActive: () => {
        const space = spacesStores.currentSpace
        // last check is when fullShareOwnerPaths is enabled
        return !space || isShareSpaceResource(space) || !space?.isOwner(userStore.user)
      },
      activeFor: () => {
        const shares = [
          { path: `/${appInfo.id}/spaces/share` },
          { path: `/${appInfo.id}/spaces/ocm-share` },
          { path: `/${appInfo.id}/spaces/personal` }
        ]
        spacesStores.spaces.forEach((drive) => {
          if (isMountPointSpaceResource(drive)) {
            shares.push({
              path: `/${appInfo.id}/spaces/${drive.root?.remoteItem?.driveAlias}`
            })
          }
        })
        return shares
      },
      isVisible() {
        return capabilityStore.sharingApiEnabled !== false
      },
      priority: 30
    },
    {
      name: $gettext('Spaces'),
      icon: 'layout-grid',
      route: {
        path: `/${appInfo.id}/spaces/projects`
      },
      activeFor: () => {
        const projects = [{ path: `/${appInfo.id}/spaces/project` }]
        spacesStores.spaces.forEach((drive) => {
          if (isProjectSpaceResource(drive)) {
            projects.push({
              path: `/${appInfo.id}/spaces/${drive.driveAlias}`
            })
          }
        })
        return projects
      },
      isVisible() {
        return capabilityStore.spacesProjects
      },
      priority: 40
    },
    {
      name: $gettext('Deleted files'),
      icon: 'delete-bin-5',
      route: {
        path: `/${appInfo.id}/trash/overview`
      },
      activeFor: () => [{ path: `/${appInfo.id}/trash` }],
      isVisible() {
        return (
          capabilityStore.davTrashbin === '1.0' &&
          capabilityStore.filesUndelete &&
          !unref(isEmbedModeEnabled)
        )
      },
      priority: 50
    }
  ]
}

export default defineWebApplication({
  setup() {
    return {
      appInfo,
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
      translations,
      extensions: extensions(appInfo),
      extensionPoints: extensionPoints()
    }
  }
})
