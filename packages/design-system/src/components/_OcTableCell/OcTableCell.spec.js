import { shallowMount } from '@vue/test-utils'
import Cell from './_OcTableCell.vue'

describe('OcTableCell', () => {
  it('Uses correct element', () => {
    const wrapper = shallowMount(Cell, {
      propsData: {
        type: 'th',
        alignH: 'right',
        alignV: 'bottom',
        width: 'shrink'
      },
      slots: {
        deafult: 'Hello world!'
      }
    })

    expect(wrapper.element.tagName).toBe('TH')
    expect(wrapper.classes()).toContain('oc-table-cell-align-right')
    expect(wrapper.classes()).toContain('oc-table-cell-align-bottom')
    expect(wrapper.classes()).toContain('oc-table-cell-width-shrink')
    expect(wrapper).toMatchSnapshot()
  })
})
