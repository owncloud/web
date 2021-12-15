import '@testing-library/jest-dom'
import { render, fireEvent, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import merge from 'lodash-es/merge'

import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
import routes from '@files/src/routes'
import { getDateInFuture, navigateToDate } from '../helpers/date'
// eslint-disable-next-line jest/no-mocks-import
import sdkMock from '@/__mocks__/sdk'

import FileShares from '@files/src/components/SideBar/Shares/FileShares.vue'

const existingShares = [
  {
    shareInfo: {
      id: '1',
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

const existingSharesWithoutExpiration = [
  {
    shareInfo: {
      ...existingShares[0].shareInfo,
      expiration: null
    }
  }
]

const testIds = {
  inviteForm: 'new-collaborators-form',
  inviteFormCreateBtn: 'new-collaborators-form-create-button',
  autocompleteItemBob: 'recipient-autocomplete-item-bob',
  selectItemBob: 'recipient-container-bob',
  listItem: {
    container: 'collaborator-item-bob',
    expiration: 'recipient-info-expiration-date',
    editBtn: 'collaborator-edit',
    setExpirationBtn: 'collaborator-set-expiration-btn',
    removeExpirationBtn: 'collaborator-remove-expiration-btn'
  },
  datepicker: 'recipient-datepicker',
  datepickerBtn: 'recipient-datepicker-btn'
}

describe('Users can set expiration date when sharing with users or groups', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    window.sessionStorage.clear()
  })
  describe('new shares', () => {
    test('user can select an expiration date', async () => {
      const component = renderComponent()
      const { findByTestId, baseElement, getByTestId, findByText } = component

      // search for `bob` in invite form
      expect(await findByTestId(testIds.inviteForm)).toBeVisible()
      await fireEvent.update(baseElement.querySelector('#files-share-invite-input'), 'bob')
      await waitFor(() => expect(baseElement.querySelector('#vs1__listbox')).toBeVisible())

      // select user `bob` in autocomplete
      const userInAutocomplete = await findByTestId(testIds.autocompleteItemBob)
      expect(userInAutocomplete).toBeVisible()
      userEvent.click(userInAutocomplete)
      expect(await findByTestId(testIds.selectItemBob)).toBeVisible()

      // trigger date picker
      expect(getByTestId(testIds.datepicker)).toBeVisible()
      await fireEvent.click(getByTestId(testIds.datepickerBtn))

      // select an expiration date
      const newDate = getDateInFuture(2)
      await navigateToDate(newDate, component)
      expect(await findByText('Expires in 2 days')).toBeVisible()

      // create the invite
      const shareBtn = getByTestId(testIds.inviteFormCreateBtn)
      expect(shareBtn).toBeVisible()
      expect(shareBtn).not.toBeDisabled()
      await fireEvent.click(shareBtn)
      await waitFor(() => {
        return expect(baseElement.querySelector('#files-share-invite-input').text()).toBeEmpty()
      })

      // validate the expiration date in newly created share
      expect(await findByTestId(testIds.listItem.container)).toBeVisible()
      expect(
        within(getByTestId(testIds.listItem.expiration)).getByText('Expires in 2 days')
      ).toBeVisible()
    })

    test('default expiration gets applied', async () => {
      const { findByTestId, getByTestId, baseElement, findByText } = renderComponent({
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

      // search for `bob` in invite form
      expect(await findByTestId(testIds.inviteForm)).toBeVisible()
      await fireEvent.update(baseElement.querySelector('#files-share-invite-input'), 'bob')
      await waitFor(() => expect(baseElement.querySelector('#vs1__listbox')).toBeVisible())

      // select user `bob` in autocomplete
      const userInAutocomplete = await findByTestId(testIds.autocompleteItemBob)
      expect(userInAutocomplete).toBeVisible()
      userEvent.click(userInAutocomplete)
      expect(await findByTestId(testIds.selectItemBob)).toBeVisible()

      // validate that default expiration gets preselected
      expect(await findByText('Expires in 4 days')).toBeVisible()

      // create the invite
      const shareBtn = getByTestId(testIds.inviteFormCreateBtn)
      expect(shareBtn).toBeVisible()
      expect(shareBtn).not.toBeDisabled()
      await fireEvent.click(shareBtn)
      await waitFor(() => {
        return expect(baseElement.querySelector('#files-share-invite-input').text()).toBeEmpty()
      })

      // validate the expiration date in newly created share
      expect(await findByTestId(testIds.listItem.container)).toBeVisible()
      expect(
        within(getByTestId(testIds.listItem.expiration)).getByText('Expires in 4 days')
      ).toBeVisible()
    })

    test('user can select expiration date within enforced maximum date', async () => {
      const component = renderComponent({
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
      const { findByTestId, baseElement, getByTestId, findByText } = component

      // search for `bob` in invite form
      expect(await findByTestId(testIds.inviteForm)).toBeVisible()
      await fireEvent.update(baseElement.querySelector('#files-share-invite-input'), 'bob')
      await waitFor(() => expect(baseElement.querySelector('#vs1__listbox')).toBeVisible())

      // select user `bob` in autocomplete
      const userInAutocomplete = await findByTestId(testIds.autocompleteItemBob)
      expect(userInAutocomplete).toBeVisible()
      await userEvent.click(userInAutocomplete)
      expect(await findByTestId(testIds.selectItemBob)).toBeVisible()

      // trigger date picker
      expect(getByTestId(testIds.datepicker)).toBeVisible()
      await fireEvent.click(getByTestId(testIds.datepickerBtn))

      // select an expiration date
      const newDate = getDateInFuture(2)
      await navigateToDate(newDate, component, 'left') // Since the calendar defaults to the enforced date we need to move left
      expect(await findByText('Expires in 2 days')).toBeVisible()

      // create the invite
      const shareBtn = getByTestId(testIds.inviteFormCreateBtn)
      expect(shareBtn).toBeVisible()
      expect(shareBtn).not.toBeDisabled()
      await fireEvent.click(shareBtn)
      await waitFor(() => {
        return expect(baseElement.querySelector('#files-share-invite-input').text()).toBeEmpty()
      })

      // validate the expiration date in newly created share
      expect(await findByTestId(testIds.listItem.container)).toBeVisible()
      expect(
        within(getByTestId(testIds.listItem.expiration)).getByText('Expires in 2 days')
      ).toBeVisible()
    })
  })

  describe('existing shares', () => {
    test.each([
      [
        'without',
        {
          shares: existingSharesWithoutExpiration
        }
      ],
      [
        'with',
        {
          shares: existingShares
        }
      ]
    ])(
      'user can select an expiration date on a share %s pre-existing expiration',
      async (name, { shares }) => {
        const component = renderComponent({
          mocks: {
            $client: {
              ...sdkMock,
              shares: {
                ...sdkMock.shares,
                getShares: jest.fn().mockImplementation(() => Promise.resolve(shares))
              }
            }
          }
        })
        const { findByTestId, getByTestId } = component

        // validate pre-test expiration state
        const recipientBob = await findByTestId(testIds.listItem.container)
        expect(recipientBob).toBeVisible()
        expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()

        // click edit dropdown
        const editRecipientBtn = await within(recipientBob).getByTestId(testIds.listItem.editBtn)
        expect(editRecipientBtn).toBeVisible()
        await fireEvent.click(editRecipientBtn)

        // trigger date picker
        const editExpirationBtn = await within(recipientBob).findByTestId(
          testIds.listItem.setExpirationBtn
        )
        expect(editExpirationBtn).toBeVisible()
        await fireEvent.click(editExpirationBtn)

        // select an expiration date
        const newDate = getDateInFuture(4)
        await navigateToDate(newDate, component)

        // validate the expiration date after editing
        expect(await findByTestId(testIds.listItem.container)).toBeVisible()
        expect(
          within(getByTestId(testIds.listItem.expiration)).getByText('Expires in 4 days')
        ).toBeVisible()
      }
    )

    test('user can remove a pre-existing expiration date', async () => {
      const { findByTestId } = renderComponent({
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

      // validate pre-test expiration state
      const recipientBob = await findByTestId(testIds.listItem.container)
      expect(recipientBob).toBeVisible()
      expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()

      // click edit dropdown
      const editRecipientBtn = await within(recipientBob).getByTestId(testIds.listItem.editBtn)
      expect(editRecipientBtn).toBeVisible()
      await fireEvent.click(editRecipientBtn)

      // trigger expiration removal
      const removeExpirationBtn = await within(recipientBob).findByTestId(
        testIds.listItem.removeExpirationBtn
      )
      expect(removeExpirationBtn).toBeVisible()
      await fireEvent.click(removeExpirationBtn)

      // validate the missing expiration date after editing
      expect(within(recipientBob).getByTestId(testIds.listItem.expiration)).toBe(null)
    })

    test('user can edit expiration date within enforced maximum date', async () => {
      const component = renderComponent({
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
      const { findByTestId, getByTestId } = component

      // validate pre-test expiration state
      const recipientBob = await findByTestId(testIds.listItem.container)
      expect(recipientBob).toBeVisible()
      expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()

      // click edit dropdown
      const editRecipientBtn = await within(recipientBob).getByTestId(testIds.listItem.editBtn)
      expect(editRecipientBtn).toBeVisible()
      await fireEvent.click(editRecipientBtn)

      // trigger date picker
      const editExpirationBtn = await within(recipientBob).findByTestId(
        testIds.listItem.setExpirationBtn
      )
      expect(editExpirationBtn).toBeVisible()
      await fireEvent.click(editExpirationBtn)

      // select an expiration date
      const newDate = getDateInFuture(4)
      await navigateToDate(newDate, component)

      // validate the expiration date after editing
      expect(await findByTestId(testIds.listItem.container)).toBeVisible()
      expect(
        within(getByTestId(testIds.listItem.expiration)).getByText('Expires in 4 days')
      ).toBeVisible()
    })

    test('new enforced default expiration date does not change existing expiration date', async () => {
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

      // validate pre-test expiration state is untouched
      const recipientBob = await findByTestId(testIds.listItem.container)
      expect(recipientBob).toBeVisible()
      expect(within(recipientBob).getByText('Expires in 2 days')).toBeVisible()
    })
  })

  // https://github.com/owncloud/web/issues/3174
  test.todo('enforced expiration date for groups does not affect user shares')
  test.todo('enforced expiration date for users does not affect group shares')
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
              isFolder: true,
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
