import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'
import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'
import stubs from 'tests/unit/stubs'
import { createStore } from 'vuex-extensions'

const localVue = createLocalVue()
localVue.use(Vuex)

afterEach(() => jest.clearAllMocks())

describe('QuotaSelect', () => {
  describe('method "optionSelectable"', () => {
    it('should return true while option is a number', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.optionSelectable({ value: 11 })).toBeTruthy()
      expect(wrapper.vm.optionSelectable({ value: 11.2 })).toBeTruthy()
    })
    it('should return true while option is unlimited', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.optionSelectable({ unlimited: true })).toBeTruthy()
    })
    it('should return false while option is not a number', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.optionSelectable({ value: null })).toBeFalsy()
      expect(wrapper.vm.optionSelectable({ value: 'lorem ipsum' })).toBeFalsy()
    })
  })
  describe('method "createOption"', () => {
    it('should create option', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.createOption('11')).toEqual({
        displayValue: '11',
        displayUnit: 'GB',
        value: 11 * Math.pow(10, 9)
      })
    })
    it('should remove unnecessary character while creating an option', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.createOption('11,')).toEqual({
        displayValue: '11',
        displayUnit: 'GB',
        value: 11 * Math.pow(10, 9)
      })
      expect(wrapper.vm.createOption('11.')).toEqual({
        displayValue: '11',
        displayUnit: 'GB',
        value: 11 * Math.pow(10, 9)
      })
    })
    it('should contain error property while creating an invalid option', () => {
      const wrapper = getWrapper()
      expect(wrapper.vm.createOption('a,')).toHaveProperty('error')
    })
  })
  describe('method "setOptions"', () => {
    it('should set options to default options', () => {
      const wrapper = getWrapper()
      wrapper.vm.setOptions()
      expect(wrapper.vm.options).toEqual(wrapper.vm.DEFAULT_OPTIONS)
    })
    it('should contain default options and user defined option if set', () => {
      const wrapper = getWrapper({ totalQuota: 45 * Math.pow(10, 9) })
      wrapper.vm.setOptions()
      expect(wrapper.vm.options).toEqual(
        expect.arrayContaining([
          ...wrapper.vm.DEFAULT_OPTIONS,
          {
            displayValue: '45',
            displayUnit: 'GB',
            value: 45 * Math.pow(10, 9)
          }
        ])
      )
    })
  })
})

function getWrapper({ totalQuota = 10000000000 } = {}) {
  return mount(QuotaSelect, {
    localVue,
    mocks: {
      $gettext: jest.fn(),
      $gettextInterpolate: jest.fn()
    },
    data: () => {
      return {
        selectedOption: {
          displayValue: '10',
          displayUnit: 'GB',
          value: 10 * Math.pow(10, 9)
        },
        options: []
      }
    },
    store: createStore(Vuex.Store, {}),
    propsData: {
      totalQuota,
      title: 'Personal quota'
    },
    stubs: { ...stubs, portal: true, 'oc-modal': true, 'oc-select': true }
  })
}
