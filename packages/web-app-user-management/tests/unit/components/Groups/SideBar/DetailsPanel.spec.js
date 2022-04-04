import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import DetailsPanel from '../../../../../src/components/Groups/SideBar/DetailsPanel.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('DetailsPanel', () => {
  describe('computed method "group"', () => {
    it('should be set if only one group is given', () => {
      const wrapper = getWrapper({ propsData: { groups: [{ displayName: 'group' }] } })
      expect(wrapper.vm.group).toEqual({ displayName: 'group' })
    })
    it('should not be set if no groups are given', () => {
      const wrapper = getWrapper({
        propsData: { groups: [] }
      })
      expect(wrapper.vm.group).toEqual(null)
    })
    it('should not be set if multiple groups are given', () => {
      const wrapper = getWrapper({
        propsData: { groups: [{ displayName: 'group1' }, { displayName: 'group2' }] }
      })
      expect(wrapper.vm.group).toEqual(null)
    })
  })

  describe('computed method "noGroups"', () => {
    it('should be true if no groups are given', () => {
      const wrapper = getWrapper({
        propsData: { groups: [] }
      })
      expect(wrapper.vm.noGroups).toBeTruthy()
    })
    it('should be false if groups are given', () => {
      const wrapper = getWrapper({ propsData: { groups: [{ displayName: 'group' }] } })
      expect(wrapper.vm.noGroups).toBeFalsy()
    })
  })

  describe('computed method "multipleGroups"', () => {
    it('should be false if no groups are given', () => {
      const wrapper = getWrapper({ propsData: { groups: [] } })
      expect(wrapper.vm.multipleGroups).toBeFalsy()
    })
    it('should be false if one group is given', () => {
      const wrapper = getWrapper({ propsData: { groups: [{ displayName: 'group' }] } })
      expect(wrapper.vm.multipleGroups).toBeFalsy()
    })
    it('should be true if multiple groups are given', () => {
      const wrapper = getWrapper({
        propsData: { groups: [{ displayName: 'group1' }, { displayName: 'group2' }] }
      })
      expect(wrapper.vm.multipleGroups).toBeTruthy()
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
      ...propsData
    },
    stubs: {
      'avatar-image': true,
      'oc-icon': true
    }
  })
}
