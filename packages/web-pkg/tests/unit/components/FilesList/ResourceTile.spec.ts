import { defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import ResourceTile from '../../../../src/components/FilesList/ResourceTile.vue'

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
    const wrapper = getWrapper({ resource: getSpaceMock(true), isResourceDisabled: true })
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('renders selected resource correctly', () => {
    const wrapper = getWrapper({ resource: getSpaceMock(), isResourceSelected: true })
    expect(wrapper.find('.oc-tile-card-selected').exists()).toBeTruthy()
  })
  it.each(['xlarge, xxlarge, xxxlarge'])(
    'renders resource icon size correctly',
    (resourceIconSize) => {
      const wrapper = getWrapper({ resource: getSpaceMock(), resourceIconSize })
      expect(wrapper.find('resource-icon-stub').attributes().size).toEqual(resourceIconSize)
    }
  )

  function getWrapper(props = {}) {
    return shallowMount(ResourceTile, {
      props,
      global: { plugins: [...defaultPlugins()], renderStubDefaultSlot: true }
    })
  }
})
