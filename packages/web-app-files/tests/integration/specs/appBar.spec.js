import '@testing-library/jest-dom'
import { render, waitFor, fireEvent } from '@testing-library/vue'
import { config } from '@vue/test-utils'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
import { bus } from '@pkg/src/instance'

import AppBar from '@files/src/components/AppBar/AppBar.vue'

const store = {
  ...Store,
  modules: {
    ...Store.modules,
    user: {
      ...Store.modules.user,
      state: {
        ...Store.modules.user.state,
        id: 'alice'
      }
    },
    Files: {
      ...StoreFiles
    }
  }
}

describe('AppBar contains set of actions and informations', () => {
  describe('when breadcrumbs are visible', () => {
    beforeEach(() => {
      config.mocks.publicPage = () => false

      bus.publish = jest.fn((path) => path)
    })

    test('user can refresh files list by clicking on last breadcrumb item', async () => {
      render(
        AppBar,
        {
          setup: () => {
            return {
              isPersonalLocation: true,
              isSharesLocation: false
            }
          },
          store,
          routes: [{ name: 'files-personal', path: '/files/list/personal/:item?/:page?' }]
        },
        (vue, store, router) => {
          vue.directive('translate', () => {})
          router.push({ name: 'files-personal', params: { item: '/documents' } })
        }
      )
      const item = document.querySelector('[data-testid="files-breadcrumbs"] .oc-button')

      await waitFor(() => expect(item).toBeVisible())
      await fireEvent.click(item)
      expect(bus.publish).toHaveBeenCalledWith('app.files.list.load', '/documents')
    })
  })
})
