import FileDetails from './components/SideBar/Details/FileDetails.vue'
import FileDetailsMultiple from './components/SideBar/Details/FileDetailsMultiple.vue'
import FileActions from './components/SideBar/Actions/FileActions.vue'
import FileVersions from './components/SideBar/Versions/FileVersions.vue'
import SharesPanel from './components/SideBar/Shares/SharesPanel.vue'
import NoSelection from './components/SideBar/NoSelection.vue'
import SpaceActions from './components/SideBar/Actions/SpaceActions.vue'
import {
  SpaceDetails,
  SpaceDetailsMultiple,
  SpaceNoSelection,
  isLocationTrashActive,
  isLocationPublicActive,
  isLocationSpacesActive,
  isLocationSharesActive,
  useCapabilityFilesSharing,
  useCapabilityFilesSharingApiEnabled,
  useCapabilityFilesSharingPublicEnabled,
  useRouter,
  useStore,
  SidebarPanelExtension,
  useIsFilesAppActive
} from '@ownclouders/web-pkg'
import {
  isProjectSpaceResource,
  spaceRoleEditor,
  spaceRoleManager
} from '@ownclouders/web-client/src/helpers'
import { Resource } from '@ownclouders/web-client'
import { useGettext } from 'vue3-gettext'
import { computed, unref } from 'vue'

export const sideBarPanels = () => {
  const router = useRouter()
  const store = useStore()
  const user = computed(() => store.getters.user)
  const { $gettext } = useGettext()
  const isSharingEnabled = useCapabilityFilesSharing(store)
  const isSharingApiEnabled = useCapabilityFilesSharingApiEnabled(store)
  const arePublicLinksEnabled = useCapabilityFilesSharingPublicEnabled(store)
  const isFilesAppActive = useIsFilesAppActive()

  return computed(
    () =>
      [
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.no-selection',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'no-selection',
            icon: 'questionnaire-line',
            title: () => $gettext('Details'),
            component: NoSelection,
            isRoot: () => true,
            isEnabled: ({ parent, items }) => {
              if (isLocationSpacesActive(router, 'files-spaces-projects')) {
                // project spaces overview has its own "no selection" panel
                return false
              }
              if (items?.length > 0) {
                return false
              }
              // empty selection in a project space root shows a "details" panel for the space itself
              return !isProjectSpaceResource(parent)
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.details-single-selection',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'details',
            icon: 'questionnaire-line',
            title: () => $gettext('Details'),
            component: FileDetails,
            componentAttrs: () => ({
              previewEnabled: unref(isFilesAppActive)
            }),
            isRoot: () => !isLocationTrashActive(router, 'files-trash-generic'),
            isEnabled: ({ items }) => {
              if (isLocationTrashActive(router, 'files-trash-generic')) {
                // details panel is not available in trash
                return false
              }
              if (items?.length !== 1) {
                return false
              }
              // project spaces have their own "details" panel
              return !isProjectSpaceResource(items[0])
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.details-multi-selection',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'details-multiple',
            icon: 'questionnaire-line',
            title: () => $gettext('Details'),
            component: FileDetailsMultiple,
            componentAttrs: () => ({
              get showSpaceCount() {
                return (
                  !isLocationSpacesActive(router, 'files-spaces-generic') &&
                  !isLocationSharesActive(router, 'files-shares-with-me') &&
                  !isLocationTrashActive(router, 'files-trash-generic')
                )
              }
            }),
            isRoot: () => true,
            isEnabled: ({ items }) => {
              if (isLocationSpacesActive(router, 'files-spaces-projects')) {
                // project spaces overview has its own "no selection" panel
                return false
              }
              return items?.length > 1
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.actions',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'actions',
            icon: 'slideshow-3',
            title: () => $gettext('Actions'),
            component: FileActions,
            isRoot: () => isLocationTrashActive(router, 'files-trash-generic'),
            isEnabled: ({ items }) => {
              if (items?.length !== 1) {
                return false
              }
              // project spaces have their own "actions" panel
              return !isProjectSpaceResource(items[0])
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.sharing',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'sharing',
            icon: 'user-add',
            iconFillType: 'line',
            title: () => $gettext('Shares'),
            component: SharesPanel,
            componentAttrs: () => ({
              showSpaceMembers: false,
              get showLinks() {
                if (unref(isSharingEnabled)) {
                  return unref(arePublicLinksEnabled)
                }
                return false
              }
            }),
            isEnabled: ({ items }) => {
              if (items?.length !== 1) {
                return false
              }
              if (isProjectSpaceResource(items[0])) {
                // project space roots have their own "sharing" panel (= space members)
                return false
              }
              if (
                isLocationTrashActive(router, 'files-trash-generic') ||
                isLocationPublicActive(router, 'files-public-link')
              ) {
                return false
              }
              if (unref(isSharingEnabled)) {
                return unref(isSharingApiEnabled)
              }
              return false
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.versions',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'versions',
            icon: 'git-branch',
            title: () => $gettext('Versions'),
            component: FileVersions,
            isEnabled: ({ items }) => {
              if (items?.length !== 1) {
                return false
              }
              if (isProjectSpaceResource(items[0])) {
                // project space roots don't support versions
                return false
              }
              if (
                isLocationTrashActive(router, 'files-trash-generic') ||
                isLocationPublicActive(router, 'files-public-link')
              ) {
                return false
              }
              return items[0].type !== 'folder'
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.projects.no-selection',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'no-selection',
            icon: 'questionnaire-line',
            title: () => $gettext('Details'),
            component: SpaceNoSelection,
            isRoot: () => true,
            isEnabled: ({ items }) => {
              if (!isLocationSpacesActive(router, 'files-spaces-projects')) {
                // only for project spaces overview
                return false
              }
              return items?.length === 0
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.projects.details-single-selection',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'details-space',
            icon: 'questionnaire-line',
            title: () => $gettext('Details'),
            component: SpaceDetails,
            isRoot: () => true,
            isEnabled: ({ items }) => {
              return items?.length === 1 && isProjectSpaceResource(items[0])
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.projects.details-multi-selection',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'details-space-multiple',
            icon: 'questionnaire-line',
            title: () => $gettext('Details'),
            component: SpaceDetailsMultiple,
            componentAttrs: ({ items }) => ({
              selectedSpaces: items
            }),
            isRoot: () => true,
            isEnabled: ({ items }) => {
              return items?.length > 1 && isLocationSpacesActive(router, 'files-spaces-projects')
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.projects.actions',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'space-actions',
            icon: 'slideshow-3',
            title: () => $gettext('Actions'),
            component: SpaceActions,
            isEnabled: ({ items }) => {
              if (items?.length !== 1) {
                return false
              }
              if (!isProjectSpaceResource(items[0])) {
                return false
              }
              if (
                !isLocationSpacesActive(router, 'files-spaces-projects') &&
                !isLocationSpacesActive(router, 'files-spaces-generic')
              ) {
                return false
              }
              return [
                ...items[0].spaceRoles[spaceRoleManager.name],
                ...items[0].spaceRoles[spaceRoleEditor.name]
              ].some((role) => role.id === unref(user).uuid)
            }
          }
        },
        {
          id: 'com.github.owncloud.web.files.sidebarPanels.projects.sharing',
          type: 'sidebarPanel',
          scopes: ['resource'],
          panel: {
            name: 'space-share',
            icon: 'group',
            title: () => $gettext('Members'),
            component: SharesPanel,
            componentAttrs: () => ({
              showSpaceMembers: true,
              get showLinks() {
                if (unref(isSharingEnabled)) {
                  return unref(arePublicLinksEnabled)
                }
                return false
              }
            }),
            isEnabled: ({ items }) => {
              return items?.length === 1 && isProjectSpaceResource(items[0])
            }
          }
        }
      ] satisfies SidebarPanelExtension<Resource, Resource>[]
  )
}
