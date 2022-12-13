import UsersList from '../../../../src/components/Groups/GroupsList.vue'
import { shallowMount } from 'web-test-helpers'

describe('GroupsList', () => {
  describe('method "orderBy"', () => {
    it('should return an ascending ordered list while desc is set to false', () => {
      const { wrapper } = getMountedWrapper()

      expect(
        wrapper.vm.orderBy(
          [{ displayName: 'users' }, { displayName: 'admins' }],
          'displayName',
          false
        )
      ).toEqual([{ displayName: 'admins' }, { displayName: 'users' }])
    })
    it('should return an descending ordered list while desc is set to true', () => {
      const { wrapper } = getMountedWrapper()

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
      const { wrapper } = getMountedWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'users' }, { displayName: 'admins' }], 'ad')
      ).toEqual([{ displayName: 'admins' }])
    })
    it('should return an an empty list if search term does not match any entry', () => {
      const { wrapper } = getMountedWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'admins' }, { displayName: 'users' }], 'ownClouders')
      ).toEqual([])
    })
  })
})

function getMountedWrapper({ propsData = {} } = {}) {
  return {
    wrapper: shallowMount(UsersList, {
      props: {
        groups: [],
        selectedGroups: [],
        headerPosition: 0,
        ...propsData
      }
    })
  }
}
