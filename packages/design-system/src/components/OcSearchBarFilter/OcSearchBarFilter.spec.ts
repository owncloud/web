import { mount } from '@vue/test-utils'
import OcSearchBarFilter from './OcSearchBarFilter.vue'

describe('OcSearchBarFilter', () => {
  it('emits an event when an option is selected', () => {
    const locationOptions = [
      { id: 1, title: 'Option 1', enabled: true, default: false },
      { id: 2, title: 'Option 2', enabled: true, default: false }
    ]
    const wrapper = mount(OcSearchBarFilter, {
      propsData: {
        locationOptions
      }
    })
    const option = locationOptions[1]
    wrapper.vm.onOptionSelected(option)
    expect(wrapper.emitted('update:modelValue')[1]).toEqual([
      {
        value: option
      }
    ])
  })

  it('sets the currentSelection to the default option', () => {
    const locationOptions = [
      { id: 1, title: 'Option 1', enabled: true, default: true },
      { id: 2, title: 'Option 2', enabled: true, default: false }
    ]
    const wrapper = mount(OcSearchBarFilter, {
      propsData: {
        locationOptions
      }
    })

    expect(wrapper.vm.currentSelection).toEqual(locationOptions[0])
  })

  it('sets the currentSelection to the first enabled option if no default option is found', () => {
    const locationOptions = [
      { id: 1, title: 'Option 1', enabled: false, default: false },
      { id: 2, title: 'Option 2', enabled: true, default: false }
    ]
    const wrapper = mount(OcSearchBarFilter, {
      propsData: {
        locationOptions
      }
    })

    expect(wrapper.vm.currentSelection).toEqual(locationOptions[1])
  })

  it('updates the currentSelection when an option is selected', () => {
    const locationOptions = [
      { id: 1, title: 'Option 1', enabled: true, default: false },
      { id: 2, title: 'Option 2', enabled: true, default: false }
    ]
    const wrapper = mount(OcSearchBarFilter, {
      propsData: {
        locationOptions
      }
    })

    const option = locationOptions[1]
    wrapper.vm.onOptionSelected(option)

    expect(wrapper.vm.currentSelection).toEqual(option)
  })
})
