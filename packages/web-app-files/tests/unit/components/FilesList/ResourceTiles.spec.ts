import { defaultPlugins, mount } from 'web-test-helpers'
import ResourceTiles from '../../../../src/components/FilesList/ResourceTiles.vue'

const spacesResources = [
  {
    id: '1',
    name: 'Space 1',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '1'
  },
  {
    id: '2',
    name: 'Space 2',
    path: '',
    type: 'space',
    isFolder: true,
    getDriveAliasAndItem: () => '2'
  }
]

describe('ResourceTiles component', () => {
  it('renders an array of spaces correctly', () => {
    const wrapper = getWrapper({ data: spacesResources })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders a footer slot', () => {
    const wrapper = getWrapper({}, { footer: 'Hello, ResourceTiles footer!' })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('emits fileClick event upon click on tile', async () => {
    const wrapper = getWrapper({ data: spacesResources })
    await wrapper.find('oc-tile').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits update:selectedIds event on resource selection and sets the selection', () => {
    const wrapper = getWrapper({ data: spacesResources, selectedIds: [spacesResources[0].id] })
    wrapper.vm.setSelection(spacesResources[0])
    expect(wrapper.find('oc-tile').attributes()['is-resource-selected']).toEqual('true')
    expect(wrapper.emitted('update:selectedIds')).toBeTruthy()
  })

  function getWrapper(props = {}, slots = {}) {
    return mount(ResourceTiles, {
      props: {
        ...props
      },
      slots: {
        ...slots
      },
      global: {
        plugins: [...defaultPlugins({ designSystem: false })]
      }
    })
  }
})
