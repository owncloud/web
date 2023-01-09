import { shallowMount } from 'web-test-helpers'
import OcTile from './OcTile.vue'

const defaultSpace = {
  name: 'Space 1',
  path: '',
  type: 'space',
  isFolder: true,
  getDriveAliasAndItem: () => '1'
}
const disabledSpace = {
  name: 'Space 1',
  path: '',
  type: 'space',
  isFolder: true,
  disabled: true,
  getDriveAliasAndItem: () => '1'
}

describe('OcTile component', () => {
  it('renders default space correctly', () => {
    const wrapper = getWrapper({ resource: defaultSpace })
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('renders disabled space correctly', () => {
    const wrapper = getWrapper({ resource: disabledSpace })
    expect(wrapper.html()).toMatchSnapshot()
  })

  function getWrapper(props = {}, slots = {}) {
    return shallowMount(OcTile, {
      props: {
        ...props
      },
      global: { renderStubDefaultSlot: true }
    })
  }
})
