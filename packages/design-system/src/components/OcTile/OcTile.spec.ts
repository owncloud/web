import { defaultPlugins, shallowMount } from 'web-test-helpers'
import OcTile from './OcTile.vue'

const getSpaceMock = (disabled = false) => ({
  name: 'Space 1',
  path: '',
  type: 'space',
  isFolder: true,
  disabled,
  getDriveAliasAndItem: () => '1'
})

describe('OcTile component', () => {
  it('renders default space correctly', () => {
    const wrapper = getWrapper({ resource: getSpaceMock() })
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('renders disabled space correctly', () => {
    const wrapper = getWrapper({ resource: getSpaceMock(true) })
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('renders selected resource correctly', () => {
    const wrapper = getWrapper({ resource: getSpaceMock(), isResourceSelected: true })
    expect(wrapper.find('.oc-tile-card-selected').exists()).toBeTruthy()
  })

  function getWrapper(props = {}) {
    return shallowMount(OcTile, {
      props,
      global: { plugins: [...defaultPlugins()], renderStubDefaultSlot: true }
    })
  }
})
