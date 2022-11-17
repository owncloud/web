import { shallowMount } from '@vue/test-utils'

import Table from './OcTableSimple.vue'

describe('OcTableSimple', () => {
  it('adds hover', () => {
    const wrapper = shallowMount(Table, {
      propsData: {
        hover: true
      }
    })

    expect(wrapper.classes()).toContain('oc-table-simple-hover')
  })
})
