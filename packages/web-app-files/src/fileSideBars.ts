import FileDetails from './components/SideBar/Details/FileDetails.vue'
import FileDetailsMultiple from './components/SideBar/Details/FileDetailsMultiple.vue'
import FileActions from './components/SideBar/Actions/FileActions.vue'
import FileVersions from './components/SideBar/Versions/FileVersions.vue'
import SharesPanel from './components/SideBar/Shares/SharesPanel.vue'
import TagsPanel from './components/SideBar/TagsPanel.vue'
import NoSelection from './components/SideBar/NoSelection.vue'
import SpaceActions from './components/SideBar/Actions/SpaceActions.vue'
import SpaceDetails from 'web-pkg/src/components/sideBar/Spaces/Details/SpaceDetails.vue'
import SpaceNoSelection from 'web-pkg/src/components/sideBar/Spaces/SpaceNoSelection.vue'
import {
  isLocationTrashActive,
  isLocationPublicActive,
  isLocationSpacesActive,
  isLocationSharesActive
} from './router'
import { spaceRoleEditor, spaceRoleManager } from 'web-client/src/helpers/share'

import { Panel } from '../../web-pkg/src/components/sideBar'

import { Resource, User } from 'web-client'
import { Router } from 'vue-router'
import SpaceDetailsMultiple from 'web-pkg/src/components/sideBar/Spaces/Details/SpaceDetailsMultiple.vue'

function $gettext(msg: string): string {
  return msg
}

const panelGenerators: (({
  rootFolder,
  resource,
  selectedFiles,
  router,
  multipleSelection,
  user,
  capabilities
}: {
  rootFolder: boolean
  resource: Resource
  selectedFiles: Resource[]
  router: Router
  multipleSelection: boolean
  user: User
  capabilities: any
}) => Panel)[] = [
  // We don't have file details in the trashbin, yet.
  // Only allow `actions` panel on trashbin route for now.
  ({ router, multipleSelection, rootFolder, resource }): Panel => ({
    app: 'no-selection',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: NoSelection,
    default: () => true,
    get enabled() {
      return (
        !multipleSelection &&
        !isLocationSpacesActive(router, 'files-spaces-projects') &&
        (!resource || (rootFolder && resource?.type !== 'space'))
      )
    }
  }),
  ({ router, resource, multipleSelection }): Panel => ({
    app: 'no-selection',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: SpaceNoSelection,
    default: () => true,
    get enabled() {
      return (
        isLocationSpacesActive(router, 'files-spaces-projects') && !multipleSelection && !resource
      )
    }
  }),
  ({ router, multipleSelection, rootFolder, resource }) => ({
    app: 'details',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: FileDetails,
    default: !isLocationTrashActive(router, 'files-trash-generic'),
    get enabled() {
      return !!(
        !isLocationTrashActive(router, 'files-trash-generic') &&
        !multipleSelection &&
        !rootFolder &&
        resource &&
        resource.type !== 'space'
      )
    }
  }),
  ({ multipleSelection, router }) => ({
    app: 'details-multiple',
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
      return multipleSelection && !isLocationSpacesActive(router, 'files-spaces-projects')
    }
  }),
  ({ multipleSelection, selectedFiles, router }) => ({
    app: 'details-space-multiple',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: SpaceDetailsMultiple,
    componentAttrs: {
      selectedSpaces: selectedFiles
    },
    default: () => true,
    get enabled() {
      return multipleSelection && isLocationSpacesActive(router, 'files-spaces-projects')
    }
  }),
  ({ multipleSelection, resource }) => ({
    app: 'details-space',
    icon: 'questionnaire-line',
    title: $gettext('Details'),
    component: SpaceDetails,
    default: () => true,
    get enabled() {
      return resource?.type === 'space' && !multipleSelection
    }
  }),
  ({ router, multipleSelection, rootFolder, resource }) => ({
    app: 'actions',
    icon: 'slideshow-3',
    title: $gettext('Actions'),
    component: FileActions,
    default: isLocationTrashActive(router, 'files-trash-generic'),
    get enabled() {
      return !!(!multipleSelection && !rootFolder && resource && resource.type !== 'space')
    }
  }),
  ({ multipleSelection, resource, user }) => ({
    app: 'space-actions',
    icon: 'slideshow-3',
    title: $gettext('Actions'),
    component: SpaceActions,
    get enabled() {
      if (multipleSelection) {
        return false
      }
      if (resource?.type !== 'space') {
        return false
      }
      return !![
        ...resource.spaceRoles[spaceRoleManager.name],
        ...resource.spaceRoles[spaceRoleEditor.name]
      ].find((role) => role.id === user.uuid)
    }
  }),
  ({ capabilities, router, multipleSelection, rootFolder, resource }) => ({
    app: 'sharing',
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
      if (multipleSelection || rootFolder || !resource || resource.type === 'space') {
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
  ({ capabilities, resource, router, multipleSelection, rootFolder }) => ({
    app: 'tags',
    icon: 'price-tag-3',
    iconFillType: 'line',
    title: $gettext('Tags'),
    component: TagsPanel,
    componentAttrs: {},
    get enabled() {
      if (
        !capabilities?.files?.tags ||
        multipleSelection ||
        rootFolder ||
        !resource ||
        resource.type === 'space'
      ) {
        return false
      }
      if (typeof resource.canEditTags !== 'function' || !resource.canEditTags()) {
        return false
      }
      return !(
        isLocationTrashActive(router, 'files-trash-generic') ||
        isLocationPublicActive(router, 'files-public-link')
      )
    }
  }),
  ({ multipleSelection, resource, capabilities }) => ({
    app: 'space-share',
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
      return false//resource?.type === 'space' && !multipleSelection
    }
  }),
  ({ capabilities, resource, router, multipleSelection, rootFolder }) => ({
    app: 'versions',
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
      return (
        !!capabilities.core && resource && resource.type !== 'folder' && resource.type !== 'space'
      )
    }
  })
]

export default panelGenerators
