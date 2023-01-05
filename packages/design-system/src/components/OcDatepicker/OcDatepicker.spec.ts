import Datepicker from './OcDatepicker.vue'
import { mount } from 'web-test-helpers'

describe('OcDatePicker', () => {
  it('renders default scoped slot', () => {
    const slotDefault = "<button id='default-slot'>Open datepicker</button>"
    const wrapper = mount(Datepicker, {
      slots: { default: slotDefault },
      props: { value: null },
      global: {
        renderStubDefaultSlot: true
      }
    })
    expect(wrapper.find('#default-slot').exists()).toBeTruthy()
  })
})
