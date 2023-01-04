import { shallowMount } from 'web-test-helpers'
import Cell from './_OcTableCell.vue'

describe('OcTableCell', () => {
  it('Uses correct element', () => {
    const wrapper = shallowMount(Cell, {
      props: {
        type: 'th',
        alignH: 'right',
        alignV: 'bottom',
        width: 'shrink'
      },
      slots: {
        default: 'Hello world!'
      }
    })

    expect(wrapper).toMatchSnapshot()
  })
})
