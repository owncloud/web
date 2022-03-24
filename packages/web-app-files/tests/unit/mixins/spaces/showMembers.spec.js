import Vuex from 'vuex'
import { createStore } from 'vuex-extensions'
import { mount, createLocalVue } from '@vue/test-utils'
import ShowMembers from '@files/src/mixins/spaces/actions/showMembers.js'
import { openSpaceMembersPanel } from '../../../../src/quickActions'
const quickActions = '../../../../src/quickActions'

jest.mock(quickActions, () => ({
  ...jest.requireActual(quickActions),
  openSpaceMembersPanel: jest.fn(() => false)
}))

const localVue = createLocalVue()
localVue.use(Vuex)

const Component = {
  render() {},
  mixins: [ShowMembers]
}

describe('showMembers', () => {
  describe('isEnabled property', () => {
    it('should be false when no resource given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_showMembers_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be true when a resource is given', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.$_showMembers_items[0].isEnabled({ resources: [{ id: 1 }] })).toBe(true)
    })
  })
  describe('method "$_showMembers_trigger"', () => {
    it('should trigger the members panel for one resource', async () => {
      const wrapper = getWrapper()
      await wrapper.vm.$_showMembers_trigger({ resources: [{ id: 1 }] })
      expect(openSpaceMembersPanel).toBeCalledTimes(1)
    })
  })
})

function getWrapper() {
  return mount(Component, {
    localVue,
    store: createStore(Vuex.Store, {
      modules: {
        Files: {
          namespaced: true,
          mutations: {
            SET_FILE_SELECTION: jest.fn()
          }
        }
      }
    })
  })
}
