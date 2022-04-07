import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import DetailsPanel from '../../../../../src/components/Users/SideBar/DetailsPanel.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('DetailsPanel', () => {
  describe('computed method "user"', () => {
    it('should be set if only one user is given', () => {
      const wrapper = getWrapper({ propsData: { users: [{ displayName: 'user' }] } })
      expect(wrapper.vm.user).toEqual({ displayName: 'user' })
    })
    it('should not be set if no users are given', () => {
      const wrapper = getWrapper({
        propsData: { users: [] }
      })
      expect(wrapper.vm.user).toEqual(null)
    })
    it('should not be set if multiple users are given', () => {
      const wrapper = getWrapper({
        propsData: { users: [{ displayName: 'user1' }, { displayName: 'user2' }] }
      })
      expect(wrapper.vm.user).toEqual(null)
    })
  })

  describe('computed method "noUsers"', () => {
    it('should be true if no users are given', () => {
      const wrapper = getWrapper({
        propsData: { users: [] }
      })
      expect(wrapper.vm.noUsers).toBeTruthy()
    })
    it('should be false if users are given', () => {
      const wrapper = getWrapper({ propsData: { users: [{ displayName: 'user' }] } })
      expect(wrapper.vm.noUsers).toBeFalsy()
    })
  })

  describe('computed method "multipleUsers"', () => {
    it('should be false if no users are given', () => {
      const wrapper = getWrapper({ propsData: { users: [] } })
      expect(wrapper.vm.multipleUsers).toBeFalsy()
    })
    it('should be false if one user is given', () => {
      const wrapper = getWrapper({ propsData: { users: [{ displayName: 'user' }] } })
      expect(wrapper.vm.multipleUsers).toBeFalsy()
    })
    it('should be true if multiple users are given', () => {
      const wrapper = getWrapper({
        propsData: { users: [{ displayName: 'user1' }, { displayName: 'user2' }] }
      })
      expect(wrapper.vm.multipleUsers).toBeTruthy()
    })
  })

  describe('computed method "userRole"', () => {
    it('should be empty if no role is assigned', () => {
      const wrapper = getWrapper({
        propsData: { users: [{ id: '1', displayName: 'user' }], userRoles: {} }
      })
      expect(wrapper.vm.userRole).toEqual('')
    })
    it('should be set if user role is assigned', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1', displayName: 'user' }],
          userRoles: { 1: { displayName: 'admin' } }
        }
      })
      expect(wrapper.vm.userRole).toEqual('admin')
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return mount(DetailsPanel, {
    localVue,
    directives: {
      translate: jest.fn()
    },
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    propsData: {
      userRoles: {},
      ...propsData
    },
    stubs: {
      'avatar-image': true,
      'oc-icon': true
    }
  })
}
