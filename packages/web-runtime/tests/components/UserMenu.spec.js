import { shallowMount, createLocalVue, mount } from '@vue/test-utils'
import Vuex from 'vuex'
import { Store } from 'vuex-mock-store'
import UserMenu from 'web-runtime/src/components/UserMenu.vue'
import stubs from '../../../../tests/unit/stubs'
import DesignSystem from 'owncloud-design-system'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(DesignSystem)
jest.useFakeTimers()
stubs.translate = true

describe('User Menu component', () => {
  describe('when userId is set', () => {
    const wrapper = shallowMount(UserMenu, {
      localVue,
      stubs,
      propsData: {
        userId: 'einstein',
        userDisplayName: 'Albert Einstein'
      }
    })
    it('displays the avatar', () => {
      expect(wrapper.find('.oc-topbar-personal-avatar').exists()).toBeTruthy()
      expect(wrapper.find('.oc-topbar-personal-label').text()).toEqual('Albert Einstein')
    })
    it('displays the profile link', () => {
      expect(wrapper.find('#oc-topbar-account-manage').exists()).toBeTruthy()
    })
    it('displays the logout button', () => {
      expect(wrapper.find('#oc-topbar-account-logout').exists()).toBeTruthy()
    })
  })
  describe('when userId is empty', () => {
    const wrapper = shallowMount(UserMenu, {
      localVue,
      stubs,
      propsData: {
        userId: '',
        userDisplayName: 'Albert Einstein'
      }
    })
    it('does not display the avatar', () => {
      expect(wrapper.find('.oc-topbar-personal-avatar').exists()).toBeFalsy()
      expect(wrapper.find('.oc-topbar-personal-label').exists()).toBeFalsy()
    })
    it('does not display the profile link', () => {
      expect(wrapper.find('#oc-topbar-account-manage').exists()).toBeFalsy()
    })
    it('does not display the logout button', () => {
      expect(wrapper.find('#oc-topbar-account-logout').exists()).toBeFalsy()
    })
  })
  describe('methods', () => {
    const store = new Store({})
    beforeEach(() => {
      store.reset()
    })
    const wrapper = mount(UserMenu, {
      localVue,
      stubs: { ...stubs, 'router-link': true, 'oc-button': false },
      propsData: {
        userId: 'einstein',
        userDisplayName: 'Albert Einstein'
      },
      mocks: {
        $store: store
      }
    })

    it('does logout', () => {
      wrapper.find('#oc-topbar-account-logout').trigger('click')
      jest.runAllTimers()
      expect(store.dispatch).toHaveBeenCalledWith('logout')
      expect(wrapper.vm.visible).toBeFalsy()
    })
  })
})
