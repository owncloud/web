import { createStore, defaultPlugins, defaultStoreMockOptions, mount } from 'web-test-helpers'
import ResourceTiles from 'web-app-files/src/components/FilesList/ResourceTiles.vue'
import { sortFields } from 'web-app-files/src/helpers/ui/resourceTiles'

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
    const { wrapper } = getWrapper({ data: spacesResources })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('renders a footer slot', () => {
    const { wrapper } = getWrapper({}, { footer: 'Hello, ResourceTiles footer!' })
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('emits fileClick event upon click on tile', async () => {
    const { wrapper } = getWrapper({ data: spacesResources })
    await wrapper.find('oc-tile').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('emits update:selectedIds event on resource selection and sets the selection', () => {
    const { wrapper } = getWrapper({ data: spacesResources, selectedIds: [spacesResources[0].id] })
    wrapper.vm.toggleSelection(spacesResources[0])
    expect(wrapper.find('oc-tile').attributes()['is-resource-selected']).toEqual('true')
    expect(wrapper.emitted('update:selectedIds')).toBeTruthy()
  })

  describe('sorting', () => {
    it('renders the label of the first sort field as default', () => {
      const { wrapper } = getWrapper({ sortFields })
      expect(wrapper.find('#oc-tiles-sort-btn').text()).toEqual(sortFields[0].label)
    })
    it('renders the label of the current sort field as default', () => {
      const sortField = sortFields[2]
      const { wrapper } = getWrapper({
        sortFields,
        sortBy: sortField.name,
        sortDir: sortField.sortDir
      })
      expect(wrapper.find('#oc-tiles-sort-btn').text()).toEqual(sortField.label)
    })
    it('emits the "sort"-event', async () => {
      const index = 2
      const { wrapper } = getWrapper({ sortFields })
      await wrapper.findAll('.oc-tiles-sort-list-item').at(index).trigger('click')
      expect(wrapper.emitted('sort')).toBeTruthy()
      expect(wrapper.emitted('sort')[0][0]).toEqual({
        sortBy: sortFields[index].name,
        sortDir: sortFields[index].sortDir
      })
    })
  })

  it.each([
    { viewSize: 1, expected: 'xlarge' },
    { viewSize: 2, expected: 'xlarge' },
    { viewSize: 3, expected: 'xxlarge' },
    { viewSize: 4, expected: 'xxlarge' },
    { viewSize: 5, expected: 'xxxlarge' },
    { viewSize: 6, expected: 'xxxlarge' }
  ])('passes the "viewSize" to the OcTile component', (data) => {
    const { wrapper } = getWrapper({ data: spacesResources, viewSize: data.viewSize })
    expect(wrapper.find('oc-tile').attributes()['resource-icon-size']).toEqual(data.expected)
  })

  function getWrapper(props = {}, slots = {}) {
    const storeOptions = defaultStoreMockOptions
    const store = createStore(storeOptions)

    return {
      wrapper: mount(ResourceTiles, {
        props: {
          ...props
        },
        slots: {
          ...slots
        },
        global: {
          plugins: [...defaultPlugins({ designSystem: false }), store]
        }
      })
    }
  }
})
