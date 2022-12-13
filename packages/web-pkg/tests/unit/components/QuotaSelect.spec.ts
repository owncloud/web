import QuotaSelect from 'web-pkg/src/components/QuotaSelect.vue'
import { shallowMount } from 'web-test-helpers'

afterEach(() => jest.clearAllMocks())

describe('QuotaSelect', () => {
  describe('method "optionSelectable"', () => {
    it('should return true while option selectable property is not false', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.optionSelectable({ selectable: true })).toBeTruthy()
      expect(wrapper.vm.optionSelectable({})).toBeTruthy()
    })
    it('should return true while option selectable property is false', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.optionSelectable({ unlimited: true })).toBeTruthy()
    })
  })
  describe('method "createOption"', () => {
    it('should create option', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.createOption('11')).toEqual({
        displayValue: '11',
        displayUnit: 'GB',
        value: 11 * Math.pow(10, 9)
      })
    })
    it('should contain error property while maxQuota will be exceeded', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.createOption('2000')).toHaveProperty('error')
    })
    it('should contain error property while creating an invalid option', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.createOption('lorem ipsum')).toHaveProperty('error')
      expect(wrapper.vm.createOption('1,')).toHaveProperty('error')
      expect(wrapper.vm.createOption('1.')).toHaveProperty('error')
    })
  })
  describe('method "setOptions"', () => {
    it('should set options to default options', () => {
      const { wrapper } = getWrapper()
      wrapper.vm.setOptions()
      expect(wrapper.vm.options).toEqual(wrapper.vm.DEFAULT_OPTIONS)
    })
    it('should contain default options and user defined option if set', () => {
      const { wrapper } = getWrapper({ totalQuota: 45 * Math.pow(10, 9) })
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
  return {
    wrapper: shallowMount(QuotaSelect, {
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
      props: {
        totalQuota,
        maxQuota: 100 * Math.pow(10, 9),
        title: 'Personal quota'
      }
    })
  }
}
