import GroupsList from '../../../../src/components/Groups/GroupsList.vue'
import { defaultComponentMocks, defaultPlugins, mount, shallowMount } from 'web-test-helpers'
import { displayPositionedDropdown, eventBus, queryItemAsString } from '@ownclouders/web-pkg'
import { SideBarEventTopics } from '@ownclouders/web-pkg'

const getGroupMocks = () => [
  { id: '1', members: [] },
  { id: '2', members: [] }
]

jest.mock('@ownclouders/web-pkg', () => ({
  ...jest.requireActual('@ownclouders/web-pkg/src/helpers'),
  displayPositionedDropdown: jest.fn()
}))

describe('GroupsList', () => {
  describe('method "orderBy"', () => {
    it('should return an ascending ordered list while desc is set to false', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.orderBy(
          [{ displayName: 'users' }, { displayName: 'admins' }],
          'displayName',
          false
        )
      ).toEqual([{ displayName: 'admins' }, { displayName: 'users' }])
    })
    it('should return an descending ordered list while desc is set to true', () => {
      const { wrapper } = getWrapper()

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
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'users' }, { displayName: 'admins' }], 'ad')
      ).toEqual([{ displayName: 'admins' }])
    })
    it('should return an an empty list if search term does not match any entry', () => {
      const { wrapper } = getWrapper()

      expect(
        wrapper.vm.filter([{ displayName: 'admins' }, { displayName: 'users' }], 'ownClouders')
      ).toEqual([])
    })
  })
  it('emits events on row click', () => {
    const groups = getGroupMocks()
    const { wrapper } = getWrapper({ props: { groups } })
    wrapper.vm.rowClicked([groups[0]])
    expect(wrapper.emitted('toggleSelectGroup')).toBeTruthy()
  })
  it('should show the context menu on right click', async () => {
    const groups = getGroupMocks()
    const spyDisplayPositionedDropdown = jest.mocked(displayPositionedDropdown)
    const { wrapper } = getWrapper({ mountType: mount, props: { groups } })
    await wrapper.find(`[data-item-id="${groups[0].id}"]`).trigger('contextmenu')
    expect(spyDisplayPositionedDropdown).toHaveBeenCalledTimes(1)
  })
  it('should show the context menu on context menu button click', async () => {
    const groups = getGroupMocks()
    const spyDisplayPositionedDropdown = jest.mocked(displayPositionedDropdown)
    const { wrapper } = getWrapper({ mountType: mount, props: { groups } })
    await wrapper.find('.groups-table-btn-action-dropdown').trigger('click')
    expect(spyDisplayPositionedDropdown).toHaveBeenCalledTimes(1)
  })
  it('should show the group details on details button click', async () => {
    const groups = getGroupMocks()
    const eventBusSpy = jest.spyOn(eventBus, 'publish')
    const { wrapper } = getWrapper({ mountType: mount, props: { groups } })
    await wrapper.find('.groups-table-btn-details').trigger('click')
    expect(eventBusSpy).toHaveBeenCalledWith(SideBarEventTopics.open)
  })
})

function getWrapper({ mountType = shallowMount, props = {} } = {}) {
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '1')
  jest.mocked(queryItemAsString).mockImplementationOnce(() => '100')
  const mocks = defaultComponentMocks()

  return {
    wrapper: mountType(GroupsList, {
      props: {
        groups: [],
        selectedGroups: [],
        headerPosition: 0,
        ...props
      },
      global: {
        plugins: [...defaultPlugins()],
        mocks,
        provide: mocks,
        stubs: {
          OcCheckbox: true
        }
      }
    })
  }
}
