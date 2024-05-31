import { defineComponent } from 'vue'
import Datepicker from './OcDatepicker.vue'
import { mount } from 'web-test-helpers'

const DatePickerComponent = defineComponent({
  template: '<div id="foo"><slot></slot></div>'
})

describe('OcDatePicker', () => {
  it('renders default scoped slot', () => {
    const slotDefault = "<button id='default-slot'>Open datepicker</button>"
    const wrapper = mount(Datepicker, {
      slots: { default: slotDefault },
      props: { value: null },
      global: {
        renderStubDefaultSlot: true,
        stubs: { DatePicker: DatePickerComponent }
      }
    })

    expect(wrapper.find('#default-slot').exists()).toBeTruthy()
  })
})
