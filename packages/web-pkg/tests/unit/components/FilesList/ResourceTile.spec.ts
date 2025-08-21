import { defaultPlugins, shallowMount } from '@ownclouders/web-test-helpers'
import { RouteLocationRaw } from 'vue-router'
import { SpaceResource, Resource } from '@ownclouders/web-client'
import ResourceTile from '../../../../src/components/FilesList/ResourceTile.vue'

type TypeIconSize = 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge'
interface Props {
  resource: SpaceResource | Resource
  resourceRoute?: RouteLocationRaw | null
  isResourceSelected?: boolean
  isResourceClickable?: boolean
  isResourceDisabled?: boolean
  isExtensionDisplayed?: boolean
  resourceIconSize?: TypeIconSize
  lazy?: boolean
}
const getSpaceMock = (disabled = false) => ({
  id: 'lorem-id',
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
  it('should emit click event when resource is clicked', () => {
    const wrapper = getWrapper({ resource: getSpaceMock(), isResourceSelected: true })
    const resourceLink = wrapper.find('resource-link-stub')
    resourceLink.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
  it.each(['xlarge, xxlarge, xxxlarge'])(
    'renders resource icon size correctly',
    (resourceIconSize) => {
      const wrapper = getWrapper({
        resource: getSpaceMock(),
        resourceIconSize: resourceIconSize as TypeIconSize
      })
      expect(wrapper.find('resource-icon-stub').attributes().size).toEqual(resourceIconSize)
    }
  )

  function getWrapper(props: Props) {
    return shallowMount(ResourceTile, {
      props,
      global: { plugins: [...defaultPlugins()], renderStubDefaultSlot: true }
    })
  }
})
