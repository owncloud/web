import '@testing-library/jest-dom'
import { render, waitFor, fireEvent } from '@testing-library/vue'
import merge from 'lodash-es/merge'

import toKebabCase from '../../../../../tests/helpers/toKebabCase'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'

import Personal from '@files/src/views/Personal.vue'
import Favorites from '@files/src/views/Favorites.vue'
import LocationPicker from '@files/src/views/LocationPicker.vue'
import PublicFiles from '@files/src/views/PublicFiles.vue'
import SharedViaLink from '@files/src/views/shares/SharedViaLink.vue'
import SharedWithOthers from '@files/src/views/shares/SharedWithOthers.vue'
import Trashbin from '@files/src/views/Trashbin.vue'
import FilesApp from '@files/src'

let store
const routes = FilesApp.routes
const stubs = { 'context-actions': true }
const cases = [
  ['Personal', '/spaces/personal/home', Personal],
  ['Favorites', '/list/favorites/', Favorites],
  ['LocationPicker', '/ops/location-picker/private/move/%2F?resource=%2FDocuments', LocationPicker],
  ['PublicFiles', '/public/list/link', PublicFiles],
  ['SharedViaLink', '/list/shared-via-link/', SharedViaLink],
  ['SharedWithOthers', '/list/shared-with-others/', SharedWithOthers],
  ['Trashbin', '/trash/personal', Trashbin]
]

describe('User can navigate in files list using pagination', () => {
  beforeEach(() => {
    window.localStorage.setItem('oc_options_items-per-page', '2')
    store = merge({}, Store, {
      modules: {
        config: {
          getters: {
            configuration: () => ({
              options: {
                disablePreviews: true
              }
            })
          }
        },
        user: {
          state: {
            id: 'alice'
          }
        },
        Files: StoreFiles
      }
    })
    const appBar = document.createElement('div')
    const breadcrumbs = document.createElement('div')
    const breadcrumbItem = document.createElement('div')

    appBar.id = 'files-app-bar'
    breadcrumbs.id = 'files-breadcrumb'

    breadcrumbItem.appendChild(document.createElement('div'))
    breadcrumbs.appendChild(breadcrumbItem)
    document.body.appendChild(appBar)
    document.body.appendChild(breadcrumbs)
  })

  afterEach(() => {
    document.body.removeChild(document.getElementById('files-app-bar'))
    document.body.removeChild(document.getElementById('files-breadcrumb'))
  })

  test.each(cases)(
    'Resources get updated when user navigates to a new page via pagination in %s files list',
    // eslint-disable-next-line jest/no-done-callback
    async (name, route, component) => {
      const { getByText, queryByText } = render(
        component,
        { routes, store, stubs },
        (vue, store, router) => {
          vue.directive('translate', jest.fn())
          router.push(route)
        }
      )

      await waitFor(() =>
        expect(document.querySelector(`#files-${toKebabCase(name)}-table`)).toBeVisible()
      )

      expect(getByText('Documents')).toBeVisible()
      expect(queryByText('Photos')).toBe(null)
      expect(queryByText('ownCloud Manual')).toBe(null)
      expect(document.querySelector('.oc-pagination')).toBeVisible()

      // 2 links, 1 current page and 1 next page link
      expect(document.querySelectorAll('.oc-pagination-list-item').length).toBe(3)

      const secondPage = document
        .evaluate(
          "//a[contains(@class, 'oc-pagination-list-item-link') and contains(., '2')]",
          document,
          null,
          XPathResult.ANY_TYPE,
          null
        )
        .iterateNext()

      expect(secondPage).toBeVisible()

      await fireEvent.click(secondPage)
      await waitFor(() => expect(getByText('Photos')).toBeVisible())

      expect(document.querySelector('.oc-pagination-list-item-current').textContent).toMatch('2')
    }
  )

  test.each(cases)(
    'Resources get updated when user navigates to %s directly via URL',
    async (name, route, component) => {
      // eslint-disable-next-line jest/no-done-callback
      const { getByText, queryByText } = render(
        component,
        { routes, store, stubs },
        (vue, store, router) => {
          vue.directive('translate', jest.fn())

          if (name === 'LocationPicker') {
            router.push(`${route}&page=2`)
            return
          }

          router.push(`${route}?page=2`)
        }
      )

      await waitFor(() =>
        expect(document.querySelector(`#files-${toKebabCase(name)}-table`)).toBeVisible()
      )

      expect(queryByText('Documents')).toBe(null)
      expect(getByText('Photos')).toBeVisible()
      expect(queryByText('ownCloud Manual')).toBeVisible()
      expect(document.querySelector('.oc-pagination')).toBeVisible()
      expect(document.querySelectorAll('.oc-pagination-list-item').length).toBe(3)
      expect(document.querySelector('.oc-pagination-list-item-current').textContent).toMatch('2')
    }
  )
})
