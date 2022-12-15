import { shallowMount } from '@vue/test-utils'
import Breadcrumb from './OcBreadcrumb.vue'

const items = [
  { text: 'First folder', to: { path: 'folder' } },
  { text: 'Subfolder', onClick: () => alert('Breadcrumb clicked!') },
  { text: 'Deep', to: { path: 'folder' } },
  { text: 'Deeper ellipsize in responsive mode' }
]

describe('OcBreadcrumb', () => {
  it('sets correct variation', () => {
    const wrapper = shallowMount(Breadcrumb, {
      propsData: {
        variation: 'lead',
        items
      }
    })

    expect(wrapper.props().variation).toMatch('lead')
    expect(wrapper.classes()).toContain('oc-breadcrumb-lead')
    expect(wrapper).toMatchSnapshot()
  })
  it('displays all items', () => {
    const wrapper = shallowMount(Breadcrumb, {
      propsData: {
        items
      }
    })

    expect(wrapper.findAll('.oc-breadcrumb-list-item').length).toBe(items.length)
    expect(wrapper).toMatchSnapshot()
  })
  it('displays context menu trigger when a slot is given', () => {
    const wrapper = shallowMount(Breadcrumb, {
      propsData: {
        items
      },
      slots: {
        contextMenu: 'Example item'
      }
    })

    expect(wrapper.find('#oc-breadcrumb-contextmenu-trigger').exists()).toBe(true)
  })
  it('does not display context menu trigger when no slot given', () => {
    const wrapper = shallowMount(Breadcrumb, {
      propsData: {
        items
      }
    })

    expect(wrapper.find('#oc-breadcrumb-contextmenu-trigger').exists()).toBe(false)
  })
})
