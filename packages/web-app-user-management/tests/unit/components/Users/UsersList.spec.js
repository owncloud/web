import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import UsersList from '../../../../src/components/Users/UsersList'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('UsersList', () => {
  describe('computed method "allUsersSelected"', () => {
    it('should be true if all users are selected', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1', displayName: 'jan' }],
          selectedUsers: [{ id: '1', displayName: 'jan' }]
        }
      })
      expect(wrapper.vm.allUsersSelected).toBeTruthy()
    })
    it('should be false if not every user is selected', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1', displayName: 'jan' }],
          selectedUsers: []
        }
      })
      expect(wrapper.vm.allUsersSelected).toBeFalsy()
    })
  })

  describe('method "getUserRole"', () => {
    it('should return user role if record is set', () => {
      const wrapper = getWrapper({
        propsData: {
          userRoles: { 1: { displayName: 'admin' } }
        }
      })
      expect(wrapper.vm.getUserRole({ id: 1 })).toEqual('admin')
    })
    it('should return empty string if record is not set', () => {
      const wrapper = getWrapper({
        propsData: {
          users: [{ id: '1', displayName: 'jan' }],
          userRoles: {}
        }
      })
      expect(wrapper.vm.getUserRole({ id: 1 })).toEqual('')
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return mount(UsersList, {
    localVue,
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    propsData: {
      users: [],
      userRoles: {},
      selectedUsers: [],
      ...propsData
    },
    stubs: {
      'avatar-image': true,
      'oc-checkbox': true,
      'oc-button': true,
      'oc-table': { template: '<div></div>' }
    }
  })
}
