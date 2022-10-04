import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import UsersList from '../../../../src/components/Groups/GroupsList'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('GroupsList', () => {
  describe('method "orderBy"', () => {
    it('should return an ascending ordered list while desc is set to false', () => {
      const wrapper = getMountedWrapper()

      expect(
        wrapper.vm.orderBy(
          [{ displayName: 'users' }, { displayName: 'admins' }],
          'displayName',
          false
        )
      ).toEqual([{ displayName: 'admins' }, { displayName: 'users' }])
    })
    it('should return an descending ordered list while desc is set to true', () => {
      const wrapper = getMountedWrapper()

      expect(
        wrapper.vm.orderBy(
          [{ displayName: 'admins' }, { displayName: 'users' }],
          'displayName',
          true
        )
      ).toEqual([{ displayName: 'users' }, { displayName: 'admins' }])
    })
  })

  describe('method "filter"', () => {
    it('should return a list containing record admins if search term is "ad"', () => {
      const wrapper = getMountedWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'users' }, { displayName: 'admins' }], 'ad')
      ).toEqual([{ displayName: 'admins' }])
    })
    it('should return an an empty list if search term does not match any entry', () => {
      const wrapper = getMountedWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'admins' }, { displayName: 'users' }], 'ownClouders')
      ).toEqual([])
    })
  })
})

function getMountedWrapper({ propsData = {} } = {}) {
  return mount(UsersList, {
    localVue,
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    propsData: {
      groups: [],
      selectedGroups: [],
      headerPosition: 0,
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
