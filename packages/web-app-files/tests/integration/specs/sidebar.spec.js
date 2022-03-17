import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/vue'
import { config } from '@vue/test-utils'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
import fileSideBars from '@files/src/fileSideBars'
import SharedFiles from '@/__fixtures__/sharedFiles'
import { buildSharedResource } from '@files/src/helpers/resources'
import App from '@files/src/App.vue'
import Favorites from '@files/src/views/Favorites.vue'
import FilesDrop from '@files/src/views/FilesDrop.vue'
import LocationPicker from '@files/src/views/LocationPicker.vue'
import PrivateLink from '@files/src/views/PrivateLink.vue'
import PublicFiles from '@files/src/views/PublicFiles.vue'
import PublicLink from '@files/src/views/PublicLink.vue'
import Personal from '@files/src/views/Personal.vue'
import SharedWithMe from '@files/src/views/shares/SharedWithMe.vue'
import SharedWithOthers from '@files/src/views/shares/SharedWithOthers.vue'
import SharedViaLink from '@files/src/views/shares/SharedViaLink.vue'
import SpaceProject from '@files/src/views/spaces/Project.vue'
import SpaceProjects from '@files/src/views/spaces/Projects.vue'
import Trashbin from '@files/src/views/Trashbin.vue'
import { buildRoutes, createLocationShares } from '@files/src/router'
import Sidebar from '@files/src/components/SideBar/SideBar.vue'

const routes = buildRoutes({
  App,
  Favorites,
  Personal,
  FilesDrop,
  LocationPicker,
  PrivateLink,
  PublicFiles,
  PublicLink,
  SharedViaLink,
  SharedWithMe,
  SharedWithOthers,
  Spaces: {
    Project: SpaceProject,
    Projects: SpaceProjects
  },
  Trashbin
})

const store = {
  ...Store,
  modules: {
    ...Store.modules,
    user: {
      ...Store.modules.user,
      state: {
        ...Store.modules.user.state,
        id: 'alice',
        capabilities: {
          files_sharing: {
            public: {
              enabled: true
            }
          },
          files: {
            privateLinks: true
          }
        }
      }
    },
    apps: {
      ...Store.modules.apps,
      state: {
        ...Store.modules.apps.state,
        fileSideBars
      }
    },
    Files: {
      ...StoreFiles,
      getters: {
        ...StoreFiles.getters,
        highlightedFile: () => buildSharedResource(SharedFiles.json().ocs.data[0], true)
      }
    }
  }
}
describe('Files sidebar', () => {
  test('Links panel displays private link for a shared file', async () => {
    config.mocks.publicPage = () => false
    config.mocks.$client.shares.getShares = () => new Promise((resolve) => resolve([]))

    const { getByTestId, findByTestId, findByText } = render(
      Sidebar,
      { routes, store },
      (vue, store, router) => {
        vue.directive('click-outside', () => {})
        vue.directive('translate', () => {})
        router.push(createLocationShares('files-shares-with-me'))
      }
    )

    expect(getByTestId('files-sidebar')).toBeVisible()

    await fireEvent.click(await findByTestId('sidebar-panel-links-item-select'))
    expect(await findByText('http://host.docker.internal:8080/f/3867')).toBeVisible()
  })
})
