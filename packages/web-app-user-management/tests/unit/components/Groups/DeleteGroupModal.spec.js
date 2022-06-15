import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import DeleteGroupModal from '../../../../src/components/Groups/DeleteGroupModal.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('DeleteGroupModal', () => {
  describe('computed method "title"', () => {
    it('should be singular if one group is given', () => {
      const wrapper = getWrapper({
        propsData: {
          groups: [{ id: '1' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete group %{group}?')
    })
    it('should be plural if multiple groups are given', () => {
      const wrapper = getWrapper({
        propsData: {
          groups: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.title).toEqual('Delete %{groupCount} selected groups?')
    })
  })

  describe('computed method "message"', () => {
    it('should be singular if one group is given', () => {
      const wrapper = getWrapper({
        propsData: {
          groups: [{ id: '1' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete this group?')
    })
    it('should be plural if multiple groups are given', () => {
      const wrapper = getWrapper({
        propsData: {
          groups: [{ id: '1' }, { id: '2' }]
        }
      })
      expect(wrapper.vm.message).toEqual('Are you sure you want to delete all selected groups?')
    })
  })
})

function getWrapper({ propsData = {} } = {}) {
  return mount(DeleteGroupModal, {
    localVue,
    propsData: {
      ...propsData
    },
    stubs: { 'oc-modal': true, 'oc-text-input': true },
    mocks: {
      $gettextInterpolate: (translation) => translation,
      $ngettext: (translationSingular, translationPlural, count) =>
        count > 1 ? translationPlural : translationSingular
    }
  })
}
