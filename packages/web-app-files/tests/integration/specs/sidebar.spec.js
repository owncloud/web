import '@testing-library/jest-dom'
import { render, fireEvent } from '@testing-library/vue'
import { config } from '@vue/test-utils'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
import fileSideBars from '@files/src/fileSideBars'
import SharedFiles from '@/__fixtures__/sharedFiles'
import { buildSharedResource } from '@files/src/helpers/resources'
import routes from '@files/src/routes'

import Sidebar from '@files/src/components/SideBar/SideBar.vue'

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
    config.mocks.$client.shares.getShares = () => new Promise(resolve => resolve([]))

    const { getByTestId, findByTestId, findByText } = render(
      Sidebar,
      { routes, store },
      (vue, store, router) => {
        vue.directive('click-outside', () => {})
        vue.directive('translate', () => {})
        router.push({ name: 'shared-with-me' })
      }
    )

    expect(getByTestId('files-sidebar')).toBeVisible()

    await fireEvent.click(await findByTestId('sidebar-panel-links-item-select'))
    expect(await findByText('http://host.docker.internal:8080/f/3867')).toBeVisible()
  })
})
