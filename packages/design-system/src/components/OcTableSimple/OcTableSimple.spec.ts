import { shallowMount } from 'web-test-helpers'

import Table from './OcTableSimple.vue'

describe('OcTableSimple', () => {
  it('adds hover', () => {
    const wrapper = shallowMount(Table, {
      props: {
        hover: true
      }
    })

    expect(wrapper.classes()).toContain('oc-table-simple-hover')
  })
})
