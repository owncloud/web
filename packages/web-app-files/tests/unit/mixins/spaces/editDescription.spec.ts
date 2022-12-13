import EditDescription from 'web-app-files/src/mixins/spaces/actions/editDescription.js'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  mount
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { Graph } from 'web-client'
import { clientService } from 'web-pkg'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const Component = {
  template: '<div></div>',
  mixins: [EditDescription]
}

describe('editDescription', () => {
  afterEach(() => jest.clearAllMocks())

  describe('method "$_editDescription_trigger"', () => {
    it('should trigger the editDescription modal window with one resource', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_editDescription_trigger({ resources: [{ id: 1 }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the editDescription modal window with no resource', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_editDescription_trigger({ resources: [] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_editDescription_editDescriptionSpace"', () => {
    it('should hide the modal on success', async () => {
      const graphMock = mockDeep<Graph>()
      graphMock.drives.updateDrive.mockResolvedValue(mockAxiosResolve())
      const { wrapper } = getWrapper(graphMock)
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      await wrapper.vm.$_editDescription_editDescriptionSpace(1)

      expect(hideModalStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graphMock = mockDeep<Graph>()
      graphMock.drives.updateDrive.mockRejectedValue(new Error())
      const { wrapper } = getWrapper(graphMock)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_editDescription_editDescriptionSpace(1)

      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })
  })
})

function getWrapper(graphMock = mockDeep<Graph>()) {
  jest.spyOn(clientService, 'graphAuthenticated').mockImplementation(() => graphMock)
  const storeOptions = {
    ...defaultStoreMockOptions,
    modules: { ...defaultStoreMockOptions.modules, user: { state: { id: 'alice', uuid: 1 } } }
  }
  const store = createStore(storeOptions)
  return {
    wrapper: mount(Component, {
      global: {
        plugins: [...defaultPlugins(), store],
        mocks: defaultComponentMocks({ currentRoute: { name: 'files-spaces-projects' } })
      }
    })
  }
}
