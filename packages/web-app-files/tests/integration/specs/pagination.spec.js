import '@testing-library/jest-dom'
import { render, waitFor, fireEvent } from '@testing-library/vue'
import merge from 'lodash-es/merge'

import toKebabCase from '../../../../../tests/helpers/toKebabCase'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'

import Personal from '../../../src/views/Personal.vue'
import Favorites from '../../../src/views/Favorites.vue'
import LocationPicker from '../../../src/views/LocationPicker.vue'
import PublicFiles from '../../../src/views/PublicFiles.vue'
import SharedViaLink from '../../../src/views/SharedViaLink.vue'
import SharedWithOthers from '../../../src/views/SharedWithOthers.vue'
import Trashbin from '../../../src/views/Trashbin.vue'

// TODO: Make routes importable instead of defining them manually
const routes = [
  { name: 'files-personal', path: '/files/list/personal/:item?', component: Personal },
  { name: 'files-favorites', path: '/files/list/favorites', component: Favorites },
  {
    name: 'files-shared-with-others',
    path: '/files/list/shared-with-others',
    component: SharedWithOthers
  },
  { name: 'files-via-link', path: '/files/list/via-link', component: SharedViaLink },
  { name: 'files-trashbin', path: '/files/list/trash-bin', component: Trashbin },
  {
    name: 'files-location-picker',
    path: '/files/location-picker/:context/:action/:item?',
    component: LocationPicker
  },
  {
    name: 'files-public-list',
    path: '/files/public/list/:item',
    component: PublicFiles,
    meta: {
      auth: false,
      hasBulkActions: true,
      title: 'Public files'
    }
  }
]
let store

const stubs = { 'context-actions': true }
const cases = [
  ['Personal', '/files/list/personal/', Personal],
  ['Favorites', '/files/list/favorites/', Favorites],
  [
    'LocationPicker',
    '/files/location-picker/private/move/%2F?resource=%2FDocuments',
    LocationPicker
  ],
  ['PublicFiles', '/files/public/list/link', PublicFiles],
  ['SharedViaLink', '/files/list/via-link/', SharedViaLink],
  ['SharedWithOthers', '/files/list/shared-with-others/', SharedWithOthers],
  ['Trashbin', '/files/list/trash-bin/', Trashbin]
]

describe('User can navigate in files list using pagination', () => {
  beforeEach(() => {
    store = merge(
      {},
      Store,
      {
        modules: {
          user: {
            state: {
              id: 'alice'
            }
          },
          Files: StoreFiles
        }
      },
      {
        modules: {
          Files: {
            modules: {
              pagination: {
                state: () => ({
                  currentPage: 1,
                  itemsPerPage: 2
                })
              }
            }
          }
        }
      }
    )

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
