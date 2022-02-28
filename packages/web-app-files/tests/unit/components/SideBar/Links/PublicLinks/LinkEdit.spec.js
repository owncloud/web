import Vuex from 'vuex'
import { DateTime } from 'luxon'
import VueSelect from 'vue-select'
import GetTextPlugin from 'vue-gettext'
import stubs from '@/tests/unit/stubs/index.js'
import DesignSystem from 'owncloud-design-system'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import LinkEdit from '@files/src/components/SideBar/Links/PublicLinks/LinkEdit.vue'
import { LinkShareRoles } from '../../../../../../src/helpers/share'

const selectors = {
  linkNameInput: '#oc-files-file-link-name',
  linkErrorAlert: '.oc-files-file-link-error-alert',
  linkExpireDatePicker: '#oc-files-file-link-expire-date',
  linkExpireDateDeleteButton: '#oc-files-file-link-expire-date-delete',
  linkPasswordField: '#oc-files-file-link-password',
  linkPasswordDeleteButton: '#oc-files-file-link-password-delete',
  linkCancelButton: '#oc-files-file-link-cancel',
  linkCreateButton: '#oc-files-file-link-create',
  linkSaveButton: '#oc-files-file-link-save',
  linkSavingButton: '#oc-files-file-link-saving'
}

const ocSpinnerStubSelector = 'oc-spinner-stub'

const localVue = createLocalVue()
localVue.use(DesignSystem)
localVue.use(VueSelect)
localVue.use(Vuex)
localVue.use(GetTextPlugin, {
  translations: 'does-not-matter.json',
  silent: true
})

const mapActions = {
  addLink: jest.fn(),
  updateLink: jest.fn()
}

describe('LinkEdit', () => {
  beforeEach(() => {
    jest.useFakeTimers('modern')
    jest.setSystemTime(new Date(2020, 3, 1))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('expiration date picker field', () => {
    describe('required field label', () => {})
    describe('when the link expiration date is enforced', () => {
      it('should have max-datetime attribute with tomorrow datetime value', () => {
        const wrapper = getShallowMountedWrapper(
          createStore({
            publicLinkCapabilities: getLinkCapabilities({
              enforcedExpireDate: true,
              days: 2
            })
          })
        )
        const expirationDatePickerFieldElement = wrapper.find(selectors.linkExpireDatePicker)
        const expectedDate = new Date()
        expectedDate.setDate(new Date().getDate() + 2)

        expect(expirationDatePickerFieldElement.attributes()['max-date']).toEqual(
          expectedDate.toString()
        )
      })
    })

    it('should have min-datetime attribute with the value now', () => {
      const wrapper = getShallowMountedWrapper()
      const expirationDatePickerElement = wrapper.find('#oc-files-file-link-expire-date')
      const expectedDate = new Date()
      expect(expirationDatePickerElement.attributes()['min-date']).toEqual(expectedDate.toString())
    })

    it('should be pre populated if the public link has already an expiration date set', () => {
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() + 1)

      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: {
            id: 1,
            expireDate: expectedDate.toString()
          },
          publicLinkCapabilities: getLinkCapabilities({ enabledExpireDate: true })
        })
      )
      const expirationDatePickerFieldElement = wrapper.find(selectors.linkExpireDatePicker)

      expect(expirationDatePickerFieldElement.attributes().value).toEqual(expectedDate.toString())
    })
  })

  describe('expiration date delete button', () => {
    it('should be present if the expiration date is not enforced and the link has expiration date set', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: {
            expireDate: DateTime.now().plus({ days: 1 }).toString()
          }
        })
      )
      const expirationDateDeleteButtonElement = wrapper.find(selectors.linkExpireDateDeleteButton)

      expect(expirationDateDeleteButtonElement.exists()).toBeTruthy()
    })

    it('should set expire date to empty string if clicked', async () => {
      const expireDate = new Date()
      expireDate.setDate(new Date().getDate() + 1)

      const wrapper = getMountedWrapper(
        createStore({
          linkInEdit: {
            expireDate
          }
        })
      )
      const expirationDateDeleteButtonElement = wrapper.find(selectors.linkExpireDateDeleteButton)
      await expirationDateDeleteButtonElement.trigger('click')

      expect(wrapper.vm.expireDate).toEqual(null)
    })

    it('should not be present if expiration date is not enforced and the link in edit does not have an expiration date set', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: { expireDate: null },
          publicLinkCapabilities: getLinkCapabilities({
            days: null
          })
        })
      )
      const expirationDateDeleteButtonElement = wrapper.find(selectors.linkExpireDateDeleteButton)

      expect(expirationDateDeleteButtonElement.exists()).toBeFalsy()
    })

    it('should not be present if expiration date is enforced', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          publicLinkCapabilities: getLinkCapabilities({ enforcedExpireDate: true })
        })
      )
      const expirationDateDeleteButtonElement = wrapper.find(selectors.linkExpireDateDeleteButton)

      expect(expirationDateDeleteButtonElement.exists()).toBeFalsy()
    })
  })

  describe('role select field', () => {
    it.each(['folder', 'file'])(
      'should list all available link sharing roles according to resource type %s',
      (type) => {
        const wrapper = getMountedWrapper(createStore({ type }))
        const roleSelectElement = wrapper.findComponent(VueSelect)
        const actualOptions = roleSelectElement.props().options

        const linkShareRoles = LinkShareRoles.list(type === 'folder')
        expect(actualOptions.length).toBe(linkShareRoles.length)
        for (let i = 0; i < linkShareRoles.length; i++) {
          expect(actualOptions[i].name).toBe(linkShareRoles[i].name)
        }
      }
    )

    it('should not be clearable', () => {
      const wrapper = getMountedWrapper()
      const roleSelectElement = wrapper.findComponent(VueSelect)

      expect(roleSelectElement.props().clearable).toBeFalsy()
    })

    it('should set selected role when input is triggered', () => {
      const wrapper = getMountedWrapper(createStore({ type: 'folder' }))
      const roleSelectElement = wrapper.findComponent(VueSelect)

      const option = roleSelectElement.vm.options[2]
      roleSelectElement.vm.select(option)
      expect(wrapper.vm.selectedRole.name).toBe(option.name)
    })
  })

  describe('password field', () => {
    it('should have required label if password is enforced', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          publicLinkCapabilities: getLinkCapabilities({
            passwordEnforcedFor: {
              read_only: '1'
            }
          })
        })
      )
      const passwordFieldElement = wrapper.find(selectors.linkPasswordField)

      expect(passwordFieldElement).toMatchSnapshot()
    })

    it('should not have required label if password is not enforced', () => {
      const wrapper = getShallowMountedWrapper()
      const passwordFieldElement = wrapper.find(selectors.linkPasswordField)

      expect(passwordFieldElement).toMatchSnapshot()
    })
  })

  describe('link password delete button', () => {
    it('should be present if password is not enforced and the link has a password set', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: {
            hasPassword: true
          }
        })
      )
      const passwordDeleteButtonElement = wrapper.find(selectors.linkPasswordDeleteButton)

      expect(passwordDeleteButtonElement.exists()).toBeTruthy()
    })

    it('should not be present if password is not enforced', () => {
      const wrapper = getShallowMountedWrapper()
      const passwordDeleteButtonElement = wrapper.find(selectors.linkPasswordDeleteButton)

      expect(passwordDeleteButtonElement.exists()).toBeFalsy()
    })
    it('should not be present if the link does not has a password set', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: {
            hasPassword: false
          }
        })
      )
      const passwordDeleteButtonElement = wrapper.find(selectors.linkPasswordDeleteButton)

      expect(passwordDeleteButtonElement.exists()).toBeFalsy()
    })

    it('should be present if password is not enforced and password value is set', async () => {
      const wrapper = getMountedWrapper(
        createStore({
          linkInEdit: {}
        })
      )
      const linkPasswordInputElement = wrapper.find(selectors.linkPasswordField)
      await linkPasswordInputElement.setValue('VeryStrongPassword')

      const passwordDeleteButtonElement = wrapper.find(selectors.linkPasswordDeleteButton)

      expect(passwordDeleteButtonElement.exists()).toBeTruthy()
    })

    it('should remove password if clicked', async () => {
      const wrapper = getMountedWrapper(
        createStore({
          linkInEdit: {}
        })
      )
      const linkPasswordInputElement = wrapper.find(selectors.linkPasswordField)
      await linkPasswordInputElement.setValue('VeryStrongPassword')

      const passwordDeleteButtonElement = wrapper.find(selectors.linkPasswordDeleteButton)
      await passwordDeleteButtonElement.trigger('click')

      expect(wrapper.vm.password).toBe('')
      expect(wrapper.vm.hasPassword).toBeFalsy()
    })
  })

  describe('link edit form validation', () => {
    it('should disable the link save button if the expiration date value is not valid', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: {
            id: 1224,
            name: 'Public Link',
            hasPassword: true,
            // for an enforced expireDate, empty expireDate is an invalid value
            expireDate: ''
          },
          publicLinkCapabilities: getLinkCapabilities({ enforcedExpireDate: true })
        }),
        {
          saving: false
        }
      )

      expect(wrapper.find(selectors.linkSaveButton).attributes('disabled')).toBe('true')
    })

    it('should disable the link save button if the password field is invalid', () => {
      const wrapper = getShallowMountedWrapper(
        createStore({
          linkInEdit: { id: 1224, name: 'Public Link' },
          publicLinkCapabilities: getLinkCapabilities({
            passwordEnforcedFor: {
              read_only: '1'
            }
          })
        }),
        { saving: false }
      )

      expect(wrapper.find(selectors.linkSaveButton).attributes('disabled')).toBe('true')
    })

    it('should enable link save button if the expiration and password fields are valid', () => {
      const expireDate = new Date()
      expireDate.setDate(new Date().getDate() + 1)

      const wrapper = getMountedWrapper(
        createStore({
          linkInEdit: {
            id: 1224,
            name: 'Public Link',
            hasPassword: true,
            expireDate
          },
          publicLinkCapabilities: getLinkCapabilities({ enforcedExpireDate: true })
        }),
        {
          saving: false
        }
      )

      expect(wrapper.find(selectors.linkSaveButton).attributes('disabled')).toBeUndefined()
    })
  })

  describe('grid', () => {
    it('should disable the cancel link button if saving is set to true', () => {
      const wrapper = getShallowMountedWrapper(createStore(), { saving: true })

      const cancelLinkButtonElement = wrapper.find(selectors.linkCancelButton)

      expect(cancelLinkButtonElement.attributes('disabled')).toBe('true')
    })
    describe('saving button', () => {
      describe('when saving is set to true', () => {
        it('should show the text "Creating" if a new link is being created', () => {
          const wrapper = getShallowMountedWrapper(
            createStore({
              linkInEdit: { name: 'Public Link' }
            }),
            { saving: true }
          )
          const savingButtonElement = wrapper.find(selectors.linkSavingButton)

          expect(savingButtonElement.exists()).toBeTruthy()
          expect(savingButtonElement.text()).toBe('Creating')
          expect(savingButtonElement.find('oc-spinner-stub').attributes('arialabel')).toBe(
            'Creating Public Link'
          )
        })
        it('should show the text "Saving" during the update process', () => {
          const wrapper = getShallowMountedWrapper(
            createStore({
              linkInEdit: { id: 1223, name: 'Public Link' }
            }),
            { saving: true }
          )
          const savingButtonElement = wrapper.find(selectors.linkSavingButton)

          expect(savingButtonElement.exists()).toBeTruthy()
          expect(savingButtonElement.text()).toBe('Saving')
          expect(savingButtonElement.find(ocSpinnerStubSelector).attributes('arialabel')).toBe(
            'Saving Public Link'
          )
        })
      })
      describe('when saving is set to false', () => {
        describe('when new link is being created', () => {
          it('should show the link create button', () => {
            const wrapper = getShallowMountedWrapper(createStore(), { saving: false })
            const linkCreateButton = wrapper.find(selectors.linkCreateButton)
            expect(linkCreateButton.exists()).toBeTruthy()
            expect(linkCreateButton.attributes('disabled')).toBeFalsy()
          })
          it('should trigger "addLink" function if clicked', async () => {
            const addLinkSpy = jest.spyOn(mapActions, 'addLink')
            const wrapper = getMountedWrapper(
              createStore({
                linkInEdit: { name: 'Public Link', hasPassword: true },
                publicLinkCapabilities: getLinkCapabilities({ enforcedExpireDate: true })
              }),
              { saving: false }
            )
            const linkCreateButton = wrapper.find(selectors.linkCreateButton)
            expect(linkCreateButton.attributes('disabled')).toBeFalsy()

            await linkCreateButton.trigger('click')
            expect(wrapper.vm.saving).toBeTruthy()
            expect(addLinkSpy).toHaveBeenCalledTimes(1)
          })
        })
        describe('when existing link is being updated', () => {
          it('should show the link save button', () => {
            const wrapper = getShallowMountedWrapper(
              createStore({
                linkInEdit: { id: 1224, name: 'Public Link' }
              }),
              { saving: false }
            )

            const linkSaveButton = wrapper.find(selectors.linkSaveButton)
            expect(linkSaveButton.exists()).toBeTruthy()
          })
          it('should set the link save button as disabled if form is not valid', () => {
            const wrapper = getShallowMountedWrapper(
              createStore({
                linkInEdit: { id: 1224, name: 'Public Link' },
                // invalid password field
                // by default viewer role is selected with permission 1 (viewer)
                // combined with enforced for password is enforce for link form
                // since link password is enforced and password is not set, form will be invalid
                publicLinkCapabilities: getLinkCapabilities({
                  passwordEnforcedFor: {
                    read_only: '1'
                  }
                })
              }),
              { saving: false }
            )
            const linkSaveButton = wrapper.find(selectors.linkSaveButton)

            expect(linkSaveButton.attributes('disabled')).toBeTruthy()
          })
          it('should set the link save button as disabled if the form does not have any changes', () => {
            const wrapper = getShallowMountedWrapper(
              createStore({
                linkInEdit: { id: 1224, name: 'Public Link', hasPassword: false, permissions: 1 },
                publicLinkCapabilities: getLinkCapabilities({ enforcedExpireDate: true })
              }),
              { saving: false }
            )
            const linkSaveButton = wrapper.find(selectors.linkSaveButton)

            expect(linkSaveButton.attributes('disabled')).toBe('true')
          })

          describe('when the form is valid and has some changes', () => {
            const updateLinkSpy = jest.spyOn(mapActions, 'updateLink')

            it('should trigger "updateLink" method if clicked', async () => {
              const wrapper = getMountedWrapper(
                createStore({
                  linkInEdit: { id: 1224, name: 'Public Link', hasPassword: true }
                }),
                {
                  saving: false
                }
              )

              // make some changes in the form
              const nameInput = wrapper.find(selectors.linkNameInput)
              await nameInput.setValue('Link changed')
              const linkSaveButton = wrapper.find(selectors.linkSaveButton)

              expect(linkSaveButton.attributes('disabled')).toBeUndefined()
              expect(wrapper.vm.saving).toBeFalsy()
              expect(updateLinkSpy).not.toHaveBeenCalled()

              await linkSaveButton.trigger('click')

              expect(wrapper.vm.saving).toBeTruthy()
              expect(linkSaveButton.attributes('disabled')).toBe('disabled')
              expect(updateLinkSpy).toHaveBeenCalledTimes(1)
            })
          })
        })
      })
    })
  })
})

function createStore({
  linkInEdit = {},
  publicLinkCapabilities = getLinkCapabilities(),
  type = 'files'
} = {}) {
  return new Vuex.Store({
    modules: {
      Files: {
        namespaced: true,
        state: {
          publicLinkInEdit: linkInEdit
        },
        getters: {
          highlightedFile: function () {
            return { type: type, isFolder: type === 'folder' }
          }
        },
        actions: mapActions
      }
    },
    getters: {
      getToken: jest.fn(),
      capabilities: function () {
        return {
          files_sharing: {
            public: publicLinkCapabilities
          }
        }
      }
    }
  })
}

function getLinkCapabilities({
  enforcedExpireDate = false,
  days = 1,
  enabledExpireDate = false,
  passwordEnforcedFor = false
} = {}) {
  return {
    expire_date: {
      enabled: enabledExpireDate,
      days: days,
      enforced: enforcedExpireDate
    },
    password: {
      enforced_for: passwordEnforcedFor
    }
  }
}

function getShallowMountedWrapper(store = createStore(), data = {}) {
  const wrapper = shallowMount(LinkEdit, {
    ...mountOptions(data, store),
    stubs: {
      ...stubs,
      'oc-text-input': true,
      'oc-select': true,
      'oc-datepicker': true,
      'role-item': true,
      'oc-icon': true,
      'oc-progress': true
    }
  })
  wrapper.vm.$refs.nameInput.focus = jest.fn()
  return wrapper
}

function getMountedWrapper(store = createStore(), data = {}) {
  return mount(LinkEdit, {
    ...mountOptions(data, store),
    stubs: {
      'vue-select': VueSelect
    }
  })
}

const mountOptions = (data, store) => ({
  localVue,
  store,
  provide: {
    changeView: jest.fn()
  },
  directives: {
    translate: jest.fn()
  },
  data() {
    return data
  }
})
