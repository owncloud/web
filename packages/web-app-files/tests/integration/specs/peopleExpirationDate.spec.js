import '@testing-library/jest-dom'
import { render, fireEvent, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import merge from 'lodash-es/merge'
import App from '@files/src/App.vue'
import StoreFiles from '@files/src/store'
import Store from '@runtime/src/store'
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
import { buildRoutes, createLocationSpaces } from '../../../src/router'
import { getDateInFuture, navigateToDate } from '../helpers/date'

// eslint-disable-next-line jest/no-mocks-import
// import sdkMock from '@/__mocks__/sdk'

import FileShares from '@files/src/components/SideBar/Shares/FileShares.vue'
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

// const existingShares = [
//   {
//     shareInfo: {
//       id: '1',
//       share_type: 0,
//       uid_owner: 'alice',
//       displayname_owner: 'alice',
//       permissions: 16,
//       stime: new Date().getTime(),
//       expiration: getDateInFuture(2).toISOString(),
//       uid_file_owner: 'alice',
//       displayname_file_owner: 'alice',
//       path: '/Documents',
//       item_type: 'folder',
//       item_source: 10,
//       file_source: 10,
//       file_parent: 6,
//       file_target: '/Documents',
//       share_with: 'bob',
//       share_with_displayname: 'bob'
//     }
//   }
// ]

// const existingSharesWithoutExpiration = [
//   {
//     shareInfo: {
//       ...existingShares[0].shareInfo,
//       expiration: null
//     }
//   }
// ]

const selectors = {
  inviteForm: {
    container: 'new-collaborators-form',
    createBtn: 'new-collaborators-form-create-button',
    input: '#files-share-invite-input'
  },
  autocomplete: {
    list: '#vs1__listbox',
    itemPrefix: 'recipient-autocomplete-item-'
  },
  selectedRecipient: {
    containerPrefix: 'recipient-container-'
  },
  listItem: {
    containerPrefix: 'collaborator-user-item-',
    expiration: 'recipient-info-expiration-date',
    editBtn: 'collaborator-edit',
    removeExpirationBtn: 'collaborator-remove-expiration-btn'
  },
  datepicker: {
    container: 'recipient-datepicker',
    triggerBtn: 'recipient-datepicker-btn'
  }
}

describe('Users can set expiration date when sharing with users or groups', () => {
  afterEach(() => {
    jest.resetModules()
    jest.restoreAllMocks()
    window.sessionStorage.clear()
  })
  describe('new shares', () => {
    test('user can select an expiration date', async () => {
      const user = 'bob'
      const days = 2
      const component = renderComponent()

      await searchUser(user, component)
      await selectUser(user, component)
      await triggerDatePicker(component)
      const newDate = getDateInFuture(days)
      await navigateToDate(newDate, component)
      await validateInviteExpiration(days, component)
      await submitInvite(component)
      await validateExpiration(user, days, component)
    })

    // test('default expiration gets applied', async () => {
    //   const user = 'bob'
    //   const enforcedDays = 4
    //   const component = renderComponent({
    //     store: {
    //       modules: {
    //         user: {
    //           state: {
    //             capabilities: {
    //               files_sharing: {
    //                 user: {
    //                   expire_date: {
    //                     enabled: true,
    //                     enforced: false,
    //                     days: enforcedDays.toString()
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   })

    //   await searchUser(user, component)
    //   await selectUser(user, component)
    //   await validateInviteExpiration(enforcedDays, component)
    //   await submitInvite(component)
    //   await validateExpiration(user, enforcedDays, component)
    // })

    // test('user can select expiration date within enforced maximum date', async () => {
    //   const user = 'bob'
    //   const days = 2
    //   const component = renderComponent({
    //     store: {
    //       modules: {
    //         user: {
    //           state: {
    //             capabilities: {
    //               files_sharing: {
    //                 user: {
    //                   expire_date: {
    //                     enabled: true,
    //                     enforced: true,
    //                     days: '4'
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   })

    //   await searchUser(user, component)
    //   await selectUser(user, component)
    //   await triggerDatePicker(component)
    //   const newDate = getDateInFuture(days)
    //   await navigateToDate(newDate, component, 'left') // Since the calendar defaults to the enforced date we need to move left
    //   await submitInvite(component)
    //   await validateExpiration(user, days, component)
    // })
  })

  // describe('existing shares', () => {
  //   test.each([
  //     [
  //       'without',
  //       {
  //         shares: existingSharesWithoutExpiration
  //       }
  //     ],
  //     [
  //       'with',
  //       {
  //         shares: existingShares
  //       }
  //     ]
  //   ])(
  //     'user can select an expiration date on a share %s pre-existing expiration',
  //     async (name, { shares }) => {
  //       const user = 'bob'
  //       const days = 4
  //       const component = renderComponent({
  //         mocks: {
  //           $client: {
  //             ...sdkMock,
  //             shares: {
  //               ...sdkMock.shares,
  //               getShares: jest.fn().mockImplementation(() => Promise.resolve(shares))
  //             }
  //           }
  //         }
  //       })

  //       await validateExpiration(user, 2, component)
  //       await showEditDropdown(user, component)
  //       await triggerDatePicker(component)
  //       const newDate = getDateInFuture(days)
  //       await navigateToDate(newDate, component)
  //       await validateExpiration(user, days, component)
  //     }
  //   )

  //   // test('user can remove a pre-existing expiration date', async () => {
  //   //   const user = 'bob'
  //   //   const component = renderComponent({
  //   //     mocks: {
  //   //       $client: {
  //   //         ...sdkMock,
  //   //         shares: {
  //   //           ...sdkMock.shares,
  //   //           getShares: jest.fn().mockImplementation(() => Promise.resolve(existingShares))
  //   //         }
  //   //       }
  //   //     }
  //   //   })

  //   //   await validateExpiration(user, 2, component)
  //   //   await showEditDropdown(user, component)
  //   //   await removeExpiration(user, component)
  //   //   const listItem = await getListItem(user, component)
  //   //   expect(within(listItem).getByTestId(selectors.listItem.expiration)).toBe(null)
  //   // })

  //   // test('user can edit expiration date within enforced maximum date', async () => {
  //   //   const user = 'bob'
  //   //   const days = 4
  //   //   const component = renderComponent({
  //   //     store: {
  //   //       modules: {
  //   //         user: {
  //   //           state: {
  //   //             capabilities: {
  //   //               files_sharing: {
  //   //                 user: {
  //   //                   expire_date: {
  //   //                     enabled: true,
  //   //                     enforced: true,
  //   //                     days: '6'
  //   //                   }
  //   //                 }
  //   //               }
  //   //             }
  //   //           }
  //   //         }
  //   //       }
  //   //     },
  //   //     mocks: {
  //   //       $client: {
  //   //         ...sdkMock,
  //   //         shares: {
  //   //           ...sdkMock.shares,
  //   //           getShares: jest.fn().mockImplementation(() => Promise.resolve(existingShares))
  //   //         }
  //   //       }
  //   //     }
  //   //   })

  //   //   await validateExpiration(user, 2, component)
  //   //   await showEditDropdown(user, component)
  //   //   await triggerDatePicker(component)
  //   //   const newDate = getDateInFuture(days)
  //   //   await navigateToDate(newDate, component)
  //   //   await validateExpiration(user, days, component)
  //   // })

  //   // test('new enforced default expiration date does not change existing expiration date', async () => {
  //   //   const user = 'bob'
  //   //   const days = 2
  //   //   const component = renderComponent({
  //   //     store: {
  //   //       modules: {
  //   //         user: {
  //   //           state: {
  //   //             capabilities: {
  //   //               files_sharing: {
  //   //                 user: {
  //   //                   expire_date: {
  //   //                     enabled: true,
  //   //                     enforced: true,
  //   //                     days: '1'
  //   //                   }
  //   //                 }
  //   //               }
  //   //             }
  //   //           }
  //   //         }
  //   //       }
  //   //     },
  //   //     mocks: {
  //   //       $client: {
  //   //         ...sdkMock,
  //   //         shares: {
  //   //           ...sdkMock.shares,
  //   //           getShares: jest.fn().mockImplementation(() => Promise.resolve(existingShares))
  //   //         }
  //   //       }
  //   //     }
  //   //   })

  //   //     await validateExpiration(user, days, component)
  //   //   })
  //   // })

  //   // https://github.com/owncloud/web/issues/3174
  //   test.todo('enforced expiration date for groups does not affect user shares')
  //   test.todo('enforced expiration date for users does not affect group shares')
  // })
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
      router.push(createLocationSpaces('files-spaces-personal-home'))
    }
  )
}

async function getListItem(user, component) {
  const { findByTestId } = component
  return await findByTestId(selectors.listItem.containerPrefix + user)
}

async function searchUser(user, component) {
  const { findByTestId, baseElement } = component
  expect(await findByTestId(selectors.inviteForm.container)).toBeVisible()
  await fireEvent.focus(baseElement.querySelector(selectors.inviteForm.input))
  await fireEvent.update(baseElement.querySelector(selectors.inviteForm.input), user)
  await waitFor(() => expect(baseElement.querySelector(selectors.autocomplete.list)).toBeVisible())
}

async function selectUser(user, component) {
  const { findByTestId } = component
  const userInAutocomplete = await findByTestId(selectors.autocomplete.itemPrefix + user)
  expect(userInAutocomplete).toBeVisible()
  userEvent.click(userInAutocomplete)
  expect(await findByTestId(selectors.selectedRecipient.containerPrefix + user)).toBeVisible()
}

// async function showEditDropdown(user, component) {
//   const listItem = await getListItem(user, component)
//   const editRecipientBtn = await within(listItem).getByTestId(selectors.listItem.editBtn)
//   expect(editRecipientBtn).toBeVisible()
//   await fireEvent.click(editRecipientBtn)
// }
//
// async function removeExpiration(user, component) {
//   const listItem = await getListItem(user, component)
//   const removeExpirationBtn = await within(listItem).findByTestId(
//     selectors.listItem.removeExpirationBtn
//   )
//   expect(removeExpirationBtn).toBeVisible()
//   await fireEvent.click(removeExpirationBtn)
// }

async function triggerDatePicker(component) {
  const { getByTestId } = component
  expect(getByTestId(selectors.datepicker.container)).toBeVisible()
  await fireEvent.click(getByTestId(selectors.datepicker.triggerBtn))
}

async function validateInviteExpiration(days, component) {
  const { findByTestId } = component
  const inviteForm = await findByTestId(selectors.inviteForm.container)
  expect(
    await within(inviteForm).findByText(days === 1 ? 'Expires in 1 day' : `Expires in ${days} days`)
  ).toBeVisible()
}

async function submitInvite(component) {
  const { getByTestId, baseElement } = component
  const shareBtn = getByTestId(selectors.inviteForm.createBtn)
  expect(shareBtn).toBeVisible()
  expect(shareBtn).not.toBeDisabled()
  await fireEvent.click(shareBtn)
  await waitFor(() => {
    return expect(baseElement.querySelector(selectors.inviteForm.input)).toBeEmpty()
  })
}

async function validateExpiration(user, days, component) {
  const listItem = await getListItem(user, component)
  expect(listItem).toBeVisible()
  expect(
    await within(listItem).findByText(days === 1 ? 'Expires in 1 day' : `Expires in ${days} days`)
  ).toBeVisible()
}
