import { Settings } from 'luxon'
import EditDropdown from 'web-app-files/src/components/SideBar/Shares/Collaborators/EditDropdown.vue'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { defaultComponentMocks } from 'web-test-helpers/src/mocks/defaultComponentMocks'
import { mock } from 'jest-mock-extended'
import { createStore, defaultPlugins, mount } from 'web-test-helpers'

const selectors = {
  actionMenuItem: '.action-menu-item',
  showDetailsBtn: '.show-access-details',
  removeShareBtn: '.remove-share',
  findCollaboratorsExpirationBtn: '.files-collaborators-expiration-button',
  removeExpirationDateBtn: '.remove-expiration-date',
  datepickerStub: 'oc-datepicker-stub'
}

describe('EditDropdown', () => {
  beforeEach(() => {
    Settings.defaultZone = 'utc'
  })
  describe('default actions', () => {
    it('render "remove share" and "access details" as default', () => {
      const { wrapper } = createWrapper()
      expect(wrapper.findAll(selectors.actionMenuItem).length).toBe(2)
      expect(wrapper).toMatchSnapshot()
    })
    it('call the "showAccessDetails"-action on click', async () => {
      const { wrapper } = createWrapper()
      const emitSpy = jest.spyOn(wrapper.vm, '$emit')
      await wrapper.findAll(selectors.showDetailsBtn).trigger('click')
      expect(emitSpy).toHaveBeenCalledWith('showAccessDetails')
    })
    it('call the "removeShare"-action on click', async () => {
      const { wrapper } = createWrapper()
      const emitSpy = jest.spyOn(wrapper.vm, '$emit')
      await wrapper.findAll(selectors.removeShareBtn).trigger('click')
      expect(emitSpy).toHaveBeenCalledWith('removeShare')
    })
  })
  describe('expiration date', () => {
    describe('set-expiration button', () => {
      it.each(['user', 'group'])('renders the button', (shareType) => {
        const { wrapper } = createWrapper({ props: { shareCategory: shareType } })
        expect(wrapper.find(selectors.findCollaboratorsExpirationBtn).exists()).toBeTruthy()
      })
    })
    describe('remove-expiration button', () => {
      it('renders the button', () => {
        const { wrapper } = createWrapper({
          props: { shareCategory: 'user', expirationDate: new Date() }
        })
        expect(wrapper.find(selectors.removeExpirationDateBtn).exists()).toBeTruthy()
      })
      it('calls the "removeExpirationDate"-action on click', async () => {
        const { wrapper } = createWrapper({
          props: { shareCategory: 'user', expirationDate: new Date() }
        })
        const emitSpy = jest.spyOn(wrapper.vm, '$emit')
        wrapper.vm.$refs.expirationDateDrop = mock<Element>()
        wrapper.find(selectors.removeExpirationDateBtn).trigger('click')
        expect(emitSpy).toHaveBeenCalledWith('expirationDateChanged', { expirationDate: null })
      })
    })
    describe('max expiration date', () => {
      it.each(['user', 'group'])(
        'gets passed correctly to the datepicker component',
        (shareType) => {
          const { wrapper } = createWrapper({
            stubs: { 'oc-datepicker': true },
            props: { shareCategory: shareType, expirationDate: new Date() },
            expirationDateEnforced: true
          })
          expect(wrapper.find(selectors.datepickerStub).attributes()['max-date']).toBeDefined()
        }
      )
      it.each(['user', 'group'])(
        'does not get passed to the datepicker component when expire date is disabled globally',
        (shareType) => {
          const { wrapper } = createWrapper({
            stubs: { 'oc-datepicker': true },
            props: { shareCategory: shareType, expirationDate: new Date() },
            expirationDateEnforced: true,
            expireDateEnabled: false
          })
          expect(wrapper.find(selectors.datepickerStub).attributes()['max-date']).toBeUndefined()
        }
      )
    })
  })
})

function createWrapper({
  stubs = {},
  props = {},
  expirationDateEnforced = false,
  expireDateEnabled = true
} = {}) {
  const storeOptions = defaultStoreMockOptions
  storeOptions.getters.capabilities.mockImplementation(() => ({
    files_sharing: {
      user: {
        expire_date: { enabled: expireDateEnabled, enforced: expirationDateEnforced, days: 7 }
      },
      group: {
        expire_date: { enabled: expireDateEnabled, enforced: expirationDateEnforced, days: 7 }
      }
    }
  }))
  const store = createStore(storeOptions)
  return {
    wrapper: mount(EditDropdown, {
      props: { canEditOrDelete: true, ...props },
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultComponentMocks(),
        stubs: { ...stubs }
      }
    })
  }
}
