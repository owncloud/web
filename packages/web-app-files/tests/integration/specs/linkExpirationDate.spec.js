import '@testing-library/jest-dom'
import { render, fireEvent, waitFor, within } from '@testing-library/vue'
import merge from 'lodash-es/merge'
import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
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
import { buildRoutes, createLocationSpaces } from '@files/src/router'
import fileSideBars from '@files/src/fileSideBars'
import { getDateInFuture, navigateToDate } from '../helpers/date'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'
import { DateTime } from 'luxon'
import FileLinks from '@files/src/components/SideBar/Shares/FileLinks.vue'

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

const existingShares = [
  {
    shareInfo: {
      id: 1,
      share_type: 3,
      uid_owner: 'alice',
      displayname_owner: 'alice',
      permissions: '1',
      stime: new Date().getTime(),
      expiration: DateTime.fromJSDate(getDateInFuture(2)).toFormat('yyyy-MM-dd HH:mm:ss'),
      uid_file_owner: 'alice',
      displayname_file_owner: 'alice',
      path: '/Documents',
      item_type: 'folder',
      item_source: 10,
      file_source: 10,
      file_parent: 6,
      file_target: '/Documents',
      share_with: 'bob',
      share_with_displayname: 'bob',
      token: 'token',
      url: 'url',
      name: 'Public link'
    }
  }
]

describe('Users can set expiration date when sharing via public link', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    window.sessionStorage.clear()
  })
  test('user can set a new expiration date', async () => {
    const component = renderComponent()
    const { findByTestId, baseElement, getByTestId, queryByTestId } = component
    const addBtn = await findByTestId('files-link-add-btn')

    expect(addBtn).toBeVisible()
    await fireEvent.click(addBtn)
    expect(await findByTestId('new-files-link')).toBeVisible()
    await fireEvent.update(baseElement.querySelector('#oc-files-file-link-name'), 'Public link')

    expect(getByTestId('recipient-datepicker')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-datepicker-btn'))

    const newDate = getDateInFuture(2)
    await navigateToDate(newDate, component)

    const shareBtn = getByTestId('new-files-link-btn')
    expect(shareBtn).toBeVisible()
    await fireEvent.click(shareBtn)
    await waitFor(() => {
      return expect(queryByTestId('files-link-being-created')).toBe(null)
    })

    const link = await findByTestId('files-link-id-1')
    expect(link).toBeVisible()

    expect(
      within(getByTestId('files-link-id-1')).getByLabelText('Expires in in 2 days', {
        exact: false
      })
    ).toBeVisible()
  })

  test('user can edit an existing expiration date', async () => {
    const component = renderComponent({
      mocks: {
        $client: {
          ...sdkMock,
          shares: {
            ...sdkMock.shares,
            getShares: jest.fn().mockImplementation(() => Promise.resolve(existingShares))
          }
        }
      }
    })
    const { findByTestId, getByTestId } = component

    const link = await findByTestId('files-link-id-1')
    expect(link).toBeVisible()

    const editBtn = getByTestId('files-link-id-1-btn-edit')
    expect(editBtn).toBeVisible()
    await fireEvent.click(editBtn)

    const editExpiryDateBtn = getByTestId('files-link-id-1-edit-edit-expiration')
    expect(editExpiryDateBtn).toBeVisible()
    await fireEvent.click(editExpiryDateBtn)

    const newDate = getDateInFuture(4)
    await navigateToDate(newDate, component)

    expect(
      within(getByTestId('files-link-id-1')).getByLabelText('Expires in in 4 days', {
        exact: false
      })
    ).toBeVisible()
  })

  test('user can remove an existing expiration date', async () => {
    const component = renderComponent({
      mocks: {
        $client: {
          ...sdkMock,
          shares: {
            ...sdkMock.shares,
            getShares: jest.fn().mockImplementation(() => Promise.resolve(existingShares))
          }
        }
      }
    })
    const { findByTestId, getByTestId, queryByTestId } = component

    const link = await findByTestId('files-link-id-1')
    expect(link).toBeVisible()

    const editBtn = getByTestId('files-link-id-1-btn-edit')
    expect(editBtn).toBeVisible()
    await fireEvent.click(editBtn)

    const removeExpiryDateBtn = getByTestId('files-link-id-1-edit-remove-expiration')
    expect(removeExpiryDateBtn).toBeVisible()
    await fireEvent.click(removeExpiryDateBtn)
    await waitFor(() => {
      return expect(queryByTestId('files-link-id-1-edit-remove-expiration')).toBe(null)
    })

    expect(within(link).queryByTestId('files-link-id-1-expiration-date')).toBe(null)
  })
})

const getTestFolder = () => ({
  type: 'folder',
  isFolder: true,
  ownerId: 'alice',
  ownerDisplayName: 'alice',
  mdate: 'Wed, 21 Oct 2015 07:28:00 GMT',
  size: '740',
  isMounted: jest.fn(() => true),
  name: 'lorem.txt',
  privateLink: 'some-link',
  canShare: jest.fn(() => true),
  path: '/documents'
})

function createStore(store) {
  return merge(
    {},
    Store,
    {
      modules: {
        config: {
          getters: {
            configuration: () => ({
              server: 'https://example.com',
              options: {}
            })
          }
        },
        user: {
          state: {
            id: 'alice',
            capabilities: {
              files: {
                privateLinks: true
              },
              files_sharing: {
                public: {
                  enabled: true,
                  expire_date: {
                    enabled: false,
                    enforced: false
                  },
                  password: {
                    enforced_for: {
                      read_only: '0',
                      upload_only: '0',
                      read_write: '0'
                    }
                  }
                }
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
            highlightedFile: () => getTestFolder(),
            currentFileOutgoingSharesLoading: () => false,
            sharesTreeLoading: () => false
          },
          actions: {
            ...StoreFiles.actions,
            loadSharesTree: jest.fn
          }
        }
      }
    },
    store
  )
}

function renderComponent({ store, mocks } = {}) {
  return render(
    FileLinks,
    {
      store: createStore(store),
      stubs: {
        'avatar-image': true
      },
      provide: {
        displayedItem: {
          value: getTestFolder()
        }
      },
      routes,
      mocks
    },
    (vue, store, router) => {
      router.push(createLocationSpaces())
    }
  )
}
