import FileInfo from 'web-app-files/src/components/SideBar/FileInfo.vue'
import { createStore, defaultComponentMocks, defaultPlugins, shallowMount } from 'web-test-helpers'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from 'web-client'

const selectors = {
  name: '[data-testid="files-info-name"]'
}

describe('FileInfo', () => {
  it('shows file info', () => {
    const { wrapper } = createWrapper()
    expect(wrapper.find(selectors.name).exists()).toBeTruthy()
  })
})

function createWrapper() {
  const file = mockDeep<Resource>({
    name: 'someFolder',
    webDavPath: '',
    type: 'folder',
    extension: ''
  })
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.capabilities.mockImplementation(() => ({ files: { privateLinks: true } }))
  storeOptions.modules.Files.getters.highlightedFile.mockImplementation(() => file)
  const store = createStore(defaultStoreMockOptions)
  return {
    wrapper: shallowMount(FileInfo, {
      global: {
        plugins: [...defaultPlugins(), store],
        directives: {
          OcTooltip: jest.fn()
        },
        provide: {
          displayedItem: file
        },
        mocks: {
          ...defaultComponentMocks({ currentRoute: { path: '/files' } })
        }
      }
    })
  }
}
