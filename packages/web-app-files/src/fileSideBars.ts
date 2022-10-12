import FileDetails from './components/SideBar/Details/FileDetails.vue'
import FileDetailsMultiple from './components/SideBar/Details/FileDetailsMultiple.vue'
import FileActions from './components/SideBar/Actions/FileActions.vue'
import FileVersions from './components/SideBar/Versions/FileVersions.vue'
import SharesPanel from './components/SideBar/Shares/SharesPanel.vue'
import NoSelection from './components/SideBar/NoSelection.vue'
import SpaceActions from './components/SideBar/Actions/SpaceActions.vue'
import SpaceDetails from './components/SideBar/Details/SpaceDetails.vue'
import {
  isLocationTrashActive,
  isLocationPublicActive,
  isLocationSpacesActive,
  isLocationSharesActive
} from './router'
import { spaceRoleEditor, spaceRoleManager } from 'web-client/src/helpers/share'

import { Panel } from '../../web-pkg/src/components/sideBar'

import { Resource, User } from 'web-client'
import Router from 'vue-router'

function $gettext(msg: string): string {
  return msg
}

const panelGenerators: (({
  rootFolder,
  highlightedFile,
  router,
  multipleSelection,
  user,
  capabilities
}: {
  rootFolder: boolean
  highlightedFile: Resource
  router: Router
  multipleSelection: boolean
  user: User
  capabilities: any
}) => Panel)[] = [
  // We don't have file details in the trashbin, yet.
  // Only allow `actions` panel on trashbin route for now.
  ({ rootFolder, highlightedFile }): Panel => ({
    app: 'no-selection-item',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: NoSelection,
    default: () => true,
    get enabled() {
      return rootFolder && highlightedFile?.type !== 'space'
    }
  }),
  ({ router, multipleSelection, rootFolder }) => ({
    app: 'details-item',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: FileDetails,
    default: !isLocationTrashActive(router, 'files-trash-generic'),
    get enabled() {
      return (
        !isLocationTrashActive(router, 'files-trash-generic') && !multipleSelection && !rootFolder
      )
    }
  }),
  ({ multipleSelection, rootFolder, highlightedFile, router }) => ({
    app: 'details-multiple-item',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: FileDetailsMultiple,
    componentAttrs: {
      get showSpaceCount() {
        return (
          !isLocationSpacesActive(router, 'files-spaces-generic') &&
          !isLocationSharesActive(router, 'files-shares-with-me') &&
          !isLocationTrashActive(router, 'files-trash-generic')
        )
      }
    },
    default: () => true,
    get enabled() {
      return multipleSelection && (!rootFolder || highlightedFile?.type === 'space')
    }
  }),
  ({ multipleSelection, highlightedFile }) => ({
    app: 'details-space-item',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: SpaceDetails,
    default: () => true,
    get enabled() {
      return highlightedFile?.type === 'space' && !multipleSelection
    }
  }),
  ({ router, multipleSelection, rootFolder }) => ({
    app: 'actions-item',
    icon: 'slideshow-3',
    title: $gettext('Actions'),
    component: FileActions,
    default: isLocationTrashActive(router, 'files-trash-generic'),
    get enabled() {
      return !multipleSelection && !rootFolder
    }
  }),
  ({ multipleSelection, highlightedFile, user }) => ({
    app: 'space-actions-item',
    icon: 'slideshow-3',
    title: $gettext('Actions'),
    component: SpaceActions,
    get enabled() {
      if (multipleSelection) {
        return false
      }
      if (highlightedFile?.type !== 'space') {
        return false
      }
      return [
        ...highlightedFile.spaceRoles[spaceRoleManager.name],
        ...highlightedFile.spaceRoles[spaceRoleEditor.name]
      ].includes(user.uuid)
    }
  }),
  ({ capabilities, router, multipleSelection, rootFolder }) => ({
    app: 'sharing-item',
    icon: 'user-add',
    iconFillType: 'line',
    title: $gettext('Shares'),
    component: SharesPanel,
    componentAttrs: {
      showSpaceMembers: false,
      get showLinks() {
        if (capabilities.files_sharing) {
          return capabilities.files_sharing.public.enabled
        }
        return false
      }
    },
    get enabled() {
      if (multipleSelection || rootFolder) {
        return false
      }
      if (
        isLocationTrashActive(router, 'files-trash-generic') ||
        isLocationPublicActive(router, 'files-public-link')
      ) {
        return false
      }

      if (capabilities.files_sharing) {
        return capabilities.files_sharing.api_enabled
      }
      return false
    }
  }),
  ({ multipleSelection, highlightedFile, capabilities }) => ({
    app: 'space-share-item',
    icon: 'group',
    title: $gettext('Members'),
    component: SharesPanel,
    componentAttrs: {
      showSpaceMembers: true,
      get showLinks() {
        if (capabilities.files_sharing) {
          return capabilities.files_sharing.public.enabled
        }
        return false
      }
    },
    get enabled() {
      return highlightedFile?.type === 'space' && !multipleSelection
    }
  }),
  ({ capabilities, highlightedFile, router, multipleSelection, rootFolder }) => ({
    app: 'versions-item',
    icon: 'git-branch',
    title: $gettext('Versions'),
    component: FileVersions,
    get enabled() {
      if (multipleSelection || rootFolder) {
        return false
      }
      if (
        isLocationTrashActive(router, 'files-trash-generic') ||
        isLocationPublicActive(router, 'files-public-link')
      ) {
        return false
      }
      return !!capabilities.core && highlightedFile && highlightedFile.type !== 'folder'
    }
  })
]

export default panelGenerators
