import { defaultPlugins, shallowMount } from 'web-test-helpers'
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
      props: {
        variation: 'lead',
        items
      },
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] }
    })

    expect(wrapper.props().variation).toMatch('lead')
    expect(wrapper.classes()).toContain('oc-breadcrumb-lead')
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('displays all items', () => {
    const wrapper = shallowMount(Breadcrumb, {
      props: {
        items
      },
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] }
    })

    expect(wrapper.findAll('.oc-breadcrumb-list-item').length).toBe(items.length)
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('displays context menu trigger if enabled via property', () => {
    const wrapper = shallowMount(Breadcrumb, {
      props: {
        items,
        showContextActions: true
      },
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] }
    })

    expect(wrapper.find('#oc-breadcrumb-contextmenu-trigger').exists()).toBe(true)
  })
  it('does not display context menu trigger if not enabled via property', () => {
    const wrapper = shallowMount(Breadcrumb, {
      props: {
        items,
        showContextActions: false
      },
      global: { renderStubDefaultSlot: true, plugins: [...defaultPlugins()] }
    })

    expect(wrapper.find('#oc-breadcrumb-contextmenu-trigger').exists()).toBe(false)
  })
})
