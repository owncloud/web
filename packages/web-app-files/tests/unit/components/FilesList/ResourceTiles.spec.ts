import { shallowMount } from 'web-test-helpers'
import ResourceTiles from '../../../../src/components/FilesList/ResourceTiles.vue'

const stubs = {
  'oc-list': true,
  'oc-tile': true
}

const spacesResources = [
  {
    name: 'Space 1',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '1'
  },
  {
    name: 'Space 2',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '2'
  }
]

describe('OcTileGrid component', () => {
  it('renders an array of spaces correctly', () => {
    const wrapper = getWrapper({ data: spacesResources })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders a footer slot', () => {
    const wrapper = getWrapper({}, { footer: 'Hello, OcTileGrid footer!' })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('emits context menu event upon right click on tile', async () => {
    const wrapper = getWrapper({ data: spacesResources })
    await wrapper.find('oc-tile-stub').trigger('contextmenu')
    expect(wrapper.emitted().contextmenuClicked.length).toBe(1)
  })

  function getWrapper(props = {}, slots = {}) {
    return shallowMount(ResourceTiles, {
      props: {
        ...props
      },
      slots: {
        ...slots
      },
      global: {
        stubs
      }
    })
  }
})
