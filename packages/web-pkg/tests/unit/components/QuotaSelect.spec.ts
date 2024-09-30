import QuotaSelect from '../../../src/components/QuotaSelect.vue'
import { defaultPlugins, shallowMount } from 'web-test-helpers'

describe('QuotaSelect', () => {
  describe('method "optionSelectable"', () => {
    it('should return true while option selectable property is not false', () => {
      const { wrapper } = getWrapper()
      expect(
        wrapper.vm.optionSelectable({ value: 1, displayValue: '', selectable: true })
      ).toBeTruthy()
      expect(wrapper.vm.optionSelectable({ value: 1, displayValue: '' })).toBeTruthy()
    })
    it('should return false while option selectable property is false', () => {
      const { wrapper } = getWrapper()
      expect(
        wrapper.vm.optionSelectable({ value: 1, displayValue: '', selectable: false })
      ).toBeFalsy()
    })
  })
  describe('method "createOption"', () => {
    it('should create option', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.createOption('3')).toEqual({
        displayValue: '3 GiB',
        value: 3 * Math.pow(2, 30)
      })
    })
    it('should contain error property while maxQuota will be exceeded', () => {
      const { wrapper } = getWrapper({ maxQuota: 3 * Math.pow(2, 30) })
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
      const { wrapper } = getWrapper({ totalQuota: 45 * Math.pow(2, 30) })
      wrapper.vm.setOptions()
      expect(wrapper.vm.options).toEqual(
        expect.arrayContaining([
          ...wrapper.vm.DEFAULT_OPTIONS,
          {
            displayValue: '45 GiB',
            value: 45 * Math.pow(2, 30),
            selectable: true
          }
        ])
      )
    })
    it('should only contain lower or equal options when max quota is set', () => {
      const { wrapper } = getWrapper({
        totalQuota: 2 * Math.pow(10, 9),
        maxQuota: 4 * Math.pow(10, 9)
      })
      wrapper.vm.setOptions()
      expect(wrapper.vm.options).toEqual(
        expect.arrayContaining([
          {
            displayValue: '1 GiB',
            value: Math.pow(2, 30)
          },
          {
            displayValue: '2 GiB',
            value: 2 * Math.pow(2, 30)
          }
        ])
      )
    })
    it('should contain a non selectable option if preset quota is higher than max quota', () => {
      const { wrapper } = getWrapper({
        totalQuota: 100 * Math.pow(2, 30),
        maxQuota: 4 * Math.pow(2, 30)
      })
      wrapper.vm.setOptions()
      expect(wrapper.vm.options).toEqual(
        expect.arrayContaining([
          {
            displayValue: '1 GiB',
            value: Math.pow(2, 30)
          },
          {
            displayValue: '2 GiB',
            value: 2 * Math.pow(2, 30)
          },
          {
            displayValue: '100 GiB',
            value: 100 * Math.pow(2, 30),
            selectable: false
          }
        ])
      )
    })
  })
})

function getWrapper({ totalQuota = 10 * Math.pow(2, 30), maxQuota = 0 } = {}) {
  return {
    wrapper: shallowMount(QuotaSelect, {
      data: () => {
        return {
          selectedOption: {
            value: 10 * Math.pow(2, 30)
          },
          options: []
        }
      },
      props: {
        totalQuota,
        maxQuota,
        title: 'Personal quota'
      },
      global: {
        plugins: [...defaultPlugins()]
      }
    })
  }
}
