import { shallowMount } from 'web-test-helpers'

import PageSize from './OcPageSize.vue'

const defaultProps = {
  options: [100, 500, 1000, 'All'],
  label: 'Items per page',
  selected: 100
}

describe('OcPageSize', () => {
  it('emits change event when value is selected', () => {
    const wrapper = shallowMount(PageSize, { props: defaultProps })

    wrapper.find('[data-testid="oc-page-size-select"]').vm.$emit('input', 500)

    expect(wrapper.emitted().change[0][0]).toEqual(500)
  })

  it('displays label', () => {
    const wrapper = shallowMount(PageSize, { props: defaultProps })
    const labelSelector = '[data-testid="oc-page-size-label"]'

    expect(wrapper.findAll(labelSelector).length).toEqual(1)
    expect(wrapper.find(labelSelector).text()).toEqual('Items per page')
  })
})
