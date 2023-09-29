import CreateSpace from '../../../../src/components/AppBar/CreateSpace.vue'
import { mockDeep } from 'jest-mock-extended'
import { Resource } from '@ownclouders/web-client'
import { Drive } from '@ownclouders/web-client/src/generated'
import {
  createStore,
  defaultPlugins,
  mount,
  defaultStoreMockOptions,
  defaultComponentMocks
} from 'web-test-helpers'

const selectors = {
  newSpaceBtn: '#new-space-menu-btn'
}

describe('CreateSpace component', () => {
  it('should show the "New Space" button', () => {
    const { wrapper } = getWrapper()
    expect(wrapper.find(selectors.newSpaceBtn).exists()).toBeTruthy()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should show a modal when clicking the "New Space" button', async () => {
    const { wrapper, storeOptions } = getWrapper()
    await wrapper.find(selectors.newSpaceBtn).trigger('click')
    expect(storeOptions.actions.createModal).toHaveBeenCalledTimes(1)
  })
  describe('method "addNewSpace"', () => {
    it('creates the space and updates the readme data after creation', async () => {
      const { wrapper, mocks, storeOptions } = getWrapper()
      const graphMock = mocks.$clientService.graphAuthenticated
      const drive = mockDeep<Drive>()
      graphMock.drives.createDrive.mockResolvedValue(drive as any)
      graphMock.drives.updateDrive.mockResolvedValue(drive as any)
      mocks.$clientService.webdav.putFileContents.mockResolvedValue(mockDeep<Resource>())
      await wrapper.vm.addNewSpace('New space')
      expect(storeOptions.modules.runtime.modules.spaces.mutations.UPSERT_SPACE).toHaveBeenCalled()
    })
    it('shows a message when an error occurred', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const { wrapper, mocks, storeOptions } = getWrapper()
      const graphMock = mocks.$clientService.graphAuthenticated
      graphMock.drives.createDrive.mockRejectedValue({})
      await wrapper.vm.addNewSpace('New space')
      expect(storeOptions.actions.showErrorMessage).toHaveBeenCalled()
    })
  })
})

function getWrapper() {
  const storeOptions = { ...defaultStoreMockOptions }
  const store = createStore(storeOptions)
  const mocks = defaultComponentMocks()
  return {
    storeOptions,
    mocks,
    wrapper: mount(CreateSpace, {
      global: {
        mocks,
        provide: mocks,
        plugins: [...defaultPlugins(), store]
      }
    })
  }
}
