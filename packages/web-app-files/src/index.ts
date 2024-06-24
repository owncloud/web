import translations from '../l10n/translations.json'
import {
  ApplicationInformation,
  ComponentLoader,
  defineWebApplication,
  useCapabilityStore,
  useSpacesStore,
  useUserStore
} from '@ownclouders/web-pkg'
import { extensions } from './extensions'
import { buildRoutes } from '@ownclouders/web-pkg'
import { AppNavigationItem } from '@ownclouders/web-pkg'
import { isPersonalSpaceResource, isShareSpaceResource } from '@ownclouders/web-client'
import { ComponentCustomProperties } from 'vue'
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
  isFileEditor: false,
  extensions: []
}

export const navItems = (context: ComponentCustomProperties): AppNavigationItem[] => {
  const spacesStores = useSpacesStore()
  const userStore = useUserStore()
  const capabilityStore = useCapabilityStore()

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
      activeFor: [
        { path: `/${appInfo.id}/spaces/share` },
        { path: `/${appInfo.id}/spaces/personal` }
      ],
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
      activeFor: [{ path: `/${appInfo.id}/spaces/project` }],
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
      activeFor: [{ path: `/${appInfo.id}/trash` }],
      isVisible() {
        return capabilityStore.davTrashbin === '1.0' && capabilityStore.filesUndelete
      },
      priority: 50
    }
  ]
}

export default defineWebApplication({
  setup() {
    const userStore = useUserStore()

    return {
      appInfo: {
        ...appInfo,
        applicationMenu: {
          enabled: () => {
            return !!userStore.user
          },
          priority: 10
        }
      },
      routes: buildRoutes({
        App: ComponentLoader(async () => (await import('./App.vue')).default),
        Favorites: ComponentLoader(async () => (await import('./views/Favorites.vue')).default),
        FilesDrop: ComponentLoader(async () => (await import('./views/FilesDrop.vue')).default),
        SearchResults: ComponentLoader(
          // FIXME: import from another app
          async () => (await import('../../web-app-search/src/views/List.vue')).default
        ),
        Shares: {
          SharedViaLink: ComponentLoader(
            async () => (await import('./views/shares/SharedViaLink.vue')).default
          ),
          SharedWithMe: ComponentLoader(
            async () => (await import('./views/shares/SharedWithMe.vue')).default
          ),
          SharedWithOthers: ComponentLoader(
            async () => (await import('./views/shares/SharedWithOthers.vue')).default
          )
        },
        Spaces: {
          DriveResolver: ComponentLoader(
            async () => (await import('./views/spaces/DriveResolver.vue')).default
          ),
          Projects: ComponentLoader(
            async () => (await import('./views/spaces/Projects.vue')).default
          )
        },
        Trash: {
          Overview: ComponentLoader(
            async () => (await import('./views/trash/Overview.vue')).default
          )
        }
      }),
      navItems,
      translations,
      extensions: extensions(),
      extensionPoints: extensionPoints()
    }
  }
})
