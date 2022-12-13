import Delete from 'web-app-files/src/mixins/spaces/actions/delete.js'
import { buildSpace } from 'web-client/src/helpers'
import {
  createStore,
  defaultComponentMocks,
  defaultPlugins,
  mockAxiosResolve,
  mount
} from 'web-test-helpers'
import { mockDeep } from 'jest-mock-extended'
import { clientService } from 'web-pkg'
import { Graph } from 'web-client'
import { defaultStoreMockOptions } from 'web-test-helpers/src/mocks/store/defaultStoreMockOptions'

const Component = {
  template: '<div></div>',
  mixins: [Delete]
}

describe('delete', () => {
  afterEach(() => jest.clearAllMocks())

  describe('isEnabled property', () => {
    it('should be false when not resource given', () => {
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [] })).toBe(false)
    })
    it('should be false when the space is not disabled', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }]
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        false
      )
    })
    it('should be true when the space is disabled', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['manager'], grantedTo: [{ user: { id: 1 } }] }],
          deleted: { state: 'trashed' }
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        true
      )
    })
    it('should be false when the current user is a viewer', () => {
      const spaceMock = {
        id: '1',
        root: {
          permissions: [{ roles: ['viewer'], grantedTo: [{ user: { id: 1 } }] }],
          deleted: { state: 'trashed' }
        }
      }
      const { wrapper } = getWrapper()
      expect(wrapper.vm.$_delete_items[0].isEnabled({ resources: [buildSpace(spaceMock)] })).toBe(
        false
      )
    })
  })

  describe('method "$_delete_trigger"', () => {
    it('should trigger the delete modal window', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({ resources: [{ id: 1 }] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(1)
    })
    it('should not trigger the delete modal window without any resource', async () => {
      const { wrapper } = getWrapper()
      const spyCreateModalStub = jest.spyOn(wrapper.vm, 'createModal')
      await wrapper.vm.$_delete_trigger({ resources: [] })

      expect(spyCreateModalStub).toHaveBeenCalledTimes(0)
    })
  })

  describe('method "$_delete_deleteSpace"', () => {
    it('should hide the modal and show message on success', async () => {
      const graphMock = mockDeep<Graph>()
      graphMock.drives.deleteDrive.mockResolvedValue(mockAxiosResolve())
      const { wrapper } = getWrapper(graphMock)
      const hideModalStub = jest.spyOn(wrapper.vm, 'hideModal')
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpace(1)

      expect(hideModalStub).toHaveBeenCalledTimes(1)
      expect(showMessageStub).toHaveBeenCalledTimes(1)
    })

    it('should show message on error', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => undefined)
      const graphMock = mockDeep<Graph>()
      graphMock.drives.deleteDrive.mockRejectedValue(new Error())
      const { wrapper } = getWrapper(graphMock)
      const showMessageStub = jest.spyOn(wrapper.vm, 'showMessage')
      await wrapper.vm.$_delete_deleteSpace(1)

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
