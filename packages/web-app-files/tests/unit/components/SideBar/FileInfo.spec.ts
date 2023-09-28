import FileInfo from 'web-app-files/src/components/SideBar/FileInfo.vue'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  shallowMount,
  defaultStoreMockOptions,
  RouteLocation
} from 'web-test-helpers'
import { mock } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'

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
  const file = mock<Resource>({
    name: 'someFolder',
    webDavPath: '',
    type: 'folder',
    extension: ''
  })
  const storeOptions = { ...defaultStoreMockOptions }
  storeOptions.getters.capabilities.mockImplementation(() => ({ files: { privateLinks: true } }))
  const store = createStore(storeOptions)
  return {
    wrapper: shallowMount(FileInfo, {
      global: {
        plugins: [...defaultPlugins(), store],
        provide: {
          resource: file
        },
        mocks: {
          ...defaultComponentMocks({ currentRoute: mock<RouteLocation>({ path: '/files' }) })
        }
      }
    })
  }
}
