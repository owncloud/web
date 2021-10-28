import '@testing-library/jest-dom'
import { render, fireEvent, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import merge from 'lodash-es/merge'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
import routes from '@files/src/routes'
import { getDateInFuture } from '../helpers/date'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'

import FileShares from '@files/src/components/SideBar/Shares/FileShares.vue'

const formatDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

const existingShares = [
  {
    shareInfo: {
      id: 1,
      share_type: 0,
      uid_owner: 'alice',
      displayname_owner: 'alice',
      permissions: 16,
      stime: new Date().getTime(),
      expiration: getDateInFuture(2).toISOString(),
      uid_file_owner: 'alice',
      displayname_file_owner: 'alice',
      path: '/Documents',
      item_type: 'folder',
      item_source: 10,
      file_source: 10,
      file_parent: 6,
      file_target: '/Documents',
      share_with: 'bob',
      share_with_displayname: 'bob'
    }
  }
]

describe('Users can set expiration date when sharing with users or groups', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    window.sessionStorage.clear()
  })
  test('user can set a new expiration date', async () => {
    const { findByTestId, baseElement, getByTestId, findByText, queryByTestId } = renderComponent()
    const addBtn = await findByTestId('file-shares-add-btn')
    expect(addBtn).toBeVisible()
    await fireEvent.click(addBtn)
    expect(await findByTestId('new-collaborator')).toBeVisible()
    await fireEvent.update(baseElement.querySelector('#files-share-invite-input'), 'bob')
    await waitFor(() => expect(baseElement.querySelector('#vs1__listbox')).toBeVisible())

    const userInAutocomplete = await findByTestId('recipient-autocomplete-item-bob')
    expect(userInAutocomplete).toBeVisible()
    userEvent.click(userInAutocomplete)
    expect(await findByTestId('recipient-container-bob')).toBeVisible()
    expect(getByTestId('recipient-datepicker')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-datepicker-btn'))

    const newDate = getDateInFuture(2)
    const dateSelector = document.evaluate(
      `//span[contains(@class, "vc-day-content vc-focusable") and not(contains(@class, "is-disabled")) and text()="${newDate.getDate()}"]`,
      baseElement,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue

    if (!dateSelector) {
      const nextMonthBtn = baseElement.querySelector('.vc-arrow.is-right')

      userEvent.click(nextMonthBtn)
    }

    expect(
      await findByText(newDate.toLocaleString('en', { month: 'long', year: 'numeric' }))
    ).toBeVisible()
    userEvent.click(dateSelector)
    expect(await findByText('Expires in 2 days')).toBeVisible()

    const shareBtn = getByTestId('new-collaborator-share-btn')
    expect(shareBtn).toBeVisible()
    await fireEvent.click(shareBtn)
    await waitFor(() => {
      return expect(queryByTestId('new-collaborator')).toBe(null)
    })

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)
    expect(await findByTestId('collaborator-item-bob')).toBeVisible()
    expect(
      within(getByTestId('recipient-info-expiration-date')).getByText('Expires in 2 days')
    ).toBeVisible()
  })

  test('user can edit an existing expiration date', async () => {
    const { findByTestId, baseElement, getByTestId, findByText, queryByTestId } = renderComponent({
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

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)

    const recipientBob = await findByTestId('collaborator-item-bob')

    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()

    const editBtn = getByTestId('recipient-bob-btn-edit')
    expect(editBtn).toBeVisible()
    await fireEvent.click(editBtn)

    const editDialog = await findByTestId('recipient-dialog-edit')

    expect(editDialog).toBeVisible()
    expect(getByTestId('recipient-datepicker')).toBeVisible()
    expect(within(getByTestId('recipient-datepicker')).getByText('Expires in 2 days')).toBeVisible()

    await fireEvent.click(getByTestId('recipient-datepicker-btn'))

    const newDate = getDateInFuture(4)
    let dateSelector = document.evaluate(
      `//span[contains(@class, "vc-day-content vc-focusable") and @tabindex="-1" and @aria-label="${newDate.toLocaleDateString(
        'en',
        formatDate
      )}" and text()="${newDate.getDate()}"]`,
      baseElement,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue

    if (!dateSelector) {
      const nextMonthBtn = baseElement.querySelector('.vc-arrow.is-right')

      await userEvent.click(nextMonthBtn)
      dateSelector = document.evaluate(
        `//span[contains(@class, "vc-day-content vc-focusable") and @tabindex="-1" and @aria-label="${newDate.toLocaleDateString(
          'en',
          formatDate
        )}" and text()="${newDate.getDate()}"]`,
        baseElement,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue
    }

    expect(
      await findByText(newDate.toLocaleString('en', { month: 'long', year: 'numeric' }))
    ).toBeVisible()
    await userEvent.click(dateSelector)
    expect(await within(editDialog).findByText('Expires in 4 days')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-edit-btn-save'))
    await waitFor(() => expect(queryByTestId('recipient-dialog-edit')).toBe(null))
    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 4 days')).toBeVisible()
  })

  test('user can remove an existing expiration date', async () => {
    const { findByTestId, getByTestId, queryByTestId } = renderComponent({
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

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)

    const recipientBob = await findByTestId('collaborator-item-bob')

    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()

    const editBtn = getByTestId('recipient-bob-btn-edit')
    expect(editBtn).toBeVisible()
    await fireEvent.click(editBtn)

    const editDialog = await findByTestId('recipient-dialog-edit')
    const removeExpirationBtn = getByTestId('recipient-edit-expiration-btn-remove')

    expect(editDialog).toBeVisible()
    expect(removeExpirationBtn).toBeVisible()
    await fireEvent.click(removeExpirationBtn)
    expect(await within(editDialog).findByText('Set expiration date')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-edit-btn-save'))
    await waitFor(() => expect(queryByTestId('recipient-dialog-edit')).toBe(null))
    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).queryByTestId('recipient-info-expiration-date')).toBe(null)
  })

  test('default expiration is set on new shares', async () => {
    const { findByTestId, getByTestId, queryByTestId, baseElement, findByText } = renderComponent({
      store: {
        modules: {
          user: {
            state: {
              capabilities: {
                files_sharing: {
                  user: {
                    expire_date: {
                      enabled: true,
                      enforced: false,
                      days: '4'
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const addBtn = await findByTestId('file-shares-add-btn')

    expect(addBtn).toBeVisible()
    await fireEvent.click(addBtn)
    expect(await findByTestId('new-collaborator')).toBeVisible()
    await fireEvent.update(baseElement.querySelector('#files-share-invite-input'), 'bob')

    const userInAutocomplete = await findByTestId('recipient-autocomplete-item-bob')
    expect(userInAutocomplete).toBeVisible()
    userEvent.click(userInAutocomplete)
    expect(await findByTestId('recipient-container-bob')).toBeVisible()
    expect(await findByText('Expires in 4 days')).toBeVisible()

    const shareBtn = getByTestId('new-collaborator-share-btn')
    expect(shareBtn).toBeVisible()
    await fireEvent.click(shareBtn)
    await waitFor(() => {
      return expect(queryByTestId('new-collaborator')).toBe(null)
    })

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)
    expect(await findByTestId('collaborator-item-bob')).toBeVisible()
    expect(
      within(getByTestId('recipient-info-expiration-date')).getByText('Expires in 4 days')
    ).toBeVisible()
  })

  test('user can set expiration date within enforced maximum date', async () => {
    const { findByTestId, baseElement, getByTestId, findByText, queryByTestId } = renderComponent({
      store: {
        modules: {
          user: {
            state: {
              capabilities: {
                files_sharing: {
                  user: {
                    expire_date: {
                      enabled: true,
                      enforced: true,
                      days: '4'
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const addBtn = await findByTestId('file-shares-add-btn')

    expect(addBtn).toBeVisible()
    await fireEvent.click(addBtn)
    expect(await findByTestId('new-collaborator')).toBeVisible()
    await fireEvent.update(baseElement.querySelector('#files-share-invite-input'), 'bob')

    const userInAutocomplete = await findByTestId('recipient-autocomplete-item-bob')
    expect(userInAutocomplete).toBeVisible()
    await userEvent.click(userInAutocomplete)
    expect(await findByTestId('recipient-container-bob')).toBeVisible()
    expect(getByTestId('recipient-datepicker')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-datepicker-btn'))

    const newDate = getDateInFuture(2)
    let dateSelector = document.evaluate(
      `//span[contains(@class, "vc-day-content vc-focusable") and @tabindex="-1" and not(contains(@class, "is-disabled")) and text()="${newDate.getDate()}"]`,
      baseElement,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue

    if (!dateSelector) {
      const nextMonthBtn = baseElement.querySelector('.vc-arrow.is-left') // the date is less than default expiration date so needs to go back
      await userEvent.click(nextMonthBtn)

      dateSelector = document.evaluate(
        `//span[contains(@class, "vc-day-content vc-focusable") and not(contains(@class, "is-disabled")) and text()="${newDate.getDate()}"]`,
        baseElement,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue
    }

    expect(
      await findByText(newDate.toLocaleString('en', { month: 'long', year: 'numeric' }))
    ).toBeVisible()
    await userEvent.click(dateSelector)
    expect(await findByText('Expires in 2 days')).toBeVisible()

    const shareBtn = getByTestId('new-collaborator-share-btn')
    expect(shareBtn).toBeVisible()
    await fireEvent.click(shareBtn)
    await waitFor(() => {
      return expect(queryByTestId('new-collaborator')).toBe(null)
    })

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)
    expect(await findByTestId('collaborator-item-bob')).toBeVisible()
    expect(
      within(getByTestId('recipient-info-expiration-date')).getByText('Expires in 2 days')
    ).toBeVisible()
  })

  test('user can edit expiration date within enforced maximum date', async () => {
    const { findByTestId, baseElement, getByTestId, findByText, queryByTestId } = renderComponent({
      store: {
        modules: {
          user: {
            state: {
              capabilities: {
                files_sharing: {
                  user: {
                    expire_date: {
                      enabled: true,
                      enforced: true,
                      days: '6'
                    }
                  }
                }
              }
            }
          }
        }
      },
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
    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)

    const recipientBob = await findByTestId('collaborator-item-bob')

    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()

    const editBtn = getByTestId('recipient-bob-btn-edit')
    expect(editBtn).toBeVisible()
    await fireEvent.click(editBtn)

    const editDialog = await findByTestId('recipient-dialog-edit')

    expect(editDialog).toBeVisible()
    expect(getByTestId('recipient-datepicker')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-datepicker-btn'))

    const newDate = getDateInFuture(4)
    let dateSelector = document.evaluate(
      `//span[contains(@class, "vc-day-content vc-focusable") and @tabindex="-1" and @aria-label="${newDate.toLocaleDateString(
        'en',
        formatDate
      )}" and text()="${newDate.getDate()}"]`,
      baseElement,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue

    if (!dateSelector) {
      const nextMonthBtn = baseElement.querySelector('.vc-arrow.is-right')

      await userEvent.click(nextMonthBtn)
      dateSelector = document.evaluate(
        `//span[contains(@class, "vc-day-content vc-focusable") and @tabindex="-1" and @aria-label="${newDate.toLocaleDateString(
          'en',
          formatDate
        )}" and text()="${newDate.getDate()}"]`,
        baseElement,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue
    }

    expect(
      await findByText(newDate.toLocaleString('en', { month: 'long', year: 'numeric' }))
    ).toBeVisible()
    await userEvent.click(dateSelector)
    expect(await within(editDialog).findByText('Expires in 4 days')).toBeVisible()
    await fireEvent.click(getByTestId('recipient-edit-btn-save'))
    await waitFor(() => expect(queryByTestId('recipient-dialog-edit')).toBe(null))
    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 4 days')).toBeVisible()
  })

  // https://github.com/owncloud/web/issues/3174
  test.todo('enforced expiration date for groups does not affect user shares')
  test.todo('enforced expiration date for users does not affect group shares')

  test('new enforced default expiration date does not change expiration date of previously created share', async () => {
    const { findByTestId } = renderComponent({
      store: {
        modules: {
          user: {
            state: {
              capabilities: {
                files_sharing: {
                  user: {
                    expire_date: {
                      enabled: true,
                      enforced: true,
                      days: '6'
                    }
                  }
                }
              }
            }
          }
        }
      },
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

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)

    const recipientBob = await findByTestId('collaborator-item-bob')

    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()
  })

  test('new enforced default expiration date does not change expiration date of previously created share which is beyond the new maximum enforced date', async () => {
    const { findByTestId } = renderComponent({
      store: {
        modules: {
          user: {
            state: {
              capabilities: {
                files_sharing: {
                  user: {
                    expire_date: {
                      enabled: true,
                      enforced: true,
                      days: '1'
                    }
                  }
                }
              }
            }
          }
        }
      },
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

    const showPeopleBtn = await findByTestId('collaborators-show-people')
    expect(showPeopleBtn).toBeVisible()
    await fireEvent.click(showPeopleBtn)

    const recipientBob = await findByTestId('collaborator-item-bob')

    expect(recipientBob).toBeVisible()
    expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()
  })
})

function createStore(store) {
  return merge(
    {},
    Store,
    {
      modules: {
        user: {
          state: {
            id: 'alice',
            capabilities: {
              files_sharing: {
                search_min_length: 2,
                group: { expire_date: { enabled: false } },
                user: {
                  send_mail: false,
                  profile_picture: true,
                  expire_date: { enabled: false }
                }
              }
            }
          }
        },
        Files: merge({}, StoreFiles, {
          state: {
            incomingSharesLoading: false
          },
          getters: {
            highlightedFile: () => ({
              type: 'folder',
              path: '/documents',
              canShare: () => true
            }),
            currentFileOutgoingSharesLoading: () => false,
            sharesTreeLoading: () => false
          },
          actions: {
            loadSharesTree: jest.fn
          }
        })
      }
    },
    store
  )
}

function renderComponent({ store, mocks } = {}) {
  return render(
    FileShares,
    {
      store: createStore(store),
      stubs: {
        'avatar-image': true
      },
      routes,
      mocks
    },
    (vue, store, router) => {
      router.push({ name: 'personal' })
    }
  )
}
