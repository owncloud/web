import { shallowMount } from 'web-test-helpers'

import Datepicker from './OcDatepicker.vue'

const slotDefault = "<button id='default-slot'>Open datepicker</button>"

describe('OcDatePicker', () => {
  it('renders default scoped slot', () => {
    const wrapper = shallowMount(Datepicker, {
      slots: { default: slotDefault },
      props: { value: null }
    })

    expect(wrapper.find('#default-slot').exists()).toBeTruthy()
  })
})
