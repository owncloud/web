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

  describe('method "orderBy"', () => {
    it('should return an ascending ordered list while desc is set to false', () => {
      const wrapper = getWrapper()

      expect(
        wrapper.vm.orderBy(
          [{ displayName: 'user' }, { displayName: 'admin' }],
          'displayName',
          false
        )
      ).toEqual([{ displayName: 'admin' }, { displayName: 'user' }])
    })
    it('should return an descending ordered list while desc is set to true', () => {
      const wrapper = getWrapper()

      expect(
        wrapper.vm.orderBy([{ displayName: 'admin' }, { displayName: 'user' }], 'displayName', true)
      ).toEqual([{ displayName: 'user' }, { displayName: 'admin' }])
    })
  })

  describe('method "filter"', () => {
    it('should return a list containing record admin if search term is "ad"', () => {
      const wrapper = getWrapper()

      expect(wrapper.vm.filter([{ displayName: 'user' }, { displayName: 'admin' }], 'ad')).toEqual([
        { displayName: 'admin' }
      ])
    })
    it('should return an an empty list if search term does not match any entry', () => {
      const wrapper = getWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'admin' }, { displayName: 'user' }], 'jana')
      ).toEqual([])
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
