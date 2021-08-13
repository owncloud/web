import { isTrashbinRoute } from './helpers/route'

import FileDetails from './components/SideBar/Details/FileDetails.vue'
import FileDetailsMultiple from './components/SideBar/Details/FileDetailsMultiple.vue'
import FileActions from './components/SideBar/Actions/FileActions.vue'
import FileVersions from './components/SideBar/Versions/FileVersions.vue'
import FileShares from './components/SideBar/Shares/FileShares.vue'
import FileLinks from './components/SideBar/Links/FileLinks.vue'
import NoSelection from './components/SideBar/NoSelection.vue'

export default [
  // We don't have file details in the trashbin, yet.
  // Only allow `actions` panel on trashbin route for now.
  ({ rootFolder }) => ({
    app: 'no-selection-item',
    icon: 'info_outline',
    component: NoSelection,
    default: () => true,
    get enabled() {
      return rootFolder
    }
  }),
  ({ route, multipleSelection, rootFolder }) => ({
    app: 'details-item',
    icon: 'info_outline',
    component: FileDetails,
    default: !isTrashbinRoute(route),
    get enabled() {
      return !isTrashbinRoute(route) && !multipleSelection && !rootFolder
    }
  }),
  ({ multipleSelection, rootFolder }) => ({
    app: 'details-multiple-item',
    icon: 'info_outline',
    component: FileDetailsMultiple,
    default: () => true,
    get enabled() {
      return multipleSelection && !rootFolder
    }
  }),
  ({ route, multipleSelection, rootFolder }) => ({
    app: 'actions-item',
    component: FileActions,
    icon: 'slideshow',
    default: isTrashbinRoute(route),
    get enabled() {
      return !multipleSelection && !rootFolder
    }
  }),
  ({ capabilities, route, multipleSelection, rootFolder }) => ({
    app: 'sharing-item',
    icon: 'group',
    component: FileShares,
    get enabled() {
      if (multipleSelection || rootFolder) return false
      if (isTrashbinRoute(route)) {
        return false
      }

      if (capabilities.files_sharing) {
        return capabilities.files_sharing.api_enabled
      }
      return false
    }
  }),
  ({ capabilities, route, multipleSelection, rootFolder }) => ({
    app: 'links-item',
    icon: 'link',
    component: FileLinks,
    get enabled() {
      if (multipleSelection || rootFolder) return false
      if (isTrashbinRoute(route)) {
        return false
      }

      if (capabilities.files_sharing) {
        return capabilities.files_sharing.public.enabled
      }
      return false
    }
  }),
  ({ capabilities, highlightedFile, route, multipleSelection, rootFolder }) => ({
    app: 'versions-item',
    icon: 'file_version',
    component: FileVersions,
    get enabled() {
      if (multipleSelection || rootFolder) return false
      if (isTrashbinRoute(route)) {
        return false
      }
      return !!capabilities.core && highlightedFile && highlightedFile.type !== 'folder'
    }
  })
]
